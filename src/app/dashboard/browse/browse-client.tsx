"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  Bookmark,
  Eye,
  Download,
  Calendar,
  User,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileWarning,
  Bot,
  Clock,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSupabase } from "@/hooks/useSupabase";
import { browseNotesAction, logDownloadAction, fetchRecentlyViewedNotesAction } from "@/app/actions/notes";
import { addBookmark, removeBookmark } from "@/app/actions/bookmarks";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  branch_id: string;
  semester: number;
}

interface NoteRow {
  id: string;
  title: string;
  description: string | null;
  semester: number;
  college: string | null;
  professor: string | null;
  downloads_count: number;
  bookmarks_count: number;
  view_count: number;
  average_rating: number;
  total_ratings: number;
  total_reviews: number;
  created_at: string;
  file_url: string;
  author_id: string;
  profiles: {
    name: string | null;
  } | null;
  subjects: {
    id: string;
    name: string;
    code: string;
    branches: {
      id: string;
      name: string;
      code: string;
    } | null;
  } | null;
}

function BrowseNotesContent({
  initialBranches,
  initialBookmarkedIds = [],
}: {
  initialBranches: Branch[];
  initialBookmarkedIds?: string[];
}) {
  const supabase = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // URL Sync function
  const updateUrl = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all" || value === "0") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const initialSearch = searchParams.get("q") || "";
  let initialSort = searchParams.get("sort");
  if (!initialSort) {
    initialSort = initialSearch ? "relevance" : "newest";
  }
  const validSorts = ["newest", "downloads", "views", "highest_rated", "most_reviewed", "relevance"];
  if (!validSorts.includes(initialSort)) initialSort = "newest";

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedBranch, setSelectedBranch] = useState(searchParams.get("branch") || "all");
  const [selectedSemester, setSelectedSemester] = useState(searchParams.get("semester") || "0");
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get("subject") || "all");
  const [sortBy, setSortBy] = useState<any>(initialSort);

  // Dynamic Subjects List (based on branch/semester selection)
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  // Pagination & Loading States
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const [page, setPage] = useState(initialPage > 0 ? initialPage : 1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadingNotes, setDownloadingNotes] = useState<Record<string, boolean>>({});
  
  // Bookmarks State
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(initialBookmarkedIds));
  const [bookmarkingIds, setBookmarkingIds] = useState<Record<string, boolean>>({});

  // Recently Viewed State
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [discoveryTab, setDiscoveryTab] = useState<"recent" | "trending">("recent");

  useEffect(() => {
    async function loadRecent() {
      try {
        const res = await fetchRecentlyViewedNotesAction(10);
        if (res.success && res.data) {
          setRecentlyViewed(res.data);
        }
      } catch (err) {
        console.warn("Failed to fetch recently viewed", err);
      }
    }
    loadRecent();
  }, []);

  const handleToggleBookmark = async (noteId: string) => {
    if (bookmarkingIds[noteId]) return; // Guard against rapid clicks

    try {
      setBookmarkingIds((prev) => ({ ...prev, [noteId]: true }));
      const isCurrentlyBookmarked = bookmarkedIds.has(noteId);
      
      // Optimistic UI Update
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyBookmarked) next.delete(noteId);
        else next.add(noteId);
        return next;
      });
      setNotes((prevNotes) =>
        prevNotes.map((n) =>
          n.id === noteId
            ? { ...n, bookmarks_count: n.bookmarks_count + (isCurrentlyBookmarked ? -1 : 1) }
            : n
        )
      );

      const res = isCurrentlyBookmarked 
        ? await removeBookmark(noteId)
        : await addBookmark(noteId);

      if (!res.success) {
        // Revert Optimistic Update
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          if (isCurrentlyBookmarked) next.add(noteId);
          else next.delete(noteId);
          return next;
        });
        setNotes((prevNotes) =>
          prevNotes.map((n) =>
            n.id === noteId
              ? { ...n, bookmarks_count: n.bookmarks_count + (isCurrentlyBookmarked ? 1 : -1) }
              : n
          )
        );
        toast.error(`Failed to ${isCurrentlyBookmarked ? "remove" : "add"} bookmark.`);
      } else {
        toast.success(isCurrentlyBookmarked ? "Bookmark removed" : "Bookmark added");
      }
    } catch (err) {
      toast.error("An error occurred while bookmarking.");
    } finally {
      setBookmarkingIds((prev) => ({ ...prev, [noteId]: false }));
    }
  };

  const handleDownload = async (noteId: string, noteTitle: string) => {
    try {
      setDownloadingNotes((prev) => ({ ...prev, [noteId]: true }));
      const res = await logDownloadAction(noteId);

      if (res.success && "data" in res && res.data) {
        const fileUrl = res.data.fileUrl;
        
        // Trigger browser download
        const link = document.createElement("a");
        link.href = fileUrl;
        link.setAttribute("download", `${noteTitle.replace(/\s+/g, "_")}.pdf`);
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Update local notes counter state
        setNotes((prevNotes) =>
          prevNotes.map((n) =>
            n.id === noteId ? { ...n, downloads_count: n.downloads_count + 1 } : n
          )
        );
      } else {
        const errObj = "error" in res ? res.error : null;
        alert(errObj?.message || "Failed to log download.");
      }
    } catch (err: any) {
      console.error("[Download Error]:", err);
      alert("Unable to download note at this time.");
    } finally {
      setDownloadingNotes((prev) => ({ ...prev, [noteId]: false }));
    }
  };

  // Ref for debouncing search input
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Limit of items per page
  const itemsPerPage = 8;

  // Load subjects dynamically when Branch or Semester filters change
  useEffect(() => {
    async function loadSubjects() {
      // If branch is "all", we don't fetch subjects since the dropdown is disabled/not applicable
      if (selectedBranch === "all") {
        setSubjects([]);
        setSelectedSubject("all");
        return;
      }

      try {
        setIsLoadingSubjects(true);
        let query = supabase
          .from("subjects")
          .select("*")
          .eq("branch_id", selectedBranch)
          .order("name", { ascending: true });

        // Optionally filter by semester if a specific one is selected
        if (selectedSemester !== "0") {
          query = query.eq("semester", parseInt(selectedSemester, 10));
        }

        const { data, error } = await query;

        if (error) {
          console.error("[Client Operations Failure - loadSubjects]:", error);
          return;
        }

        if (data) {
          setSubjects(data);
          // If selectedSubject isn't in the new list, reset it to "all"
          if (!data.some((s) => s.id === selectedSubject)) {
            setSelectedSubject("all");
          }
        }
      } catch (err) {
        console.error("Unexpected error loading subjects:", err);
      } finally {
        setIsLoadingSubjects(false);
      }
    }

    loadSubjects();
  }, [selectedBranch, selectedSemester, supabase]);

  // Main Notes Fetcher
  const fetchNotes = async (search: string, branch: string, sem: string, sub: string, sort: any, currentPage: number) => {
    try {
      setIsLoadingNotes(true);
      setErrorMsg("");

      const res = await browseNotesAction({
        search: search || undefined,
        branchId: branch !== "all" ? branch : undefined,
        semester: sem !== "0" ? parseInt(sem, 10) : undefined,
        subjectId: sub !== "all" ? sub : undefined,
        sortBy: sort,
        page: currentPage,
        limit: itemsPerPage,
      });

      if ("data" in res && res.data) {
        setNotes(res.data.notes as NoteRow[]);
        setTotalCount(res.data.totalCount);
        setTotalPages(res.data.totalPages);
      } else if ("error" in res && res.error) {
        throw new Error(res.error.message || "Failed to fetch study notes.");
      } else {
        throw new Error("Failed to fetch study notes.");
      }
    } catch (err: any) {
      console.error("[Browse Notes Error]:", err);
      setErrorMsg(err.message || "An unexpected error occurred while loading notes.");
    } finally {
      setIsLoadingNotes(false);
    }
  };

  // Fetch when filters, sorting, or page changes
  useEffect(() => {
    // Immediate fetch for non-search triggers
    fetchNotes(searchQuery, selectedBranch, selectedSemester, selectedSubject, sortBy, page);
  }, [selectedBranch, selectedSemester, selectedSubject, sortBy, page]);

  // Debounced search trigger
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setPage(1); // Reset to first page on search

    let newSort = sortBy;
    if (value && sortBy === "newest") newSort = "relevance";
    else if (!value && sortBy === "relevance") newSort = "newest";
    setSortBy(newSort);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      updateUrl({ q: value, sort: newSort, page: "1" });
      fetchNotes(value, selectedBranch, selectedSemester, selectedSubject, newSort, 1);
    }, 450);
  };

  // Handle page resets when filters change
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedBranch(val);
    setPage(1);
    updateUrl({ branch: val, page: "1" });
  };

  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedSemester(val);
    setPage(1);
    updateUrl({ semester: val, page: "1" });
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedSubject(val);
    setPage(1);
    updateUrl({ subject: val, page: "1" });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSortBy(val);
    setPage(1);
    updateUrl({ sort: val, page: "1" });
  };

  // Clean up debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleClearSearch = () => {
    setSearchQuery("");
    setPage(1);
    const newSort = sortBy === "relevance" ? "newest" : sortBy;
    setSortBy(newSort);
    updateUrl({ q: null, sort: newSort, page: "1" });
    fetchNotes("", selectedBranch, selectedSemester, selectedSubject, newSort, 1);
  };

  const handleResetFilters = () => {
    setSelectedBranch("all");
    setSelectedSemester("0");
    setSelectedSubject("all");
    setSortBy("newest");
    setPage(1);
    updateUrl({ branch: null, semester: null, subject: null, sort: "newest", page: "1" });
    fetchNotes(searchQuery, "all", "0", "all", "newest", 1);
  };

  const trendingNotes = [...notes].sort((a, b) => (b.downloads_count + b.view_count) - (a.downloads_count + a.view_count)).slice(0, 5);

  return (
    <div className="w-full">
      {/* ── Mobile Layout ── */}
      <div className="flex lg:hidden flex-col gap-6 w-full">
        {/* 1. Mobile Premium Header */}
        <div className="flex flex-col gap-1.5 pt-1 pb-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 w-fit">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span className="text-[9px] font-bold text-indigo-400 tracking-wide uppercase">AI Notes Library</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight leading-tight">Explore Notes</h1>
          <p className="text-xs text-zinc-400 font-medium">Find trusted notes, topics, and study material.</p>
        </div>

        {/* TOP DISCOVERY REEL - only discovery section on mobile */}
        <div className="flex flex-col gap-3 -mx-4">
          <div className="px-4 flex flex-col gap-1.5">
            <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Continue & Discover
            </h2>
            <p className="text-[11px] text-zinc-500 font-medium mb-1">Recent notes and popular study material.</p>
            
            {/* Tabs */}
            <div className="flex gap-2 mb-2">
              <button 
                onClick={() => setDiscoveryTab("recent")}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all border ${
                  discoveryTab === "recent" 
                    ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30" 
                    : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-300"
                }`}
              >
                Recently Viewed
              </button>
              <button 
                onClick={() => setDiscoveryTab("trending")}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all border ${
                  discoveryTab === "trending" 
                    ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30" 
                    : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-300"
                }`}
              >
                Trending
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto pb-4 scrollbar-hide px-4">
            <div className="flex gap-3 w-max">
              {discoveryTab === "recent" ? (
                recentlyViewed.length > 0 ? (
                  recentlyViewed.map((note) => (
                    <Link href={`/notes/${note.id}`} key={`recent-${note.id}`} className="block w-[260px] max-w-[85vw]">
                      <div className="flex flex-col justify-between gap-3 p-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-md hover:bg-zinc-900/60 transition-colors h-full shadow-sm">
                        <div className="flex flex-col gap-1.5 min-w-0">
                          <h4 className="text-[13px] font-bold text-zinc-100 line-clamp-1 leading-snug">{note.title}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                            <span className="truncate flex items-center gap-1"><GraduationCap className="h-3 w-3" /> {note.subjects?.name || "Subject"}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {note.subjects?.code && (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-800/50 border border-zinc-700/50 text-zinc-300">{note.subjects.code}</span>
                            )}
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-800/50 border border-zinc-700/50 text-zinc-300">Sem {note.semester}</span>
                          </div>
                          <span className="text-[10px] font-bold text-indigo-400">Open Note &rarr;</span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="w-[260px] max-w-[85vw] text-center px-4 py-6 border border-dashed border-zinc-800 rounded-2xl text-[11px] text-zinc-500 bg-zinc-900/20">
                    Recently opened notes will appear here.
                  </div>
                )
              ) : (
                trendingNotes.length > 0 ? (
                  trendingNotes.map((note) => (
                    <Link href={`/notes/${note.id}`} key={`trending-${note.id}`} className="block w-[260px] max-w-[85vw]">
                      <div className="flex flex-col justify-between gap-3 p-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-md hover:bg-zinc-900/60 transition-colors h-full shadow-sm">
                        <div className="flex flex-col gap-1.5 min-w-0">
                          <h4 className="text-[13px] font-bold text-zinc-100 line-clamp-1 leading-snug">{note.title}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                            <span className="truncate flex items-center gap-1"><GraduationCap className="h-3 w-3" /> {note.subjects?.name || "Subject"}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex flex-wrap gap-2 items-center text-[10px] font-bold text-zinc-500">
                            <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {note.downloads_count}</span>
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {note.view_count}</span>
                          </div>
                          <span className="text-[10px] font-bold text-indigo-400">Open Note &rarr;</span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="w-[260px] max-w-[85vw] text-center px-4 py-6 border border-dashed border-zinc-800 rounded-2xl text-[11px] text-zinc-500 bg-zinc-900/20">
                    Popular notes will appear as students use the library.
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="relative group">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
          <Input
            placeholder="Search notes, subjects, topics..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 bg-zinc-900/60 border-zinc-800/80 focus:border-indigo-500/50 focus:ring-indigo-500/10 text-zinc-100 rounded-2xl h-11 shadow-inner text-[13px] placeholder:text-zinc-500 transition-all"
          />
        </div>

        {/* 3. Clean Mobile Filters */}
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          <div className="flex items-center gap-2 w-max">
            <select
              value={selectedBranch}
              onChange={handleBranchChange}
              className="bg-zinc-900/50 border border-zinc-800/60 text-[11px] font-bold rounded-xl h-8 px-3 text-zinc-300 focus:border-indigo-500/50 outline-none cursor-pointer appearance-none"
            >
              <option value="all">All Branches</option>
              {initialBranches.map(b => <option key={b.id} value={b.id}>{b.code}</option>)}
            </select>
            
            <select
              value={selectedSemester}
              onChange={handleSemesterChange}
              className="bg-zinc-900/50 border border-zinc-800/60 text-[11px] font-bold rounded-xl h-8 px-3 text-zinc-300 focus:border-indigo-500/50 outline-none cursor-pointer appearance-none"
            >
              <option value="0">All Sems</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>

            <select
              value={selectedSubject}
              onChange={handleSubjectChange}
              className="bg-zinc-900/50 border border-zinc-800/60 text-[11px] font-bold rounded-xl h-8 px-3 text-zinc-300 focus:border-indigo-500/50 outline-none cursor-pointer appearance-none max-w-[120px] truncate"
              disabled={isLoadingSubjects}
            >
              <option value="all">{isLoadingSubjects ? "Loading..." : "All Subjects"}</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={handleSortChange}
              className="bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-bold rounded-xl h-8 px-3 text-indigo-300 focus:border-indigo-500/50 outline-none cursor-pointer appearance-none"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
              <option value="downloads">Most Downloaded</option>
              <option value="highest_rated">Highest Rated</option>
            </select>

            {(searchQuery || selectedBranch !== "all" || selectedSemester !== "0" || selectedSubject !== "all" || sortBy !== "newest") && (
              <button
                onClick={handleResetFilters}
                className="bg-red-500/10 border border-red-500/20 text-[11px] font-bold rounded-xl h-8 px-3 text-red-400 flex items-center gap-1 shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* ALL NOTES LIST - no Recently Viewed/Trending below this point */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-black text-zinc-100 mb-1">
            {searchQuery ? "Search Results" : "All Notes"} <span className="text-zinc-500 text-[10px]">({totalCount})</span>
          </h2>
          
          {isLoadingNotes ? (
            <div className="py-10 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
              <p className="text-xs font-bold text-zinc-500">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-zinc-950/40 rounded-3xl border border-zinc-800/50 shadow-inner">
              <div className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800 mb-3 shadow-inner">
                <FileWarning className="h-6 w-6 text-zinc-500" />
              </div>
              <h3 className="font-black text-zinc-300 text-sm mb-1">No notes matched your search.</h3>
              <p className="text-xs text-zinc-500 mb-4 max-w-[200px]">Try adjusting filters or searching for something else.</p>
              <div className="flex items-center gap-2 w-full max-w-[200px]">
                <Button onClick={handleResetFilters} variant="outline" className="w-full text-xs font-bold rounded-xl h-10 border-zinc-800 text-zinc-400 hover:text-zinc-300">
                  Reset Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {notes.map((note) => (
                <div key={`mob-${note.id}`} className="flex flex-col gap-3 p-5 rounded-3xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-md shadow-sm relative overflow-hidden group">
                  <div className="flex flex-col gap-1 min-w-0 z-10">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {note.subjects?.code && (
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-lg bg-zinc-800/80 border border-zinc-700/50 text-zinc-300">{note.subjects.code}</span>
                        )}
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">Sem {note.semester}</span>
                      </div>
                      {note.average_rating > 0 && (
                        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                          <span className="text-[10px] font-bold text-amber-400">{note.average_rating.toFixed(1)} ★</span>
                        </div>
                      )}
                    </div>
                    <Link href={`/notes/${note.id}`} className="block">
                      <h3 className="text-base font-black text-zinc-100 line-clamp-2 leading-snug mb-1.5">{note.title}</h3>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-medium mb-3">{note.description || "No description provided."}</p>
                    </Link>
                    
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium bg-zinc-950/40 px-3 py-2 rounded-xl border border-zinc-800/40 w-fit">
                      <User className="h-3 w-3" />
                      <span className="truncate max-w-[150px]">
                        {note.profiles?.name || "Anonymous"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 pt-4 mt-2 border-t border-zinc-800/50 z-10">
                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 px-1">
                      <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-zinc-400" /> {note.view_count} views</span>
                      <span className="flex items-center gap-1.5"><Download className="h-3.5 w-3.5 text-zinc-400" /> {note.downloads_count} dls</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Link href={`/notes/${note.id}`} className="col-span-2">
                        <Button className="w-full h-10 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md">
                          Open Note
                        </Button>
                      </Link>
                      
                      <Button
                        variant="outline"
                        onClick={() => handleDownload(note.id, note.title)}
                        disabled={!!downloadingNotes[note.id]}
                        className="h-9 rounded-xl border-zinc-800 text-zinc-300 text-[11px] font-bold bg-zinc-900/50"
                      >
                        {downloadingNotes[note.id] ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
                        Download
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={(e) => { e.preventDefault(); handleToggleBookmark(note.id); }}
                        disabled={!!bookmarkingIds[note.id]}
                        className={`h-9 rounded-xl text-[11px] font-bold transition-all ${
                          bookmarkedIds.has(note.id)
                            ? "bg-pink-500/10 border-pink-500/30 text-pink-500"
                            : "border-zinc-800 text-zinc-300 bg-zinc-900/50"
                        }`}
                      >
                        {bookmarkingIds[note.id] ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Bookmark className={`h-3.5 w-3.5 mr-1.5 ${bookmarkedIds.has(note.id) ? "fill-current" : ""}`} />}
                        {bookmarkedIds.has(note.id) ? "Saved" : "Save"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination for mobile */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-zinc-800/50">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newPage = Math.max(page - 1, 1);
                      setPage(newPage);
                      updateUrl({ page: String(newPage) });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page === 1}
                    className="h-9 px-4 rounded-xl border-zinc-800 text-zinc-300 text-xs font-bold"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                  </Button>
                  <span className="text-[10px] font-bold text-zinc-500">Page {page} of {totalPages}</span>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newPage = Math.min(page + 1, totalPages);
                      setPage(newPage);
                      updateUrl({ page: String(newPage) });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page === totalPages}
                    className="h-9 px-4 rounded-xl border-zinc-800 text-zinc-300 text-xs font-bold"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop Layout ── */}
      <div className="hidden lg:flex flex-col gap-6">
      {/* Advanced Filter panel */}
      <div className="flex flex-col gap-4 bg-zinc-900/15 border border-zinc-800/40 p-5 rounded-2xl backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Box */}
          <div className="relative md:col-span-2 group">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
            <Input
              placeholder="Search by title, topic, professor, or college..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-11 bg-zinc-950/60 border-zinc-800 focus:border-indigo-500/50 focus:ring-indigo-500/10 text-zinc-100 rounded-xl h-12 shadow-inner"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="w-full bg-zinc-950/60 border border-zinc-800 text-xs rounded-xl h-12 px-4 text-zinc-300 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer appearance-none shadow-inner"
            >
              <option value="relevance">Sort by: Relevance</option>
              <option value="newest">Sort by: Newest Uploads</option>
              <option value="downloads">Sort by: Most Downloaded</option>
              <option value="views">Sort by: Most Viewed</option>
              <option value="highest_rated">Sort by: Highest Rated</option>
              <option value="most_reviewed">Sort by: Most Reviewed</option>
            </select>
            <div className="absolute right-4 top-4 pointer-events-none text-zinc-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Branch Dropdown */}
          <div className="relative">
            <select
              value={selectedBranch}
              onChange={handleBranchChange}
              className="w-full bg-zinc-950/60 border border-zinc-800 text-xs rounded-xl h-12 px-4 text-zinc-300 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer appearance-none shadow-inner"
            >
              <option value="all">All Engineering Branches</option>
              {initialBranches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} ({branch.code})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-4 pointer-events-none text-zinc-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

          {/* Semester Dropdown */}
          <div className="relative">
            <select
              value={selectedSemester}
              onChange={handleSemesterChange}
              className="w-full bg-zinc-950/60 border border-zinc-800 text-xs rounded-xl h-12 px-4 text-zinc-300 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer appearance-none shadow-inner"
            >
              <option value="0">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={String(sem)}>
                  Semester {sem}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-4 pointer-events-none text-zinc-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

          {/* Subject Dropdown (Dynamic based on selected branch) */}
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={handleSubjectChange}
              disabled={selectedBranch === "all" || isLoadingSubjects}
              className="w-full bg-zinc-950/60 border border-zinc-800 text-xs rounded-xl h-12 px-4 text-zinc-300 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer appearance-none shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedBranch === "all" ? (
                <option value="all">Select a branch first to filter subjects</option>
              ) : isLoadingSubjects ? (
                <option value="all">Loading subjects...</option>
              ) : subjects.length === 0 ? (
                <option value="all">No subjects found for this selection</option>
              ) : (
                <>
                  <option value="all">All Subjects</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </>
              )}
            </select>
            <div className="absolute right-4 top-4 pointer-events-none text-zinc-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      {!isLoadingNotes && (
        <div className="flex items-center justify-between text-xs text-zinc-500 px-1 font-semibold">
          <span>Found {totalCount} matching note{totalCount !== 1 ? "s" : ""}</span>
          {totalPages > 1 && (
            <span>
              Page {page} of {totalPages}
            </span>
          )}
        </div>
      )}

      {/* Note list or Skeletons */}
      {isLoadingNotes ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <Card
              key={i}
              className="border border-zinc-800/40 bg-zinc-900/10 p-5 rounded-2xl animate-pulse h-60 flex flex-col justify-between"
            >
              <div className="flex flex-col gap-3">
                <div className="h-4 bg-zinc-800 rounded w-1/4" />
                <div className="h-5 bg-zinc-800 rounded w-3/4 mt-2" />
                <div className="h-3 bg-zinc-800 rounded w-full mt-2" />
                <div className="h-3 bg-zinc-800 rounded w-5/6" />
              </div>
              <div className="h-8 bg-zinc-800 rounded w-full mt-4" />
            </Card>
          ))}
        </div>
      ) : errorMsg ? (
        <Card className="bg-red-500/10 border-red-500/20 text-red-400 backdrop-blur-md">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center gap-5">
            <div className="bg-red-500/20 p-4 rounded-full border border-red-500/30 shadow-md">
              <FileWarning className="h-8 w-8 text-red-400" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-bold text-xl text-red-300">Database Configuration Error</h3>
              <p className="text-sm text-red-400 max-w-lg mx-auto">
                {errorMsg.includes("function public.search_notes") || errorMsg.includes("42883") 
                  ? "The database is missing required search functions (search_notes). Please run the Phase 7 database migration."
                  : errorMsg}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : notes.length === 0 ? (
        <Card className="godmode-card bg-zinc-950/40 border-zinc-800/50 shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
          <CardContent className="flex flex-col items-center justify-center py-24 text-center gap-6 relative z-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full group-hover:bg-indigo-500/30 transition-colors" />
              <div className="bg-zinc-950/80 p-5 rounded-full border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)] relative z-10">
                <Search className="h-10 w-10 text-indigo-400" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-black text-2xl text-white">No notes match your filters</h3>
              <p className="text-zinc-400 max-w-sm mx-auto font-medium">
                Try clearing your filters or upload a useful PDF for your classmates.
              </p>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <Button 
                variant="outline" 
                onClick={handleClearSearch}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl px-6 h-12 font-bold transition-colors"
              >
                Clear Search
              </Button>
              <Button 
                onClick={handleResetFilters}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] px-6 h-12 font-bold transition-all"
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <Card className="godmode-card bg-zinc-950/60 border-zinc-800/80 hover:border-indigo-500/40 p-6 rounded-2xl flex flex-col justify-between h-full transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_15px_40px_rgba(99,102,241,0.15)] group relative overflow-hidden hover-lift">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none transform translate-x-2 -translate-y-2">
                    <FileText className="h-32 w-32" />
                  </div>
                  <div className="flex flex-col gap-3 relative z-10">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-md font-black uppercase tracking-widest shadow-inner">
                        {note.subjects?.branches?.code || "Branch"} &bull; Sem {note.semester}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-bold flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-black text-white text-lg leading-snug line-clamp-1 group-hover:text-indigo-400 transition-colors duration-300 mt-2">
                      {note.title}
                    </h4>

                    {note.average_rating > 0 ? (
                      <div className="flex items-center gap-1.5 mt-[-4px]">
                        <div className="flex items-center gap-0.5 text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-3.5 h-3.5 ${i < Math.round(note.average_rating) ? 'text-yellow-500' : 'text-zinc-700'}`}>
                              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs font-bold text-zinc-300">{note.average_rating.toFixed(1)}</span>
                        <span className="text-xs text-zinc-500 font-medium">({note.total_ratings})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-[-4px]">
                        <span className="text-[11px] font-medium text-zinc-500 italic">No ratings yet</span>
                      </div>
                    )}

                    {note.description && (
                      <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">
                        {note.description}
                      </p>
                    )}

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-1 text-[11px] text-zinc-400 bg-zinc-950/30 p-3 rounded-xl border border-zinc-800/30">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <GraduationCap className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate">
                          {note.subjects?.name || "Subject"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <User className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate">
                          Uploader:{" "}
                          {note.author_id ? (
                            <Link 
                              href={`/contributors/${note.author_id}`}
                              className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
                            >
                              {note.profiles?.name || "Anonymous"}
                            </Link>
                          ) : (
                            note.profiles?.name || "Anonymous"
                          )}
                        </span>
                      </div>
                      {note.college && (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-zinc-500 shrink-0 font-bold">Inst:</span>
                          <span className="truncate">{note.college}</span>
                        </div>
                      )}
                      {note.professor && (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-zinc-500 shrink-0 font-bold">Prof:</span>
                          <span className="truncate">{note.professor}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-3 mt-4 border-t border-zinc-800/50">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-1">
                      <span>{note.downloads_count} downloads</span>
                      <span>{note.view_count} views</span>
                      <span>{note.bookmarks_count} bookmarks</span>
                    </div>

                     <div className="grid grid-cols-2 gap-2 mt-2">
                      <Link
                        href={`/notes/${note.id}`}
                        className={cn(
                          buttonVariants({ variant: "default", size: "sm" }),
                          "bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-3 rounded-xl gap-2 font-bold h-10 shadow-[0_0_15px_rgba(99,102,241,0.2)] inline-flex items-center justify-center transition-all w-full"
                        )}
                      >
                        <Eye className="h-4 w-4" /> View Note
                      </Link>
                      <Link
                        href={`/dashboard/study-copilot/sprint/${note.id}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 text-xs py-3 rounded-xl gap-2 font-bold h-10 inline-flex items-center justify-center transition-all w-full"
                        )}
                      >
                        <Bot className="h-4 w-4" /> Study
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Button
                        variant="outline"
                        onClick={() => handleDownload(note.id, note.title)}
                        disabled={!!downloadingNotes[note.id]}
                        className="border-zinc-800 text-zinc-300 hover:bg-zinc-800/50 hover:text-white text-xs py-3 rounded-xl gap-2 font-bold h-10 transition-colors"
                      >
                        {downloadingNotes[note.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleBookmark(note.id);
                        }}
                        disabled={!!bookmarkingIds[note.id]}
                        className={`border-zinc-800 text-xs py-3 rounded-xl gap-2 font-bold h-10 transition-colors ${
                          bookmarkedIds.has(note.id) 
                            ? "bg-pink-500/10 text-pink-500 border-pink-500/20 hover:bg-pink-500/20 shadow-inner" 
                            : "text-zinc-300 hover:bg-zinc-800/50 hover:text-white"
                        }`}
                      >
                        {bookmarkingIds[note.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Bookmark className={`h-4 w-4 ${bookmarkedIds.has(note.id) ? "fill-pink-500" : ""}`} />
                        )}
                        {bookmarkedIds.has(note.id) ? "Saved" : "Save"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && !isLoadingNotes && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newPage = Math.max(page - 1, 1);
              setPage(newPage);
              updateUrl({ page: String(newPage) });
            }}
            disabled={page === 1}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800/30 h-9 px-3 rounded-xl font-bold gap-1 text-xs"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>

          <div className="flex items-center gap-1.5">
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              const isCurrent = pageNumber === page;
              return (
                <Button
                  key={pageNumber}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setPage(pageNumber);
                    updateUrl({ page: String(pageNumber) });
                  }}
                  className={`h-9 w-9 rounded-xl font-bold text-xs ${
                    isCurrent
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                      : "border-zinc-800 text-zinc-300 hover:bg-zinc-800/30"
                  }`}
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newPage = Math.min(page + 1, totalPages);
              setPage(newPage);
              updateUrl({ page: String(newPage) });
            }}
            disabled={page === totalPages}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800/30 h-9 px-3 rounded-xl font-bold gap-1 text-xs"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}

export default function BrowseNotesClient(props: { initialBranches: Branch[], initialBookmarkedIds?: string[] }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500 animate-pulse flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Loading library...</div>}>
      <BrowseNotesContent {...props} />
    </Suspense>
  );
}
