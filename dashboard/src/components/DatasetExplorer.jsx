import React from 'react';
import { Database, ShieldCheck, Share2, Box, PieChart, Activity, HardDrive, Search, Filter, Info, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const DatasetExplorer = ({ shards = [], clientsActive = 0 }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState('All');
  
  // Show only shards that are actively being used by the connected nodes
  const fragments = shards.slice(0, clientsActive);

  const types = ['All', ...new Set(fragments.map(f => f.type))];

  const filteredFragments = fragments.filter(frag => {
    const matchesSearch = frag.org.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         frag.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || frag.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 p-10 flex flex-col gap-16 pb-32 section-fade">
      {/* Module Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-4">
           <div className="flex items-center gap-3 text-primary">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Module 03</span>
              <span className="w-8 h-px bg-primary/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Shard Registry</span>
           </div>
           <h2 className="text-4xl font-bold text-text-main serif">Dataset Distribution</h2>
           <p className="text-sm text-text-muted font-medium max-w-2xl">
             Registry of institutional data shards currently indexed for federated synchronization. All fragments are cryptographically hashed and verified against the audit ledger.
           </p>
        </div>
        
        <div className="flex gap-4">
           <div className="flex items-center gap-3 px-6 py-3 bg-bg-surface border border-border">
              <Database size={16} className="text-primary/40" />
              <span className="text-[10px] font-bold text-text-main uppercase tracking-widest tabular-nums">12.4 TB INDEXED</span>
           </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-border pb-6">
         <div className="flex items-center gap-12">
            <div className="flex items-center gap-3 group relative">
               <Search size={14} className={`${searchQuery ? 'text-primary' : 'text-text-muted'} group-hover:text-primary transition-colors`} />
               <input 
                 type="text"
                 placeholder="Search Shards..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="bg-transparent border-none outline-none text-[10px] font-bold text-text-main uppercase tracking-widest placeholder:text-text-muted/50 w-40"
               />
               <div className="absolute -bottom-6 left-0 w-full h-[1px] bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left" />
            </div>
            
            <div className="flex items-center gap-3 cursor-pointer group relative">
               <Filter size={14} className={`${filterType !== 'All' ? 'text-primary' : 'text-text-muted'} group-hover:text-primary transition-colors`} />
               <select 
                 value={filterType}
                 onChange={(e) => setFilterType(e.target.value)}
                 className="bg-transparent border-none outline-none text-[10px] font-bold text-text-muted uppercase tracking-widest appearance-none cursor-pointer hover:text-text-main transition-colors pr-4"
               >
                 {types.map(t => <option key={t} value={t} className="bg-white text-black py-2">{t}</option>)}
               </select>
               <div className="absolute -bottom-6 left-0 w-full h-[1px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </div>
         </div>
         <div className="flex items-center gap-3 text-text-muted italic">
            <Info size={12} />
            <span className="text-[10px] font-medium">Verified against Ledger Height: 48,291</span>
         </div>
      </div>

      {/* Registry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredFragments.length > 0 ? filteredFragments.map((frag, idx) => (
          <motion.div
            key={frag.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="academic-card group !p-0 overflow-hidden flex flex-col"
          >
            {/* Header Area */}
            <div className="p-8 border-b border-border bg-bg-main/30 flex justify-between items-start">
               <div>
                  <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mb-3 block">Fragment {frag.id}</span>
                  <h3 className="text-lg font-bold text-text-main serif uppercase tracking-tight">{frag.org}</h3>
               </div>
               <FileText size={18} className="text-border group-hover:text-primary/40 transition-colors" />
            </div>

            {/* Metrics Area */}
            <div className="p-8 space-y-10">
               <div className="space-y-4">
                  <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest">
                     <span className="text-text-muted">Shard Density</span>
                     <span className="text-text-main">{frag.density}%</span>
                  </div>
                  <div className="progress-bar-minimal">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${frag.density}%` }}
                        className="progress-bar-fill"
                     />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-px bg-border -mx-8 -mb-8">
                  <div className="bg-white p-6">
                     <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-1">Sample Count</span>
                     <span className="text-xs font-bold text-text-main tabular-nums">{(frag.size || 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-6 border-l border-border">
                     <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-2">Protocol</span>
                     <span className="text-xs font-bold text-text-main">{frag.type}</span>
                  </div>
               </div>
            </div>
            
            {/* Action Hover */}
            <div className="px-8 py-5 border-t border-border mt-auto flex items-center justify-between bg-bg-main/10 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{frag.date}</span>
               <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Download Metadata</button>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-20 border border-dashed border-border flex flex-col items-center justify-center bg-bg-main/20">
             <Box size={24} className="text-text-muted mb-4 opacity-20" />
             <span className="type-label text-text-muted">No institutional shards found matching criteria</span>
          </div>
        )}
      </div>
    </div>
  );
};
