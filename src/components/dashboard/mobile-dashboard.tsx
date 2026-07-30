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
      className="flex flex-col gap-8 w-full max-w-full min-w-0 pb-12"
    >
      {/* 1. Compact Premium Header */}
      <motion.div variants={itemVariants as any} className="flex flex-col gap-3 w-full min-w-0 bg-gradient-to-b from-zinc-900 to-zinc-950/90 p-6 rounded-[2rem] border border-zinc-800/80 shadow-[0_8px_32px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:bg-indigo-500/30 transition-colors duration-700" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <p className="text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em] flex items-center gap-1.5 bg-indigo-500/10 w-fit px-2.5 py-1 rounded-full border border-indigo-500/20 mb-2 shadow-inner">
              <Sparkles className="h-3 w-3 text-indigo-400" /> {profile?.role === "admin" ? "Admin Workspace" : "Premium AI Workspace"}
            </p>
            <h2 className="text-2xl font-black text-white truncate tracking-tight">Hello, {profile?.name?.split(' ')[0] || "Student"}</h2>
          </div>
          <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 p-[2px] shadow-lg shadow-indigo-500/20 shrink-0">
            <div className="h-full w-full rounded-full bg-zinc-950 flex items-center justify-center font-black text-xl text-indigo-400 border border-zinc-900 shadow-inner">
              {profile?.name?.charAt(0).toUpperCase() || "S"}
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-3 pt-5 border-t border-zinc-800/60">
          <h1 className="text-xl font-black text-zinc-100 flex items-center gap-2 tracking-tight">
            Study Command Center
          </h1>
          <p className="text-xs text-zinc-400 mt-2 break-words whitespace-normal font-medium leading-relaxed max-w-[280px]">
            Your personalized hub for notes, AI tools, and insights.
          </p>
        </div>
      </motion.div>

      {/* 2. Quick Actions */}
      <motion.div variants={itemVariants as any} className="flex flex-col gap-3 w-full min-w-0">
        <div className="flex items-center gap-2 px-1">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <h3 className="text-xs font-black uppercase text-zinc-400 tracking-[0.15em]">
            Quick Actions
          </h3>
        </div>
        <div className="flex flex-col gap-3 mt-1">
          <Link href="/dashboard/upload" className="w-full group">
            <Button className="w-full justify-between bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:via-violet-500 hover:to-violet-500 text-white font-black text-base py-7 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.2)] border border-indigo-400/20 transition-all active:scale-[0.98]">
              <span className="flex items-center gap-3 ml-2">
                <UploadCloud className="h-5 w-5" /> Upload New Note
              </span>
              <Plus className="h-5 w-5 mr-2 opacity-70 group-hover:opacity-100 group-hover:rotate-90 transition-all" />
            </Button>
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/browse" className="w-full">
              <Button variant="outline" className="w-full flex-col gap-2 h-auto py-5 bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-black text-sm rounded-2xl transition-all shadow-sm active:scale-[0.98]">
                <Search className="h-5 w-5 text-zinc-400" /> Browse
              </Button>
            </Link>
            <Link href="/dashboard/study-copilot" className="w-full">
              <Button variant="outline" className="w-full flex-col gap-2 h-auto py-5 bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/10 hover:border-indigo-500/40 text-indigo-300 hover:text-indigo-200 font-black text-sm rounded-2xl transition-all shadow-sm active:scale-[0.98]">
                <Sparkles className="h-5 w-5 text-indigo-400" /> Copilot
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 3. Contributor Stats / Impact */}
      <motion.div variants={itemVariants as any} className="flex flex-col gap-4 w-full min-w-0 mt-2">
        <div className="flex items-center gap-2 px-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <h3 className="text-xs font-black uppercase text-zinc-400 tracking-[0.15em]">
            Your Impact
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3 w-full min-w-0">
          <div className="bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-5 border border-zinc-800/80 rounded-2xl flex flex-col gap-1 shadow-lg relative overflow-hidden group">
             <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
             <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all"><FileText className="h-20 w-20 text-indigo-400"/></div>
             <span className="text-3xl font-black text-white relative z-10 tracking-tight">{notes.length}</span>
             <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-[0.15em] relative z-10 mt-1">Uploads</span>
          </div>
          <div className="bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-5 border border-zinc-800/80 rounded-2xl flex flex-col gap-1 shadow-lg relative overflow-hidden group">
             <div className="absolute inset-0 bg-violet-500/5 group-hover:bg-violet-500/10 transition-colors pointer-events-none" />
             <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all"><ArrowDownToLine className="h-20 w-20 text-violet-400"/></div>
             <span className="text-3xl font-black text-white relative z-10 tracking-tight">{dls}</span>
             <span className="text-[10px] uppercase font-bold text-violet-400 tracking-[0.15em] relative z-10 mt-1">Downloads</span>
          </div>
          <div className="bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-5 border border-zinc-800/80 rounded-2xl flex flex-col gap-1 shadow-lg relative overflow-hidden group">
             <div className="absolute inset-0 bg-pink-500/5 group-hover:bg-pink-500/10 transition-colors pointer-events-none" />
             <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all"><TrendingUp className="h-20 w-20 text-pink-400"/></div>
             <span className="text-3xl font-black text-white relative z-10 tracking-tight">{views}</span>
             <span className="text-[10px] uppercase font-bold text-pink-400 tracking-[0.15em] relative z-10 mt-1">Views</span>
          </div>
          <div className="bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-5 border border-zinc-800/80 rounded-2xl flex flex-col gap-1 shadow-lg relative overflow-hidden group">
             <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
             <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all"><Star className="h-20 w-20 text-amber-400"/></div>
             <span className="text-3xl font-black text-white relative z-10 tracking-tight">{saves}</span>
             <span className="text-[10px] uppercase font-bold text-amber-400 tracking-[0.15em] relative z-10 mt-1">Saves</span>
          </div>
        </div>

        {/* Detailed Status Breakdown */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden w-full min-w-0 mt-2 shadow-sm">
           <div className="px-4 py-3 border-b border-zinc-800/60 flex items-center justify-between bg-zinc-900/60 backdrop-blur-md">
              <span className="text-xs font-black text-zinc-300 uppercase tracking-[0.15em]">Status Breakdown</span>
              {averageRating !== "0.0" && (
                <span className="flex items-center gap-1.5 text-xs font-black text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full shadow-inner">
                  <Star className="h-3.5 w-3.5 fill-yellow-500" />
                  {averageRating} Avg
                </span>
              )}
           </div>
           <div className="divide-y divide-zinc-800/60 bg-zinc-950/40">
             <div className="flex justify-between items-center py-4 px-5 text-sm hover:bg-zinc-900/80 transition-colors">
                <span className="text-zinc-300 font-bold flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-400" /> Approved Notes</span>
                <span className="font-black text-emerald-400 text-base">{approved}</span>
             </div>
             <div className="flex justify-between items-center py-4 px-5 text-sm hover:bg-zinc-900/80 transition-colors">
                <span className="text-zinc-300 font-bold flex items-center gap-3"><Clock className="h-5 w-5 text-amber-400" /> Pending Review</span>
                <span className="font-black text-amber-400 text-base">{pending}</span>
             </div>
             <div className="flex justify-between items-center py-4 px-5 text-sm hover:bg-zinc-900/80 transition-colors">
                <span className="text-zinc-400 font-bold flex items-center gap-3"><AlertCircle className="h-5 w-5 text-red-400" /> Rejected Notes</span>
                <span className="font-black text-red-400 text-base">{rejected}</span>
             </div>
           </div>
        </div>
      </motion.div>

      {/* 4. Recent / Activity Sections */}
      <motion.div variants={itemVariants as any} className="flex flex-col gap-8 w-full min-w-0 mt-2">
        
        {/* Uploads Section */}
        <div className="flex flex-col gap-4 w-full min-w-0">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-[0.15em]">Recent Uploads</h3>
            </div>
            <Link href="/dashboard/my-uploads" className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.15em] hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">View All</Link>
          </div>
          <div className="flex flex-col gap-3">
            {filteredNotes.length === 0 ? (
              <div className="bg-zinc-900/30 border border-zinc-800/60 p-8 rounded-2xl text-center flex flex-col items-center justify-center w-full min-w-0 shadow-inner">
                <div className="bg-zinc-900 p-4 rounded-full border border-zinc-800/80 mb-4 shadow-sm">
                  <FileText className="h-6 w-6 text-zinc-500" />
                </div>
                <p className="text-sm font-black text-zinc-200">No uploads yet</p>
                <p className="text-xs text-zinc-500 mt-2 max-w-[220px] break-words whitespace-normal font-medium leading-relaxed">Share your first note to help others and track your stats.</p>
                <Link href="/dashboard/upload" className="mt-4">
                  <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 rounded-xl font-bold h-9">Start Uploading</Button>
                </Link>
              </div>
            ) : (
              filteredNotes.slice(0, 3).map((note) => (
                <Link href={`/dashboard/my-uploads`} key={note.id} className="block group">
                  <div className="bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-2xl flex flex-col gap-3 w-full min-w-0 relative overflow-hidden hover:bg-zinc-800 hover:border-zinc-700 transition-all shadow-sm">
                    <div className="flex justify-between items-start gap-3">
                      <div className="bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-700/50 shrink-0">
                        <FileText className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <h4 className="font-black text-sm text-zinc-100 truncate group-hover:text-indigo-300 transition-colors">{note.title}</h4>
                        <p className="text-[10px] font-bold text-zinc-500 mt-1.5 truncate uppercase tracking-widest flex items-center gap-1.5">
                          <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">Sem {note.semester}</span> 
                          <span>•</span> 
                          <span>{(note.file_size / 1024 / 1024).toFixed(1)} MB</span>
                        </p>
                      </div>
                      <div className="shrink-0 pt-0.5">
                        {note.status === "approved" && <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20"><CheckCircle2 className="h-4 w-4 text-emerald-400" /></div>}
                        {note.status === "pending_review" && <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20"><Clock className="h-4 w-4 text-amber-400" /></div>}
                        {note.status === "rejected" && <div className="bg-red-500/10 p-1.5 rounded-lg border border-red-500/20"><AlertCircle className="h-4 w-4 text-red-400" /></div>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recently Viewed Section */}
        <div className="flex flex-col gap-4 w-full min-w-0">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-[0.15em]">Recently Viewed</h3>
            </div>
            {recentlyViewed.length > 0 && (
              <button onClick={handleClearHistory} disabled={isClearingHistory} className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.15em] flex items-center gap-1.5 hover:text-red-400 bg-zinc-900/50 border border-zinc-800/80 px-2.5 py-1 rounded-full transition-colors">
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide snap-x w-full">
            {recentlyViewed.length === 0 ? (
              <div className="bg-zinc-900/30 border border-zinc-800/60 p-8 rounded-2xl text-center flex flex-col items-center justify-center w-full min-w-0 shadow-inner shrink-0">
                <div className="bg-zinc-900 p-4 rounded-full border border-zinc-800/80 mb-4 shadow-sm">
                  <History className="h-6 w-6 text-zinc-500" />
                </div>
                <p className="text-sm font-black text-zinc-200">Nothing viewed</p>
                <p className="text-xs text-zinc-500 mt-2 max-w-[200px] break-words whitespace-normal font-medium leading-relaxed">Open notes to see them here.</p>
              </div>
            ) : (
              recentlyViewed.slice(0, 5).map(note => (
                <Link key={note.id} href={`/notes/${note.id}`} className="block shrink-0 w-[260px] snap-center group">
                  <div className="bg-zinc-900/50 border border-zinc-800/60 p-5 rounded-3xl flex flex-col gap-4 h-full hover:bg-zinc-800 hover:border-zinc-700 transition-all shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-500" />
                    
                    <div className="flex justify-between items-start relative z-10">
                       <span className="text-[9px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full font-black uppercase tracking-[0.15em] truncate max-w-[140px] shadow-sm">
                         {note.subjects?.name || "General"}
                       </span>
                    </div>
                    
                    <div className="flex-1 relative z-10 mt-1">
                      <h4 className="font-black text-base text-zinc-100 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors tracking-tight">{note.title}</h4>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-400 font-bold border-t border-zinc-800/60 pt-4 relative z-10">
                       <span className="flex items-center gap-1.5 bg-zinc-950/50 px-2.5 py-1 rounded-lg border border-zinc-800/80"><ArrowDownToLine className="h-3 w-3 text-zinc-500"/> {note.downloads_count || 0}</span>
                       <span className="truncate max-w-[100px] text-zinc-500 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-zinc-700" /> {note.profiles?.name || "Anonymous"}</span>
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

