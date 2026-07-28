"use client";

import Link from "next/link";
import { 
  UploadCloud, 
  ArrowDownToLine, 
  FileText, 
  TrendingUp, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Star,
  Zap,
  Search,
  History,
  Trash2,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardProps } from "./types";

export function MobileDashboard({
  profile,
  notes,
  favorites,
  recentlyViewed,
  searchQuery,
  filteredNotes,
  handleClearHistory,
  isClearingHistory
}: DashboardProps) {

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const views = notes.reduce((sum, n) => sum + (n.view_count || 0), 0);
  const dls = notes.reduce((sum, n) => sum + (n.downloads_count || 0), 0);
  const saves = notes.reduce((sum, n) => sum + (n.bookmarks_count || 0), 0);
  
  const approved = notes.filter(n => n.status === "approved").length;
  const pending = notes.filter(n => n.status === "pending_review").length;
  const rejected = notes.filter(n => n.status === "rejected").length;
  
  const ratedApproved = notes.filter(n => n.status === "approved" && n.total_ratings > 0);
  const averageRating = ratedApproved.length > 0
    ? (ratedApproved.reduce((sum, n) => sum + (n.average_rating || 0), 0) / ratedApproved.length).toFixed(1)
    : "0.0";
  
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full min-w-0 pb-10"
    >
      {/* 1. Compact Premium Header */}
      <motion.div variants={itemVariants as any} className="flex flex-col gap-2 w-full min-w-0 bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 p-5 rounded-3xl border border-zinc-800/80 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4 pointer-events-none group-hover:bg-indigo-500/20 transition-colors duration-700" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 p-[2px] shadow-xl shadow-indigo-500/30 shrink-0">
            <div className="h-full w-full rounded-full bg-zinc-950 flex items-center justify-center font-black text-sm text-indigo-400 border border-zinc-900">
              {profile?.name?.charAt(0).toUpperCase() || "S"}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest flex items-center gap-1 bg-indigo-500/10 w-fit px-2 py-0.5 rounded-full border border-indigo-500/20 mb-1">
              <Star className="h-3 w-3 fill-indigo-400" /> {profile?.role || "Student"}
            </p>
            <h2 className="text-xl font-black text-white truncate tracking-tight">Hello, {profile?.name?.split(' ')[0] || "Student"}</h2>
          </div>
        </div>
        <div className="relative z-10 mt-4 border-t border-zinc-800/60 pt-4">
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            Study Command Center <Sparkles className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5 break-words whitespace-normal font-medium leading-relaxed max-w-sm">
            Your personalized hub for notes, AI tools, and insights.
          </p>
        </div>
      </motion.div>

      {/* 2. Quick Actions */}
      <motion.div variants={itemVariants as any} className="flex flex-col gap-3 w-full min-w-0 mt-2">
        <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-1.5 px-2">
          <Zap className="h-3.5 w-3.5 text-amber-400" /> Quick Actions
        </h3>
        <div className="flex flex-col gap-3">
          <Link href="/dashboard/upload" className="w-full">
            <Button className="w-full justify-start glow-border bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:via-violet-500 hover:to-violet-500 text-white font-black gap-3 text-sm py-7 rounded-2xl shadow-xl shadow-indigo-500/25 transition-all active:scale-[0.98]">
              <UploadCloud className="h-5 w-5 ml-2" /> Upload New Note
            </Button>
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/browse" className="w-full">
              <Button variant="outline" className="w-full glass-panel border-zinc-700/60 hover:bg-zinc-800/80 text-zinc-300 hover:text-white font-black text-sm py-6 rounded-2xl transition-all shadow-lg active:scale-[0.98]">
                <Search className="h-4.5 w-4.5 mr-2" /> Browse
              </Button>
            </Link>
            <Link href="/dashboard/study-copilot" className="w-full">
              <Button variant="outline" className="w-full glass-panel border-indigo-500/30 hover:border-indigo-500/50 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 font-black text-sm py-6 rounded-2xl transition-all shadow-lg active:scale-[0.98]">
                <Sparkles className="h-4.5 w-4.5 mr-2 text-indigo-400" /> Copilot
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 3. Contributor Stats / Impact */}
      <motion.div variants={itemVariants as any} className="flex flex-col gap-4 w-full min-w-0 mt-4">
        <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">
          Contributor Stats
        </h3>
        <div className="grid grid-cols-2 gap-3 w-full min-w-0">
          <div className="bg-zinc-900/60 p-5 border border-zinc-800/80 rounded-2xl flex flex-col gap-1 items-center justify-center shadow-lg relative overflow-hidden group border-t-indigo-500/30">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
             <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:scale-110 transition-transform"><FileText className="h-12 w-12 text-indigo-400"/></div>
             <span className="text-3xl font-black text-white relative z-10">{notes.length}</span>
             <span className="text-[9px] uppercase font-black text-indigo-400 tracking-widest relative z-10 mt-1">Uploads</span>
          </div>
          <div className="bg-zinc-900/60 p-5 border border-zinc-800/80 rounded-2xl flex flex-col gap-1 items-center justify-center shadow-lg relative overflow-hidden group border-t-violet-500/30">
             <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
             <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:scale-110 transition-transform"><ArrowDownToLine className="h-12 w-12 text-violet-400"/></div>
             <span className="text-3xl font-black text-white relative z-10">{dls}</span>
             <span className="text-[9px] uppercase font-black text-violet-400 tracking-widest relative z-10 mt-1">Downloads</span>
          </div>
          <div className="bg-zinc-900/60 p-5 border border-zinc-800/80 rounded-2xl flex flex-col gap-1 items-center justify-center shadow-lg relative overflow-hidden group border-t-pink-500/30">
             <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent pointer-events-none" />
             <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:scale-110 transition-transform"><TrendingUp className="h-12 w-12 text-pink-400"/></div>
             <span className="text-3xl font-black text-white relative z-10">{views}</span>
             <span className="text-[9px] uppercase font-black text-pink-400 tracking-widest relative z-10 mt-1">Views</span>
          </div>
          <div className="bg-zinc-900/60 p-5 border border-zinc-800/80 rounded-2xl flex flex-col gap-1 items-center justify-center shadow-lg relative overflow-hidden group border-t-amber-500/30">
             <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
             <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:scale-110 transition-transform"><Star className="h-12 w-12 text-amber-400"/></div>
             <span className="text-3xl font-black text-white relative z-10">{saves}</span>
             <span className="text-[9px] uppercase font-black text-amber-400 tracking-widest relative z-10 mt-1">Saves</span>
          </div>
        </div>

        {/* Detailed Status Breakdown */}
        <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-inner w-full min-w-0 mt-1">
           <div className="p-3.5 border-b border-zinc-800/60 flex items-center justify-between bg-zinc-900/30">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status Breakdown</span>
              {averageRating !== "0.0" && (
                <span className="flex items-center gap-1 text-[10px] font-black text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded shadow-inner">
                  <Star className="h-3 w-3 fill-yellow-500" />
                  {averageRating}
                </span>
              )}
           </div>
           <div className="divide-y divide-zinc-800/60">
             <div className="flex justify-between items-center py-3.5 px-4 text-sm hover:bg-zinc-900/50 transition-colors">
                <span className="text-zinc-300 font-bold flex items-center gap-2"><CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" /> Approved Notes</span>
                <span className="font-black text-emerald-400">{approved}</span>
             </div>
             <div className="flex justify-between items-center py-3.5 px-4 text-sm hover:bg-zinc-900/50 transition-colors">
                <span className="text-zinc-300 font-bold flex items-center gap-2"><Clock className="h-4.5 w-4.5 text-amber-400" /> Pending Review</span>
                <span className="font-black text-amber-400">{pending}</span>
             </div>
             <div className="flex justify-between items-center py-3.5 px-4 text-sm hover:bg-zinc-900/50 transition-colors">
                <span className="text-zinc-400 font-bold flex items-center gap-2"><AlertCircle className="h-4.5 w-4.5 text-red-400" /> Rejected Notes</span>
                <span className="font-black text-red-400">{rejected}</span>
             </div>
           </div>
        </div>
      </motion.div>

      {/* 4. Recent / Activity Sections */}
      <motion.div variants={itemVariants as any} className="flex flex-col gap-6 w-full min-w-0 mt-4">
        
        {/* Uploads Section */}
        <div className="flex flex-col gap-3 w-full min-w-0">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Recent Uploads</h3>
            <Link href="/dashboard/my-uploads" className="text-[10px] text-indigo-400 font-black uppercase tracking-wider hover:text-indigo-300">View All</Link>
          </div>
          <div className="flex flex-col gap-3">
            {filteredNotes.length === 0 ? (
              <div className="bg-zinc-950/40 border border-zinc-800/60 p-8 rounded-2xl text-center flex flex-col items-center justify-center w-full min-w-0 shadow-inner">
                <div className="bg-zinc-900 p-4 rounded-full border border-zinc-800 mb-3">
                  <FileText className="h-6 w-6 text-zinc-600" />
                </div>
                <p className="text-sm font-black text-zinc-300">No uploads yet</p>
                <p className="text-xs text-zinc-500 mt-1.5 max-w-[200px] break-words whitespace-normal font-medium">Share your first note to help others and track your stats.</p>
              </div>
            ) : (
              filteredNotes.slice(0, 3).map((note) => (
                <Link href={`/dashboard/my-uploads`} key={note.id} className="block group">
                  <div className="bg-zinc-900/40 border border-zinc-800/60 p-5 rounded-2xl flex flex-col gap-3 w-full min-w-0 relative overflow-hidden hover:bg-zinc-800/60 transition-colors shadow-md">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-black text-sm text-zinc-100 truncate group-hover:text-indigo-400 transition-colors">{note.title}</h4>
                        <p className="text-[10px] font-bold text-zinc-500 mt-1 truncate uppercase tracking-widest">Sem {note.semester} • {(note.file_size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                      {note.status === "approved" && <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /></div>}
                      {note.status === "pending_review" && <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20"><Clock className="h-4 w-4 text-amber-400 shrink-0" /></div>}
                      {note.status === "rejected" && <div className="bg-red-500/10 p-1.5 rounded-lg border border-red-500/20"><AlertCircle className="h-4 w-4 text-red-400 shrink-0" /></div>}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recently Viewed Section */}
        <div className="flex flex-col gap-3 w-full min-w-0">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Recently Viewed</h3>
            {recentlyViewed.length > 0 && (
              <button onClick={handleClearHistory} disabled={isClearingHistory} className="text-[10px] text-zinc-500 font-black uppercase tracking-wider flex items-center gap-1 hover:text-red-400 transition-colors">
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x w-full">
            {recentlyViewed.length === 0 ? (
              <div className="bg-zinc-950/40 border border-zinc-800/60 p-8 rounded-2xl text-center flex flex-col items-center justify-center w-full min-w-0 shadow-inner">
                <div className="bg-zinc-900 p-4 rounded-full border border-zinc-800 mb-3">
                  <History className="h-6 w-6 text-zinc-600" />
                </div>
                <p className="text-sm font-black text-zinc-300">Nothing viewed</p>
                <p className="text-xs text-zinc-500 mt-1.5 max-w-[200px] break-words whitespace-normal font-medium">Open notes to see them here.</p>
              </div>
            ) : (
              recentlyViewed.slice(0, 5).map(note => (
                <Link key={note.id} href={`/notes/${note.id}`} className="block shrink-0 w-[260px] snap-center group">
                  <div className="bg-zinc-900/40 border border-zinc-800/60 p-5 rounded-2xl flex flex-col gap-4 h-full hover:bg-zinc-800/60 transition-colors shadow-md">
                    <div className="flex justify-between items-start">
                       <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-black uppercase tracking-widest truncate max-w-[140px] shadow-inner">
                         {note.subjects?.name || "General"}
                       </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-sm text-zinc-100 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors">{note.title}</h4>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-zinc-500 font-bold border-t border-zinc-800/60 pt-3">
                       <span className="flex items-center gap-1 bg-zinc-800/50 px-2 py-0.5 rounded text-zinc-300"><ArrowDownToLine className="h-3 w-3"/> {note.downloads_count || 0}</span>
                       <span className="truncate max-w-[90px]">{note.profiles?.name || "Anonymous"}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
