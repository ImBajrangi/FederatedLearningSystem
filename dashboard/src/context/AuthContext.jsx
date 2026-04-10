import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getProfile, logActivity } from '../lib/supabaseDB';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSessionId, setActiveSessionId] = useState(null);

    // Fetch profile whenever user changes
    const fetchProfile = useCallback(async (userId) => {
        if (!userId || !supabase) return;
        try {
            const p = await getProfile(userId);
            setProfile(p);
        } catch (err) {
            console.warn('Profile fetch error:', err);
        }
    }, []);

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        // Handle OAuth callback — check for auth tokens in URL hash or query params
        const handleOAuthCallback = async () => {
            const hash = window.location.hash;
            const params = new URLSearchParams(window.location.search);

            // Supabase OAuth returns tokens in hash (#access_token=...) or query (?code=...)
            if (hash?.includes('access_token') || params.get('code')) {
                try {
                    const { data: { session }, error } = await supabase.auth.getSession();
                    if (session) {
                        setUser(session.user);
                        await fetchProfile(session.user.id);
                        logActivity(session.user.id, 'LOGIN', { method: 'google_oauth' });
                        // Clean URL after successful auth
                        window.history.replaceState(null, '', window.location.pathname);
                        setLoading(false);
                        return true;
                    }
                } catch (err) {
                    console.warn('OAuth callback processing error:', err);
                }
            }
            return false;
        };

        // Initial session check
        const checkUser = async () => {
            // First try to handle OAuth callback
            const handled = await handleOAuthCallback();
            if (handled) return;

            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    setUser(session.user);
                    await fetchProfile(session.user.id);
                    logActivity(session.user.id, 'SESSION_RESTORED', { method: 'auto' });
                }
            } catch (err) {
                console.warn("Auth session check failed:", err);
            }
            setLoading(false);
        };

        checkUser();

        // Listen for auth changes (handles redirect-based OAuth)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const u = session?.user ?? null;
            setUser(u);
            if (u) {
                await fetchProfile(u.id);
                if (_event === 'SIGNED_IN') {
                    logActivity(u.id, 'LOGIN', { method: 'session', provider: u.app_metadata?.provider });
                }
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription?.unsubscribe();
    }, [fetchProfile]);

    const login = async (email, password) => {
        if (!supabase) {
            console.log("Guardian Guest Mode: Logging in as", email);
            setUser({ email, guest: true });
            return { user: { email } };
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        logActivity(data.user.id, 'LOGIN', { method: 'password', email });
        return data;
    };

    const loginWithGoogle = async () => {
        if (!supabase) {
            setUser({ email: "guest@institution.edu", guest: true });
            return;
        }
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
                skipBrowserRedirect: false
            }
        });
        if (error) throw error;
        return data;
    };

    const register = async (email, password, metadata = {}) => {
        if (!supabase) throw new Error("Authentication service is not configured.");
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
                emailRedirectTo: window.location.origin
            }
        });
        if (error) throw error;
        if (data.user) {
            logActivity(data.user.id, 'REGISTER', { email, username: metadata.username });
        }
        return data;
    };

    const logout = async () => {
        if (user && !user.guest) {
            logActivity(user.id, 'LOGOUT');
        }
        if (!supabase) {
            setUser(null);
            setProfile(null);
            return;
        }
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Sign out error:', error.message);
        setUser(null);
        setProfile(null);
        setActiveSessionId(null);
    };

    // Helper: get display name
    const displayName = profile?.username
        || profile?.full_name
        || user?.user_metadata?.username
        || user?.email?.split('@')[0]
        || 'Researcher';

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            login,
            loginWithGoogle,
            register,
            logout,
            displayName,
            activeSessionId,
            setActiveSessionId,
            refreshProfile: () => user && fetchProfile(user.id)
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
