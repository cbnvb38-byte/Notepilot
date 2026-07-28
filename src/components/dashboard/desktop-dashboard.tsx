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
  Trash2,
  Zap,
  Search
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StudyCopilotDashboardCard } from "@/components/study-copilot/study-copilot-dashboard-card";
import { DashboardProps } from "./types";
import { EmptyDashboardState } from "./empty-dashboard-state";

export function DesktopDashboard({
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-7xl mx-auto grid lg:grid-cols-4 gap-8"
    >
      {/* Left Hand: Student Overview Card */}
      <div className="col-span-1 flex flex-col gap-6">
        <motion.div variants={itemVariants as any}>
          <Card className="godmode-card border-zinc-800/80 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity" />
          <CardHeader className="items-center text-center pb-6 relative z-10">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 p-0.5 relative z-10 shadow-xl shadow-indigo-500/20">
                <div className="h-full w-full rounded-full bg-zinc-950 flex items-center justify-center font-black text-2xl text-indigo-400 border-2 border-zinc-900">
                  {profile?.name?.charAt(0).toUpperCase() || "S"}
                </div>
              </div>
            </div>
            <CardTitle className="text-base font-black text-white tracking-tight">{profile?.name}</CardTitle>
            <CardDescription className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5 justify-center">
              <Star className="h-3 w-3 fill-indigo-400" />
              {profile?.role} account
            </CardDescription>
          </CardHeader>
          <CardContent className="border-t border-zinc-800/50 pt-5 text-sm text-zinc-400 flex flex-col gap-4 relative z-10">
            <Link href="/dashboard/my-uploads" className="flex justify-between items-center group/link hover:text-white transition-colors">
              <span className="font-semibold text-xs">Total Contributions</span>
              <span className="font-black text-zinc-200 group-hover/link:text-indigo-400 transition-colors">{notes.length} notes</span>
            </Link>
            <Link href="/dashboard/downloads" className="flex justify-between items-center group/link hover:text-white transition-colors">
              <span className="font-semibold text-xs">Total Downloads</span>
              <span className="font-black text-zinc-200 group-hover/link:text-violet-400 transition-colors">
                {notes.reduce((acc, curr) => acc + (curr.downloads_count || 0), 0)} dls
              </span>
            </Link>
            <Link href="/dashboard/bookmarks" className="flex justify-between items-center group/link hover:text-white transition-colors">
              <span className="font-semibold text-xs">Bookmarked</span>
              <span className="font-black text-zinc-200 group-hover/link:text-pink-400 transition-colors">{favorites.length} guides</span>
            </Link>
          </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions Panel */}
        <motion.div variants={itemVariants as any}>
          <Card className="godmode-card border-zinc-800/80 shadow-2xl flex-grow">
          <CardHeader className="pb-4">
            <CardTitle className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link href="/dashboard/upload" className="w-full">
              <Button className="w-full glow-border bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold gap-2 text-sm py-6 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all duration-300">
                <UploadCloud className="h-4.5 w-4.5" /> Upload New Note
              </Button>
            </Link>
            <Link href="/dashboard/browse" className="w-full">
              <Button variant="outline" className="w-full glass-panel border-zinc-700/50 hover:bg-zinc-800/60 text-zinc-300 hover:text-white font-bold text-sm py-6 rounded-2xl transition-all duration-300">
                <Search className="h-4.5 w-4.5 mr-2 text-zinc-400" /> Browse Library
              </Button>
            </Link>
          </CardContent>
          </Card>
        </motion.div>
      </div>

        {/* Right Hand: Tabs Panel uploads, bookmarks, timelines */}
        <div className="col-span-3 flex flex-col gap-6">
          
          {/* Dashboard Title & Visual Stats Grid */}
          <motion.div variants={itemVariants as any} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-900/40 p-5 sm:p-6 rounded-3xl border border-zinc-800/60 shadow-inner backdrop-blur-md relative overflow-hidden gap-3 w-full min-w-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="relative z-10 min-w-0 w-full">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2 sm:gap-3 flex-wrap">
                Study Command Center
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400 shrink-0" />
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1 font-medium break-words whitespace-normal w-full max-w-full">Welcome back, {profile?.name?.split(' ')[0] || 'Student'}. Here's your study overview.</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants as any} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 w-full min-w-0">
            <Link href="/dashboard/my-uploads">
              <Card className="hover-lift godmode-card border-zinc-800/80 shadow-lg cursor-pointer group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none transform translate-x-2 -translate-y-2">
                  <FileText className="h-24 w-24" />
                </div>
                <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-5 min-w-0 w-full">
                  <div className="bg-indigo-500/10 text-indigo-400 p-2.5 sm:p-3.5 rounded-2xl border border-indigo-500/20 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(99,102,241,0.15)] shrink-0">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-lg sm:text-2xl font-black text-white truncate">{notes.length}</div>
                    <div className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-black mt-0.5 sm:mt-1 truncate">Uploaded</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/downloads">
              <Card className="hover-lift godmode-card border-zinc-800/80 shadow-lg cursor-pointer group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none transform translate-x-2 -translate-y-2">
                  <ArrowDownToLine className="h-24 w-24" />
                </div>
                <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-5 min-w-0 w-full">
                  <div className="bg-violet-500/10 text-violet-400 p-2.5 sm:p-3.5 rounded-2xl border border-violet-500/20 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(139,92,246,0.15)] shrink-0">
                    <ArrowDownToLine className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-lg sm:text-2xl font-black text-white truncate">
                      {notes.reduce((acc, curr) => acc + (curr.downloads_count || 0), 0)}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-black mt-0.5 sm:mt-1 truncate">Downloads</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/profile">
              <Card className="hover-lift godmode-card border-zinc-800/80 shadow-lg cursor-pointer group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none transform translate-x-2 -translate-y-2">
                  <TrendingUp className="h-24 w-24" />
                </div>
                <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-5 min-w-0 w-full">
                  <div className="bg-pink-500/10 text-pink-400 p-2.5 sm:p-3.5 rounded-2xl border border-pink-500/20 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(236,72,153,0.15)] shrink-0">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-lg sm:text-2xl font-black text-white truncate">Sem {notes.length > 0 ? Math.max(...notes.map(n => n.semester)) : 1}</div>
                    <div className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-black mt-0.5 sm:mt-1 truncate">Semester</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants as any}>
            <StudyCopilotDashboardCard />
          </motion.div>

          {/* Main Tabs panel */}
          <motion.div variants={itemVariants as any} className="w-full flex-grow flex flex-col min-w-0 max-w-full">
            <Tabs defaultValue="uploads" className="w-full flex-grow flex flex-col min-w-0 max-w-full">
            <TabsList className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 p-1.5 w-fit rounded-2xl gap-1 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <TabsTrigger value="uploads" className="text-sm px-6 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(99,102,241,0.4)] focus-visible:outline-none transition-all font-bold">
                My Uploads <span className="ml-2 bg-black/20 text-white/90 px-2 py-0.5 rounded-md text-[10px]">{filteredNotes.length}</span>
              </TabsTrigger>
              <TabsTrigger value="recent" className="text-sm px-6 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(99,102,241,0.4)] focus-visible:outline-none transition-all font-bold">
                Recently Viewed
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-sm px-6 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(99,102,241,0.4)] focus-visible:outline-none transition-all font-bold">
                Contributor Stats
              </TabsTrigger>
            </TabsList>

            {/* Uploads Tab */}
            <TabsContent value="uploads" className="flex-1 mt-6 w-full min-w-0 max-w-full">
              <Card className="premium-glass flex-grow shadow-2xl w-full min-w-0 overflow-hidden">
                <CardContent className="p-4 sm:p-8 min-w-0 w-full overflow-hidden">
                  {filteredNotes.length === 0 ? (
                    <EmptyDashboardState 
                      title="No notes uploaded yet" 
                      description="Start contributing to the library. Upload course guides or class notes." 
                      actionLink="/dashboard/upload" 
                      actionText="Upload First Note"
                    />
                  ) : (
                    <div className="flex flex-col gap-4">
                      {filteredNotes.map((note) => (
                        <div 
                          key={note.id}
                          className="flex items-center justify-between border border-zinc-800/60 bg-zinc-950/40 hover:bg-zinc-900/60 hover:border-indigo-500/30 px-6 py-5 rounded-2xl transition-all duration-300 group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                              <FileText className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-zinc-100 group-hover:text-white transition-colors">{note.title}</h4>
                              <p className="text-[11px] font-semibold text-zinc-500 mt-1 flex items-center gap-2 uppercase tracking-wide">
                                <span>Semester {note.semester}</span>
                                <span className="h-1 w-1 rounded-full bg-zinc-700" />
                                <span>{(note.file_size / 1024 / 1024).toFixed(1)} MB</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end">
                              <span className="text-sm text-zinc-300 font-black">{note.downloads_count || 0}</span>
                              <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Downloads</span>
                            </div>
                            
                            {/* Badges for note verification status */}
                            {note.status === "approved" && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 text-[10px] text-emerald-400 font-black uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                              </span>
                            )}
                            {note.status === "pending_review" && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 text-[10px] text-amber-400 font-black uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                <Clock className="h-3.5 w-3.5 animate-spin" /> Pending
                              </span>
                            )}
                            {note.status === "rejected" && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/15 text-[10px] text-red-400 font-black uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                                <AlertCircle className="h-3.5 w-3.5" /> Rejected
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recently Viewed Tab */}
            <TabsContent value="recent" className="flex-grow mt-6 w-full min-w-0 max-w-full">
              <Card className="premium-glass shadow-2xl w-full min-w-0 overflow-hidden">
                <CardContent className="p-4 sm:p-8 min-w-0 w-full overflow-hidden">
                  {recentlyViewed.length === 0 ? (
                    <EmptyDashboardState 
                      title="No recently viewed notes yet" 
                      description="Open some notes and they will appear here." 
                      actionLink="/dashboard/browse" 
                      actionText="Browse Library"
                    />
                  ) : (
                    <div className="flex flex-col gap-6">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearHistory}
                          disabled={isClearingHistory}
                          className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 text-xs font-bold gap-1.5 px-4 py-2 rounded-xl transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {isClearingHistory ? "Clearing..." : "Clear Recently Viewed"}
                        </Button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-5">
                        {recentlyViewed.map((note) => (
                          <Link 
                            key={note.id} 
                            href={`/notes/${note.id}`}
                            className="block group"
                          >
                            <div className="border border-zinc-800/60 bg-zinc-950/40 hover:bg-zinc-900/60 hover:border-indigo-500/30 p-6 rounded-2xl flex flex-col justify-between gap-5 transition-all duration-300 h-full shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                              <div>
                                <div className="flex justify-between items-start">
                                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-md font-black uppercase tracking-widest shadow-inner">
                                    {note.subjects?.branches?.name || "Semester " + note.semester} &bull; {note.subjects?.name || "General"}
                                  </span>
                                  {note.average_rating ? (
                                    <span className="flex items-center gap-1 text-[11px] font-black text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-md">
                                      <Star className="h-3 w-3 fill-yellow-500" />
                                      {note.average_rating.toFixed(1)}
                                    </span>
                                  ) : null}
                                </div>
                                <h4 className="font-bold text-base text-zinc-100 mt-4 group-hover:text-indigo-400 transition-colors line-clamp-1">{note.title}</h4>
                                <p className="text-zinc-500 text-xs leading-relaxed mt-2 line-clamp-2">
                                  {note.description || "No description provided."}
                                </p>
                              </div>
                              <div className="flex items-center justify-between border-t border-zinc-800/50 pt-4 mt-2 text-[11px] text-zinc-500 font-medium">
                                <span className="flex items-center gap-2">
                                  <span className="text-zinc-300 font-bold">{note.downloads_count || 0} dls</span>
                                  <span>&bull;</span>
                                  <span className="truncate max-w-[100px] text-zinc-400">{note.profiles?.name || "Anonymous"}</span>
                                </span>
                                <span className="inline-flex items-center gap-1 font-bold text-zinc-400 group-hover:text-indigo-400 transition-colors bg-zinc-800/50 px-2 py-1 rounded-md">
                                  Open <ExternalLink className="h-3 w-3" />
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contributor Stats Tab */}
            <TabsContent value="stats" className="flex-1 mt-6 w-full min-w-0 max-w-full">
              <Card className="premium-glass shadow-2xl w-full min-w-0 overflow-hidden">
                <CardContent className="p-4 sm:p-8 flex flex-col gap-6 sm:gap-8 min-w-0 w-full overflow-hidden">
                  {(() => {
                    const totalUploaded = notes.length;
                    const approved = notes.filter(n => n.status === "approved").length;
                    const pending = notes.filter(n => n.status === "pending_review").length;
                    const rejected = notes.filter(n => n.status === "rejected").length;
                    const removed = notes.filter(n => n.status === "removed").length;

                    const views = notes.reduce((sum, n) => sum + (n.view_count || 0), 0);
                    const dls = notes.reduce((sum, n) => sum + (n.downloads_count || 0), 0);
                    const saves = notes.reduce((sum, n) => sum + (n.bookmarks_count || 0), 0);
                    const totalRatings = notes.reduce((sum, n) => sum + (n.total_ratings || 0), 0);
                    const totalReviews = notes.reduce((sum, n) => sum + (n.total_reviews || 0), 0);

                    const ratedApproved = notes.filter(n => n.status === "approved" && n.total_ratings > 0);
                    const averageRating = ratedApproved.length > 0
                      ? (ratedApproved.reduce((sum, n) => sum + (n.average_rating || 0), 0) / ratedApproved.length).toFixed(1)
                      : "0.0";

                    return (
                      <div className="flex flex-col gap-8 w-full min-w-0">
                        <div>
                          <h3 className="text-xl font-black text-zinc-100 flex items-center gap-2">
                            Contributor Dashboard Summary
                          </h3>
                          <p className="text-sm text-zinc-500 mt-1">Comprehensive engagement and content delivery metrics.</p>
                        </div>

                        {/* Top Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full min-w-0">
                          <div className="godmode-card p-5 border-zinc-800/80 rounded-2xl text-center flex flex-col gap-2 justify-center shadow-lg hover:shadow-indigo-500/10 transition-shadow">
                            <span className="text-3xl font-black text-white">{totalUploaded}</span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">Total Uploads</span>
                          </div>
                          <div className="godmode-card p-5 border-zinc-800/80 rounded-2xl text-center flex flex-col gap-2 justify-center shadow-lg hover:shadow-violet-500/10 transition-shadow">
                            <span className="text-3xl font-black text-white">{views}</span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-violet-400">Total Views</span>
                          </div>
                          <div className="godmode-card p-5 border-zinc-800/80 rounded-2xl text-center flex flex-col gap-2 justify-center shadow-lg hover:shadow-pink-500/10 transition-shadow">
                            <span className="text-3xl font-black text-white">{dls}</span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-pink-400">Total Downloads</span>
                          </div>
                          <div className="godmode-card p-5 border-zinc-800/80 rounded-2xl text-center flex flex-col gap-2 justify-center shadow-lg hover:shadow-amber-500/10 transition-shadow">
                            <span className="text-3xl font-black text-white">{saves}</span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-amber-400">Total Saves</span>
                          </div>
                        </div>

                        {/* Status Breakdown Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-zinc-800/50">
                          {/* Left: Notes count by Status */}
                          <div className="flex flex-col gap-4">
                            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1">Status Breakdown</h4>
                            <div className="flex flex-col bg-zinc-950/60 border border-zinc-800/60 rounded-2xl overflow-hidden divide-y divide-zinc-800/60 shadow-inner">
                              {[
                                { label: "Approved Notes", value: approved, color: "text-emerald-400" },
                                { label: "Pending Review", value: pending, color: "text-amber-400" },
                                { label: "Rejected Notes", value: rejected, color: "text-red-400" },
                                { label: "Removed Notes", value: removed, color: "text-zinc-500" },
                              ].map((item) => (
                                <div key={item.label} className="flex justify-between items-center py-3.5 px-5 text-sm hover:bg-zinc-900/50 transition-colors">
                                  <span className="text-zinc-400 font-bold">{item.label}</span>
                                  <span className={`font-black ${item.color}`}>{item.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Right: Feedback & Ratings Summary */}
                          <div className="flex flex-col gap-4 w-full min-w-0">
                            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1">Feedback Summary</h4>
                            <div className="flex flex-col bg-zinc-950/60 border border-zinc-800/60 rounded-2xl overflow-hidden divide-y divide-zinc-800/60 shadow-inner w-full min-w-0">
                              <div className="flex justify-between items-center py-3.5 px-4 sm:px-5 text-sm hover:bg-zinc-900/50 transition-colors gap-2">
                                <span className="text-zinc-400 font-bold truncate">Total Ratings</span>
                                <span className="font-black text-zinc-200 shrink-0">{totalRatings}</span>
                              </div>
                              <div className="flex justify-between items-center py-3.5 px-4 sm:px-5 text-sm hover:bg-zinc-900/50 transition-colors gap-2">
                                <span className="text-zinc-400 font-bold truncate">Total Reviews</span>
                                <span className="font-black text-zinc-200 shrink-0">{totalReviews}</span>
                              </div>
                              <div className="flex flex-col sm:flex-row justify-between sm:items-center py-3.5 px-4 sm:px-5 text-sm hover:bg-zinc-900/50 transition-colors gap-3 sm:gap-2">
                                <span className="text-zinc-400 font-bold break-words whitespace-normal leading-tight">Average rating across uploaded notes</span>
                                <span className="font-black text-yellow-500 flex items-center justify-center gap-1.5 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 shrink-0 w-fit">
                                  {averageRating} <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
            </Tabs>
          </motion.div>

        </div>
      </motion.div>
  );
}
