"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  Star,
  FileWarning,
  Loader2,
  ExternalLink,
  BookOpen,
  Bookmark,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Crown,
  Zap,
  Brain,
  Library,
  Timer,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { incrementViewCountAction, logDownloadAction, recordRecentlyViewedAction } from "@/app/actions/notes";
import { addBookmark, removeBookmark } from "@/app/actions/bookmarks";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { submitRating, removeRating } from "@/app/actions/ratings";
import { ReviewsSection } from "./reviews-section";
import { reportNote } from "@/app/actions/reports";
import { generateStudyMaterialAction, generateWithDocumentFallback } from "@/app/actions/copilot";
import { STUDY_TOOLS } from "@/lib/ai/study-tools";
import { GenerationType } from "@/lib/ai/types";
import { getUserAIUsage, UserAIUsage } from "@/app/actions/ai-usage";
import { Check } from "lucide-react";
import { CopyResultButton } from "@/components/study-copilot/copy-result-button";
import { getCopyableResultText, getGenerationTypeLabel } from "@/lib/ai/result-formatting";
import { motion, AnimatePresence } from "framer-motion";

interface RelatedNote {
  id: string;
  title: string;
  semester: number;
  downloads_count: number;
  view_count: number;
  created_at: string;
  subjects: {
    name: string;
    branches: {
      name: string;
      code: string;
    } | null;
  } | null;
}

interface NoteDetails {
  id: string;
  title: string;
  description: string | null;
  semester: number;
  college: string | null;
  professor: string | null;
  downloads_count: number;
  bookmarks_count: number;
  view_count: number;
  created_at: string;
  file_url: string;
  file_size: number;
  file_path: string | null;
  profiles: {
    name: string | null;
  } | null;
  author_id: string;
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

export default function NoteDetailsClient({
  initialNote,
  initialAverageRating,
  initialRatingCount,
  initialRelatedNotes,
  initialIsBookmarked,
  initialUserRating,
  initialTotalReviews,
  initialDistribution,
  initialUserReviewTitle,
  initialUserReviewText,
}: {
  initialNote: NoteDetails;
  initialAverageRating: number;
  initialRatingCount: number;
  initialTotalReviews: number;
  initialDistribution: Record<number, number>;
  initialRelatedNotes: RelatedNote[];
  initialIsBookmarked: boolean;
  initialUserRating: number;
  initialUserReviewTitle: string;
  initialUserReviewText: string;
}) {
  const { userId } = useAuth();
  const isAuthor = userId === initialNote.author_id;
  const [showMoreTools, setShowMoreTools] = useState(false);

  // Note generation state
  const [isGenerating, setIsGenerating] = useState<GenerationType | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<{ type: GenerationType, text: string, json?: Record<string, unknown> | null, id: string } | null>(null);
  const [showScannedConfirmation, setShowScannedConfirmation] = useState(false);
  const [fallbackGenerationType, setFallbackGenerationType] = useState<GenerationType | null>(null);
  
  // AI Limits State
  const [usageState, setUsageState] = useState<UserAIUsage | null>(null);
  const [isUsageLoading, setIsUsageLoading] = useState(true);

  // Counters & Interactive States
  const [note, setNote] = useState<NoteDetails>(initialNote);
  const [averageRating, setAverageRating] = useState<number>(initialAverageRating);
  const [ratingCount, setRatingCount] = useState<number>(initialRatingCount);
  const [totalReviews, setTotalReviews] = useState<number>(initialTotalReviews);
  const [distribution, setDistribution] = useState<Record<number, number>>(initialDistribution);
  
  const [userRating, setUserRating] = useState<number>(initialUserRating);
  const [userReviewTitle, setUserReviewTitle] = useState<string>(initialUserReviewTitle);
  const [userReviewText, setUserReviewText] = useState<string>(initialUserReviewText);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isRating, setIsRating] = useState(false);
  const [relatedNotes] = useState<RelatedNote[]>(initialRelatedNotes);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // Report Note state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Ask Doubt state
  const [isDoubtModalOpen, setIsDoubtModalOpen] = useState(false);
  const [doubtQuestion, setDoubtQuestion] = useState("");

  useEffect(() => {
    async function loadUsage() {
      if (!userId) {
        setIsUsageLoading(false);
        return;
      }
      const res = await getUserAIUsage();
      if (res.success && res.data) {
        setUsageState(res.data);
      }
      setIsUsageLoading(false);
    }
    loadUsage();
  }, [userId]);

  const handleToggleBookmark = async () => {
    if (isBookmarking) return; // Guard against rapid clicks

    try {
      setIsBookmarking(true);
      const currentlyBookmarked = isBookmarked;
      
      // Optimistic Update
      setIsBookmarked(!currentlyBookmarked);
      setNote((prev) => ({
        ...prev,
        bookmarks_count: prev.bookmarks_count + (currentlyBookmarked ? -1 : 1),
      }));

      const res = currentlyBookmarked
        ? await removeBookmark(note.id)
        : await addBookmark(note.id);

      if (!res.success) {
        // Revert Optimistic Update
        setIsBookmarked(currentlyBookmarked);
        setNote((prev) => ({
          ...prev,
          bookmarks_count: prev.bookmarks_count + (currentlyBookmarked ? 1 : -1),
        }));
        toast.error(`Failed to ${currentlyBookmarked ? "remove" : "add"} bookmark.`);
      } else {
        toast.success(currentlyBookmarked ? "Bookmark removed" : "Bookmark added");
      }
    } catch {
      toast.error("An error occurred while bookmarking.");
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleRatingUpdate = (avg: number, count: number, totalRevs: number, dist: Record<number, number>) => {
    setAverageRating(avg);
    setRatingCount(count);
    setTotalReviews(totalRevs);
    setDistribution(dist);
  };
  // Record recently viewed once per page load for logged in users
  const hasRecordedView = useRef(false);
  useEffect(() => {
    if (hasRecordedView.current || !userId) return;
    hasRecordedView.current = true;
    
    // Fire and forget, failure won't break page
    recordRecentlyViewedAction(note.id).catch(() => {});
  }, [note.id, userId]);


  // Increment view count exactly once per session
  useEffect(() => {
    const sessionKey = `viewed_note_${note.id}`;
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }
    
    // Set synchronously to prevent React Strict Mode from firing it twice concurrently
    sessionStorage.setItem(sessionKey, "pending");

    async function incrementView() {
      try {
        const res = await incrementViewCountAction(note.id);
        if (res.success) {
          // Increment locally
          setNote((prev) => ({ ...prev, view_count: prev.view_count + 1 }));
          sessionStorage.setItem(sessionKey, "true");
        } else {
          sessionStorage.removeItem(sessionKey);
        }
      } catch (err) {
        console.error("Failed to increment view count:", err);
        sessionStorage.removeItem(sessionKey);
      }
    }

    incrementView();
  }, [note.id]);

  // Handle Note Download
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadError("");

      const res = await logDownloadAction(note.id);

      if (res.success && "data" in res && res.data) {
        const fileUrl = res.data.fileUrl;
        
        // Trigger direct browser download
        const link = document.createElement("a");
        link.href = fileUrl;
        link.setAttribute("download", `${note.title.replace(/\s+/g, "_")}.pdf`);
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Increment local download counter
        setNote((prev) => ({ ...prev, downloads_count: prev.downloads_count + 1 }));
      } else {
        const errObj = "error" in res ? res.error : null;
        throw new Error(errObj?.message || "Failed to log download.");
      }
    } catch (err) {
      console.error("[Download Error]:", err);
      setDownloadError(err instanceof Error ? err.message : "Unable to download note. Please try again later.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) {
      toast.error("Please select a reason for reporting.");
      return;
    }
    if (reportReason === "Other" && !reportDetails.trim()) {
      toast.error("Please provide additional details for the 'Other' reason.");
      return;
    }
    if (reportDetails.length > 1000) {
      toast.error("Details cannot exceed 1000 characters.");
      return;
    }

    try {
      setIsSubmittingReport(true);
      const res = await reportNote(note.id, reportReason, reportDetails);
      if (res.success) {
        toast.success("Note reported successfully. Thank you for your feedback.");
        setIsReportModalOpen(false);
        setReportReason("");
        setReportDetails("");
      } else {
        const err = "error" in res ? res.error : null;
        toast.error(err?.message || "Failed to submit report.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while submitting the report.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Convert bytes to MB helper
  const formatFileSize = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const handleGenerate = async (generationType: GenerationType, userQuestion?: string) => {
    if (isGenerating !== null) return;
    
    if (!userId) {
      toast.error("Please sign in to generate study materials.");
      return;
    }
    
    // For now, only summary, mcq, flashcards, important_questions, and doubt_answer are enabled.
    if (generationType !== "summary" && generationType !== "mcq" && generationType !== "flashcards" && generationType !== "important_questions" && generationType !== "doubt_answer") {
      toast.info("This feature will be enabled in a later phase.");
      return;
    }

    if (usageState && usageState.usedThisMonth >= usageState.monthlyLimit) {
      toast.error(usageState.plan === "premium" ? "You have reached your premium monthly AI limit for this month." : "You have used all free AI generations for this month.");
      return;
    }

    setIsGenerating(generationType);
    setGenerateError(null);
    setShowScannedConfirmation(false);
    
    try {
      const res = await generateStudyMaterialAction(note.id, generationType, userQuestion);
      
      if (res.success && res.data) {
        toast.success(res.message || "Generated successfully.");
        setGeneratedResult({ type: generationType, text: res.data.resultText || "", json: res.data.resultJson, id: res.data.id });
      } else {
        if (res.error && 'code' in res.error && res.error.code === "SCANNED_PDF_CONFIRM_REQUIRED") {
          setFallbackGenerationType(generationType);
          setShowScannedConfirmation(true);
        } else {
          const errorMsg = res.error?.message || "Failed to generate study material.";
          setGenerateError(errorMsg);
          toast.error(errorMsg);
        }
      }
    } catch (error: any) {
      const errorMsg = error.message || "An unexpected error occurred.";
      setGenerateError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleDocumentFallback = async () => {
    if (isGenerating !== null) return;

    if (!userId) {
      toast.error("Please sign in to generate study materials.");
      return;
    }
    
    if (!fallbackGenerationType) return;
    
    if (usageState && usageState.usedThisMonth >= usageState.monthlyLimit) {
      toast.error(usageState.plan === "premium" ? "You have reached your premium monthly AI limit for this month." : "You have used all free AI generations for this month.");
      return;
    }

    setIsGenerating(fallbackGenerationType);
    setGenerateError(null);
    setShowScannedConfirmation(false);
    
    try {
      const res = await generateWithDocumentFallback(note.id, fallbackGenerationType, doubtQuestion || undefined);
      
      if (res.success && res.data) {
        toast.success(res.message || "Generated successfully.");
        setGeneratedResult({ type: fallbackGenerationType, text: res.data.resultText || "", json: res.data.resultJson, id: res.data.id });
      } else {
        const errorMsg = res.error?.message || "Failed to generate study material.";
        setGenerateError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error.message || "An unexpected error occurred.";
      setGenerateError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleAskDoubtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating !== null) return;
    if (!doubtQuestion.trim()) {
      toast.error("Please enter a question.");
      return;
    }
    setIsDoubtModalOpen(false);
    handleGenerate("doubt_answer", doubtQuestion);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Back Button */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/browse">
          <Button
            variant="ghost"
            className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900/50 rounded-xl gap-2 font-semibold h-10 px-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Library
          </Button>
        </Link>

        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
          {note.subjects?.branches?.code || "Branch"} &bull; Sem {note.semester}
        </span>
      </div>

      {downloadError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold">
          <FileWarning className="h-5 w-5 shrink-0" />
          {downloadError}
        </div>
      )}

      {/* Main Content Layout */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        
        {/* Left Side: PDF Preview (2 Columns on large screens) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="godmode-card bg-zinc-950/60 backdrop-blur-xl border-zinc-800/80 overflow-hidden h-[700px] flex flex-col shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative">
            <CardHeader className="pb-4 border-b border-zinc-800/60 flex-row items-center justify-between gap-3 bg-zinc-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                  <FileText className="h-5 w-5 text-indigo-400" />
                </div>
                <CardTitle className="text-base font-black text-zinc-100 font-sans tracking-tight">Document Preview</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 h-9 px-4 gap-2 text-xs rounded-xl font-bold disabled:opacity-50 transition-all hover:border-zinc-600"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Open in New Tab <ExternalLink className="h-4 w-4" /></>
                )}
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative bg-zinc-950">
              {!previewError ? (
                <iframe
                  src={`${note.file_url}#toolbar=0`}
                  onError={() => setPreviewError(true)}
                  className="w-full h-full border-none opacity-90 hover:opacity-100 transition-opacity"
                  title={note.title}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-5">
                  <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <FileText className="h-8 w-8 text-zinc-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-zinc-300">Unable to load preview</h3>
                    <p className="text-sm text-zinc-500 max-w-sm mt-2 leading-relaxed font-medium">
                      Your browser does not support inline PDF previews or blocks them. Click below to view the document.
                    </p>
                  </div>
                  <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="glow-border bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm py-3 px-8 rounded-xl font-bold h-12 shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50 mt-2"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : null}
                    Open PDF Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Note Metadata & Info */}
        <div className="flex flex-col gap-6">
          <Card className="godmode-card bg-zinc-950/60 backdrop-blur-xl border-zinc-800/80 shadow-[0_15px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-between">
            <CardHeader className="pb-5 border-b border-zinc-800/60 flex flex-col gap-3 bg-zinc-950/50">
              <h1 className="text-2xl font-black text-white leading-tight tracking-tight">
                {note.title}
              </h1>
              {note.description && (
                <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                  {note.description}
                </p>
              )}
            </CardHeader>

            <CardContent className="pt-6 flex flex-col gap-6">
              {/* Info Rows */}
              <div className="flex flex-col gap-4 text-sm font-medium">
                {/* Subject Info */}
                <div className="flex items-center justify-between py-2 border-b border-zinc-800/40">
                  <span className="text-zinc-500 flex items-center gap-2">
                    <GraduationCap className="h-4.5 w-4.5 text-zinc-600" /> Subject
                  </span>
                  <span className="text-zinc-200 font-bold text-right truncate max-w-[180px]">
                    {note.subjects?.name || "N/A"}
                  </span>
                </div>

                {/* Branch Info */}
                <div className="flex items-center justify-between py-2 border-b border-zinc-800/40">
                  <span className="text-zinc-500 flex items-center gap-2">
                    <BookOpen className="h-4.5 w-4.5 text-zinc-600" /> Branch
                  </span>
                  <span className="text-zinc-200 font-bold text-right truncate max-w-[180px]">
                    {note.subjects?.branches?.name || "N/A"}
                  </span>
                </div>

                {/* College Info */}
                {note.college && (
                  <div className="flex items-center justify-between py-2 border-b border-zinc-800/40">
                    <span className="text-zinc-500 flex items-center gap-2">
                      <GraduationCap className="h-4.5 w-4.5 text-zinc-600" /> College
                    </span>
                    <span className="text-zinc-200 font-bold text-right truncate max-w-[180px]">
                      {note.college}
                    </span>
                  </div>
                )}

                {/* Professor Info */}
                {note.professor && (
                  <div className="flex items-center justify-between py-2 border-b border-zinc-800/40">
                    <span className="text-zinc-500 flex items-center gap-2">
                      <User className="h-4.5 w-4.5 text-zinc-600" /> Professor
                    </span>
                    <span className="text-zinc-200 font-bold text-right truncate max-w-[180px]">
                      {note.professor}
                    </span>
                  </div>
                )}

                {/* Uploader Info */}
                <div className="flex items-center justify-between py-2 border-b border-zinc-800/40">
                  <span className="text-zinc-500 flex items-center gap-2">
                    <User className="h-4.5 w-4.5 text-zinc-600" /> Contributor
                  </span>
                  <span className="text-zinc-200 font-bold text-right truncate max-w-[180px]">
                    {note.author_id ? (
                      <Link 
                        href={`/contributors/${note.author_id}`}
                        className="text-indigo-400 hover:text-indigo-300 hover:underline font-bold"
                      >
                        {note.profiles?.name || "Anonymous"}
                      </Link>
                    ) : (
                      note.profiles?.name || "Anonymous"
                    )}
                  </span>
                </div>

                {/* File Details */}
                <div className="flex items-center justify-between py-2 border-b border-zinc-800/40">
                  <span className="text-zinc-500 flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-zinc-600" /> Upload Date
                  </span>
                  <span className="text-zinc-200 font-bold" suppressHydrationWarning>
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-zinc-800/40">
                  <span className="text-zinc-500 flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-zinc-600" /> File Size
                  </span>
                  <span className="text-zinc-200 font-bold">
                    {formatFileSize(note.file_size)}
                  </span>
                </div>

              </div>

              {/* Statistics Grid */}
              <div className="bg-zinc-950/80 p-5 border border-zinc-800/80 rounded-2xl grid grid-cols-2 gap-4 divide-x divide-zinc-800/50 text-center shadow-inner">
                <div className="flex flex-col">
                  <span className="text-base font-black text-zinc-100 flex items-center justify-center gap-2">
                    <Eye className="h-4.5 w-4.5 text-zinc-500" /> {note.view_count}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-1.5">Total Views</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black text-zinc-100 flex items-center justify-center gap-2">
                    <Download className="h-4.5 w-4.5 text-zinc-500" /> {note.downloads_count}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-1.5">Downloads</span>
                </div>
              </div>

              {/* Actions Grid */}
              <div className="flex flex-col gap-3 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleToggleBookmark}
                    disabled={isBookmarking}
                    variant="outline"
                    className={`w-full font-black flex items-center justify-center gap-2 rounded-xl text-sm h-14 shadow-xl transition-all active:scale-[0.98] ${
                      isBookmarked 
                        ? "bg-pink-500/10 text-pink-500 border-pink-500/20 hover:bg-pink-500/20" 
                        : "border-zinc-800/80 bg-zinc-950 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700"
                    }`}
                  >
                    {isBookmarking ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-pink-500" : ""}`} /> 
                        {isBookmarked ? "Saved" : "Save Note"}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full glow-border bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black flex items-center justify-center gap-2 rounded-xl text-sm h-14 shadow-xl shadow-indigo-500/20 disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5" /> Download PDF
                      </>
                    )}
                  </Button>
                </div>
                {userId && (
                  <Button
                    onClick={() => setIsReportModalOpen(true)}
                    disabled={isAuthor}
                    variant="outline"
                    className="w-full bg-zinc-950 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 font-bold flex items-center justify-center gap-2 rounded-xl text-sm h-12 shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    title={isAuthor ? "You cannot report your own note." : undefined}
                  >
                    <FileWarning className="h-4.5 w-4.5" /> Report Note
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Study Copilot Foundation Panel */}
          
          {/* ── Desktop Layout ── */}
          <Card className="hidden lg:flex godmode-card bg-zinc-950/60 backdrop-blur-xl border-zinc-800/80 shadow-[0_15px_40px_rgba(0,0,0,0.5)] overflow-hidden flex-col mt-2">
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/5 pointer-events-none opacity-50" />
            
            <CardHeader className="pb-5 border-b border-zinc-800/60 relative z-10 flex flex-row items-start gap-4 bg-zinc-950/50">
              <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 shrink-0 shadow-inner">
                <Sparkles className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <CardTitle className="text-base font-black text-white leading-tight tracking-tight">Study Copilot for this note</CardTitle>
                <p className="text-xs text-zinc-400 mt-1 font-medium">Generate study material from this uploaded PDF.</p>
                {/* AI Readiness Badge */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {note.file_path ? (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-md font-black uppercase tracking-widest shadow-inner">
                      ✓ AI Ready
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-md font-black uppercase tracking-widest shadow-inner">
                      ⚠ No PDF — AI not available
                    </span>
                  )}
                </div>

                {usageState && usageState.plan === "premium" && (
                  <div className="mt-5 bg-gradient-to-br from-indigo-950/40 to-purple-950/20 border border-indigo-500/20 p-4 rounded-2xl shadow-[0_0_15px_rgba(79,70,229,0.05)] relative overflow-hidden">
                     <div className="absolute -top-2 -right-2 p-2 opacity-[0.03] pointer-events-none transform rotate-12"><Crown className="h-20 w-20 text-amber-400" /></div>
                     <div className="flex items-center gap-2 mb-3 relative z-10">
                       <span className="bg-gradient-to-r from-amber-400 to-amber-200 text-zinc-950 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-md flex items-center gap-1.5">
                         <Crown className="h-3 w-3" /> Premium Member
                       </span>
                     </div>
                     <h4 className="text-sm font-black text-indigo-100 mb-1 relative z-10">Your premium Study Copilot is active.</h4>
                     <p className="text-[11px] text-indigo-300/70 mb-5 font-medium relative z-10">Higher monthly AI limit unlocked.</p>
                     
                     <div className="flex flex-col gap-2 relative z-10">
                       <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                         <span className="text-indigo-200/60">Usage</span>
                         <span className={usageState.usedThisMonth >= usageState.monthlyLimit ? "text-amber-400" : "text-amber-300"}>
                           {usageState.usedThisMonth} <span className="text-indigo-300/50">/ {usageState.monthlyLimit}</span>
                         </span>
                       </div>
                       <div className="h-2 w-full bg-zinc-950/80 rounded-full overflow-hidden border border-indigo-500/20 shadow-inner">
                         <div 
                           className={`h-full transition-all duration-500 bg-gradient-to-r ${usageState.usedThisMonth >= usageState.monthlyLimit ? "from-red-500 to-amber-500" : "from-indigo-500 to-purple-400"} shadow-[0_0_10px_rgba(168,85,247,0.4)]`}
                           style={{ width: `${Math.min(100, (usageState.usedThisMonth / usageState.monthlyLimit) * 100)}%` }}
                         />
                       </div>
                     </div>
                  </div>
                )}

                {usageState && usageState.plan === "free" && (
                  <div className="mt-5 bg-zinc-950/80 border border-zinc-800/80 p-4 rounded-2xl shadow-inner">
                    <div className="flex items-center justify-between mb-3">
                       <span className="bg-zinc-900 text-zinc-400 border border-zinc-700/80 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-inner">
                         Free Plan
                       </span>
                    </div>
                    <div className="flex flex-col gap-2 mt-3">
                       <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                         <span className="text-zinc-500">AI Generations</span>
                         <span className={usageState.usedThisMonth >= usageState.monthlyLimit ? "text-red-400" : "text-zinc-300"}>
                           {usageState.usedThisMonth} <span className="text-zinc-600">/ {usageState.monthlyLimit}</span>
                         </span>
                       </div>
                       <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/80 shadow-inner">
                         <div 
                           className={`h-full transition-all duration-500 ${
                             usageState.usedThisMonth >= usageState.monthlyLimit 
                               ? "bg-red-500" 
                               : usageState.usedThisMonth >= (usageState.monthlyLimit * 0.8)
                                 ? "bg-amber-500"
                                 : "bg-indigo-500"
                           }`}
                           style={{ width: `${Math.min(100, (usageState.usedThisMonth / usageState.monthlyLimit) * 100)}%` }}
                         />
                       </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-zinc-800/60">
                      <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed font-medium">
                        Unlock <span className="font-bold text-zinc-200">100 monthly AI generations</span> and advanced study workflows.
                      </p>
                      <Link href="/pricing" className="block">
                        <Button className="w-full glow-border bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold h-10 text-[12px] rounded-xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]">
                          Upgrade to Premium
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-6 pb-6 flex flex-col gap-5 relative z-10">
              
              {/* Limit Reached / Near Limit Warning Card */}
              {usageState && usageState.usedThisMonth >= usageState.monthlyLimit * 0.8 && (
                <div className={`bg-zinc-950/80 border p-5 rounded-2xl flex flex-col items-start gap-4 shadow-xl animate-in fade-in slide-in-from-top-2 ${usageState.usedThisMonth >= usageState.monthlyLimit ? "border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]"}`}>
                  <div className="flex items-center gap-3">
                    <FileWarning className={`h-5 w-5 ${usageState.usedThisMonth >= usageState.monthlyLimit ? "text-red-400" : "text-amber-400"}`} />
                    <p className={`text-sm font-black tracking-tight ${usageState.usedThisMonth >= usageState.monthlyLimit ? "text-red-400" : "text-amber-400"}`}>
                      {usageState.usedThisMonth >= usageState.monthlyLimit 
                        ? (usageState.plan === "premium" ? "You have reached your premium monthly AI limit." : "You have used all free AI generations this month.")
                        : `You are close to your ${usageState.plan === "premium" ? "premium" : "free"} monthly AI limit.`}
                    </p>
                  </div>
                  {usageState.plan === "free" && (
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                      Upgrade to Premium for more monthly generations and advanced study workflows.
                    </p>
                  )}
                  <div className="flex gap-3 w-full mt-2">
                    {usageState.plan === "free" && (
                      <Link href="/pricing" className="flex-1">
                        <Button className="w-full glow-border bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold h-10 text-xs rounded-xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]">
                          Upgrade to Premium
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="outline" 
                      className="flex-1 bg-zinc-950 border-zinc-700/80 text-zinc-300 hover:bg-zinc-900 hover:text-white h-10 text-xs font-bold rounded-xl transition-all shadow-inner"
                      onClick={() => {
                        document.getElementById('saved-results-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      View Saved Results
                    </Button>
                  </div>
                </div>
              )}

              {/* Primary Tools */}
              <div className="flex flex-col gap-3">
                {STUDY_TOOLS.filter(t => t.priority === "primary").map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Button
                      key={tool.id}
                      disabled={!tool.enabled || isGenerating !== null || (usageState !== null && usageState.usedThisMonth >= usageState.monthlyLimit)}
                      variant="outline"
                      className="w-full justify-start border-zinc-800/80 text-zinc-200 h-auto py-4 px-5 relative overflow-hidden bg-zinc-950/80 flex flex-col items-start gap-2 hover:bg-zinc-900/90 hover:border-indigo-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all disabled:opacity-50 rounded-2xl group"
                      onClick={() => {
                        if (!tool.enabled) {
                          toast.info(`This tool will be enabled in a later Phase 8 step.`);
                          return;
                        }
                        if (tool.generationType === "doubt_answer") {
                          setIsDoubtModalOpen(true);
                          return;
                        }
                        handleGenerate(tool.generationType);
                      }}
                    >
                      <span className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-3 font-black text-sm text-zinc-100 group-hover:text-white transition-colors">
                          {isGenerating === tool.generationType ? <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" /> : <Icon className="h-5 w-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />} 
                          {isGenerating === tool.generationType && showScannedConfirmation === false ? (
                            tool.generationType === "doubt_answer" ? "Answering Doubt..." : "Generating " + tool.title + "..."
                          ) : (
                            tool.title
                          )}
                        </span>
                        <span className="text-[9px] bg-zinc-900 text-zinc-400 px-2.5 py-1 rounded-md border border-zinc-700/80 font-black uppercase tracking-widest shadow-inner">
                          {tool.status}
                        </span>
                      </span>
                      <span className="text-[11px] text-zinc-400 font-medium text-left pl-8 w-full whitespace-normal leading-relaxed group-hover:text-zinc-300 transition-colors">
                        {tool.description}
                      </span>
                    </Button>
                  );
                })}
              </div>

              {/* Secondary Tools Toggle */}
              <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800/60 mt-1">
                <button 
                  onClick={() => setShowMoreTools(!showMoreTools)}
                  className="flex items-center justify-between w-full py-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <span>More study tools</span>
                  {showMoreTools ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                </button>

                {showMoreTools && (
                  <div className="grid grid-cols-2 gap-3 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {STUDY_TOOLS.filter(t => t.priority === "secondary").map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <Button
                          key={tool.id}
                          disabled={!tool.enabled || isGenerating !== null || (usageState !== null && usageState.usedThisMonth >= usageState.monthlyLimit)}
                          variant="outline"
                          className="w-full justify-start border-zinc-800/80 text-zinc-300 h-auto py-3 px-4 bg-zinc-950/60 flex flex-col items-start gap-1.5 hover:bg-zinc-900/90 hover:border-indigo-500/40 hover:text-white hover:shadow-[0_0_10px_rgba(99,102,241,0.05)] disabled:opacity-50 rounded-xl transition-all group"
                          onClick={() => {
                            if (!tool.enabled) {
                              toast.info("This tool will be enabled in a later Phase 8 step.");
                              return;
                            }
                            if (tool.generationType === "doubt_answer") {
                              setIsDoubtModalOpen(true);
                              return;
                            }
                            handleGenerate(tool.generationType);
                          }}
                        >
                          <span className="flex items-center gap-2 font-bold text-xs text-zinc-300 group-hover:text-white transition-colors">
                            {isGenerating === tool.generationType ? <Loader2 className="h-4 w-4 animate-spin text-indigo-400" /> : <Icon className="h-4 w-4 text-zinc-400 group-hover:text-indigo-400 transition-colors" />} 
                            <span className="truncate">
                              {isGenerating === tool.generationType && showScannedConfirmation === false ? (tool.generationType === "doubt_answer" ? "Answering Doubt..." : "Generating " + tool.title + "...") : tool.title}
                            </span>
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Scanned PDF Confirmation */}
              {showScannedConfirmation && !generatedResult && (
                <div className="flex flex-col gap-4 p-5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl mt-4 animate-in fade-in slide-in-from-top-2 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-500/20 p-2.5 rounded-xl shrink-0 border border-indigo-500/30 shadow-inner">
                      <Sparkles className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-base font-black text-zinc-100 tracking-tight">Scanned PDF detected</h4>
                      <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                        This PDF does not contain enough selectable text. Gemini document reading can try to read the PDF and generate a Smart Summary. This may use extra API quota.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 ml-14">
                    <Button
                      onClick={handleDocumentFallback}
                      disabled={isGenerating !== null}
                      size="sm"
                      className="glow-border bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold h-10 px-5 rounded-xl shadow-xl shadow-indigo-500/20 transition-all"
                    >
                      {isGenerating !== null ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Reading scanned PDF...</>
                      ) : (
                        "Use Gemini Document Reading"
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowScannedConfirmation(false)}
                      disabled={isGenerating !== null}
                      size="sm"
                      variant="ghost"
                      className="text-zinc-400 hover:text-white hover:bg-zinc-800/80 h-10 px-4 rounded-xl font-bold"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Inline Error Display */}
              {generateError && !generatedResult && (
                <div className="flex flex-col gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl mt-4 animate-in fade-in">
                  <div className="flex items-start gap-3">
                    <FileWarning className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300 leading-relaxed font-bold">{generateError}</p>
                  </div>
                </div>
              )}

              {/* Compact success state — links to reader page, no inline expansion */}
              {generatedResult && (
                <div className="flex flex-col gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-3 animate-in fade-in shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-xs text-emerald-300 font-bold leading-snug">
                      {getGenerationTypeLabel(generatedResult.type)} saved to Study Copilot history.
                    </p>
                  </div>
                  <div className="flex gap-3 pl-11">
                    <Link
                      href={`/dashboard/study-copilot/${generatedResult.id}`}
                      className="text-xs font-black uppercase tracking-widest text-indigo-300 hover:text-white border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/30 px-4 py-2 rounded-xl transition-all shadow-inner"
                    >
                      Open Reader →
                    </Link>
                    <CopyResultButton 
                      text={getCopyableResultText({
                        id: generatedResult.id,
                        note_id: note.id,
                        generation_type: generatedResult.type,
                        status: "completed",
                        result_text: generatedResult.text,
                        result_json: generatedResult.json || null,
                        created_at: new Date().toISOString(),
                        note_title: note.title
                      })} 
                    />
                    <Link
                      href="/dashboard/study-copilot"
                      className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white border border-zinc-700/80 bg-zinc-900/80 hover:bg-zinc-800 px-4 py-2 rounded-xl transition-all shadow-inner flex items-center justify-center"
                    >
                      View in Copilot
                    </Link>
                  </div>
                </div>
              )}
              
            </CardContent>
          </Card>

          {/* ── Mobile Layout ── */}
          <div className="flex lg:hidden flex-col gap-5 mt-2 w-full pb-8">
            {/* 1. Compact premium hero */}
            <div className="flex flex-col gap-2 relative z-10 bg-zinc-950/60 p-5 rounded-2xl border border-zinc-800/80 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-black text-white tracking-tight">Study Copilot</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1 font-medium">
                Generate study material directly from this note.
              </p>
              <div className="mt-2">
                {note.file_path ? (
                  <span className="inline-block text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md font-black uppercase tracking-widest shadow-inner">
                    ✓ AI Ready
                  </span>
                ) : (
                  <span className="inline-block text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-md font-black uppercase tracking-widest shadow-inner">
                    ⚠ No PDF — AI not available
                  </span>
                )}
              </div>
            </div>

            {/* 2. Compact usage card */}
            {usageState && (
              <div className={`p-4 rounded-2xl flex flex-col gap-3 shadow-inner border ${usageState.plan === "premium" ? "bg-indigo-950/30 border-indigo-500/30" : "bg-zinc-950/60 border-zinc-800/80"}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${usageState.plan === "premium" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-zinc-900 text-zinc-400 border-zinc-700/80"}`}>
                    {usageState.plan === "premium" ? "Premium Active" : "Free Plan"}
                  </span>
                  <span className={`text-xs font-black tracking-widest uppercase ${usageState.usedThisMonth >= usageState.monthlyLimit ? "text-red-400" : (usageState.plan === "premium" ? "text-indigo-300" : "text-zinc-300")}`}>
                    {usageState.usedThisMonth} <span className={usageState.plan === "premium" ? "text-indigo-500" : "text-zinc-600"}>/ {usageState.monthlyLimit}</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full transition-all duration-700 ${usageState.usedThisMonth >= usageState.monthlyLimit ? "bg-red-500" : (usageState.plan === "premium" ? "bg-indigo-500" : "bg-zinc-400")}`}
                    style={{ width: `${Math.min(100, (usageState.usedThisMonth / usageState.monthlyLimit) * 100)}%` }}
                  />
                </div>
                {usageState.plan === "free" && (
                  <Link href="/pricing" className="mt-1">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold h-9 rounded-xl shadow-lg">
                      Upgrade to Premium
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* 4. AI tool launcher */}
            <div className="flex flex-col gap-2">
              {STUDY_TOOLS.filter(t => t.priority === "primary").map((tool) => {
                const Icon = tool.icon;
                return (
                  <Button
                    key={tool.id}
                    disabled={!tool.enabled || isGenerating !== null || (usageState !== null && usageState.usedThisMonth >= usageState.monthlyLimit)}
                    onClick={() => {
                      if (!tool.enabled) { toast.info(`This tool will be enabled in a later Phase 8 step.`); return; }
                      if (tool.generationType === "doubt_answer") { setIsDoubtModalOpen(true); return; }
                      handleGenerate(tool.generationType);
                    }}
                    variant="outline"
                    className="w-full justify-between border-zinc-800/80 bg-zinc-950/80 hover:bg-zinc-900 text-zinc-200 py-3 px-4 rounded-2xl h-auto disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                        {isGenerating === tool.generationType ? <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" /> : <Icon className="h-4 w-4 text-indigo-400" />}
                      </div>
                      <span className="text-xs font-bold">
                        {isGenerating === tool.generationType && !showScannedConfirmation ? (
                          tool.generationType === "doubt_answer" ? "Answering Doubt..." : "Generating..."
                        ) : tool.title}
                      </span>
                    </div>
                    <span className="text-[9px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700/80 font-black uppercase tracking-widest">
                      {tool.status}
                    </span>
                  </Button>
                );
              })}

              <button 
                onClick={() => setShowMoreTools(!showMoreTools)}
                className="flex items-center justify-between w-full py-2 px-1 text-[10px] font-black uppercase tracking-widest text-zinc-500"
              >
                <span>Secondary tools</span>
                {showMoreTools ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showMoreTools && (
                <div className="grid grid-cols-2 gap-2 mt-1 animate-in fade-in">
                  {STUDY_TOOLS.filter(t => t.priority === "secondary").map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Button
                        key={tool.id}
                        disabled={!tool.enabled || isGenerating !== null || (usageState !== null && usageState.usedThisMonth >= usageState.monthlyLimit)}
                        onClick={() => {
                          if (!tool.enabled) { toast.info("This tool will be enabled in a later Phase 8 step."); return; }
                          if (tool.generationType === "doubt_answer") { setIsDoubtModalOpen(true); return; }
                          handleGenerate(tool.generationType);
                        }}
                        variant="outline"
                        className="w-full justify-start gap-2 border-zinc-800/80 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-300 py-2.5 px-3 rounded-xl h-auto disabled:opacity-50 transition-all active:scale-[0.98]"
                      >
                        {isGenerating === tool.generationType ? <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" /> : <Icon className="h-3.5 w-3.5 text-zinc-400" />}
                        <span className="text-[10px] font-bold truncate">
                          {isGenerating === tool.generationType && !showScannedConfirmation ? "..." : tool.title}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. Generation result area (Mobile) */}
            {showScannedConfirmation && !generatedResult && (
              <div className="flex flex-col gap-3 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl mt-2 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-indigo-400 shrink-0" />
                  <h4 className="text-sm font-black text-zinc-100">Scanned PDF detected</h4>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  This PDF does not contain selectable text. Try Gemini reading (uses more API quota).
                </p>
                <div className="flex gap-2 mt-1">
                  <Button
                    onClick={handleDocumentFallback}
                    disabled={isGenerating !== null}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold h-9 rounded-xl"
                  >
                    {isGenerating !== null ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Use Gemini Reader
                  </Button>
                  <Button
                    onClick={() => setShowScannedConfirmation(false)}
                    disabled={isGenerating !== null}
                    variant="ghost"
                    className="text-zinc-400 text-[10px] font-bold h-9 rounded-xl border border-zinc-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {generateError && !generatedResult && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mt-2">
                <FileWarning className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 font-bold leading-relaxed">{generateError}</p>
              </div>
            )}

            {generatedResult && (
              <div className="flex flex-col gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mt-2 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                <div className="flex items-center gap-2.5">
                  <div className="p-1 bg-emerald-500/20 rounded-md">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-[11px] text-emerald-300 font-bold">
                    {getGenerationTypeLabel(generatedResult.type)} saved.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/study-copilot/${generatedResult.id}`}
                    className="flex-1 text-center py-2 text-[10px] font-black uppercase tracking-widest text-indigo-300 border border-indigo-500/40 bg-indigo-500/10 rounded-xl"
                  >
                    Open Reader
                  </Link>
                  <CopyResultButton 
                    text={getCopyableResultText({
                      id: generatedResult.id,
                      note_id: note.id,
                      generation_type: generatedResult.type,
                      status: "completed",
                      result_text: generatedResult.text,
                      result_json: generatedResult.json || null,
                      created_at: new Date().toISOString(),
                      note_title: note.title
                    })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Reviews Section */}
      <ReviewsSection 
        noteId={note.id}
        isAuthor={isAuthor}
        averageRating={averageRating}
        ratingCount={ratingCount}
        totalReviews={totalReviews}
        distribution={distribution}
        initialUserRating={userRating}
        initialUserReviewTitle={userReviewTitle}
        initialUserReviewText={userReviewText}
        onRatingUpdate={handleRatingUpdate}
      />

      {/* Related Notes Section */}
      <div className="flex flex-col gap-6 pt-10 border-t border-zinc-800/60 mt-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 text-indigo-400 p-2.5 rounded-xl border border-indigo-500/20 shadow-inner">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-black text-lg text-zinc-100 font-sans tracking-tight">Related Study Materials</h3>
            <p className="text-sm text-zinc-400 font-medium mt-1">Other approved notes matching this subject or semester.</p>
          </div>
        </div>

        {relatedNotes.length === 0 ? (
          <div className="text-sm text-zinc-500 py-8 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/50">
            No related notes available at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedNotes.map((relNote) => (
              <Link key={relNote.id} href={`/notes/${relNote.id}`}>
                <Card className="godmode-card bg-zinc-950/60 backdrop-blur-xl border-zinc-800/80 hover:bg-zinc-900/80 hover:border-indigo-500/40 p-5 rounded-2xl flex flex-col justify-between h-full transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-[0_10px_30px_rgba(99,102,241,0.15)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="flex flex-col gap-3 relative z-10">
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-md font-black uppercase tracking-widest self-start shadow-inner">
                      {relNote.subjects?.branches?.code || "Branch"} &bull; Sem {relNote.semester}
                    </span>
                    <h5 className="font-black text-zinc-100 text-sm line-clamp-2 group-hover:text-indigo-300 transition-colors duration-200 mt-1 leading-tight tracking-tight">
                      {relNote.title}
                    </h5>
                    <p className="text-[11px] text-zinc-500 font-medium truncate">
                      {relNote.subjects?.name}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 pt-4 mt-4 border-t border-zinc-800/60 relative z-10 uppercase tracking-widest">
                    <span>{relNote.downloads_count} dl</span>
                    <span suppressHydrationWarning>{new Date(relNote.created_at).toLocaleDateString()}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {isReportModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="godmode-card bg-zinc-950 border-zinc-800/80 w-full max-w-md shadow-[0_15px_50px_rgba(0,0,0,0.8)] overflow-hidden">
            <CardHeader className="border-b border-zinc-800/60 bg-zinc-900/50">
              <CardTitle className="text-base font-black text-red-400 flex items-center gap-2">
                <FileWarning className="h-5 w-5" /> Report Note
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmitReport}>
              <CardContent className="pt-6 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:border-red-500/50 focus:outline-none shadow-inner"
                  >
                    <option value="" disabled>Select a reason...</option>
                    <option value="Incorrect information">Incorrect information</option>
                    <option value="Copyright concern">Copyright concern</option>
                    <option value="Duplicate content">Duplicate content</option>
                    <option value="Inappropriate content">Inappropriate content</option>
                    <option value="Broken or unreadable file">Broken or unreadable file</option>
                    <option value="Wrong subject or semester">Wrong subject or semester</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    Details {reportReason !== "Other" && <span className="text-zinc-600 font-medium normal-case tracking-normal">(optional)</span>}
                  </label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    required={reportReason === "Other"}
                    maxLength={1000}
                    placeholder={
                      reportReason === "Other"
                        ? "Please specify the details (required)..."
                        : "Provide additional details (optional)..."
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-red-500/50 focus:outline-none min-h-[120px] resize-none shadow-inner"
                  />
                  <div className="text-[10px] text-zinc-500 font-bold text-right uppercase tracking-wider">
                    {reportDetails.length}/1000 characters
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800/60 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsReportModalOpen(false);
                      setReportReason("");
                      setReportDetails("");
                    }}
                    className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900 h-10 px-6 font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingReport || !reportReason || (reportReason === "Other" && !reportDetails.trim())}
                    className="bg-red-600 hover:bg-red-500 text-white h-10 px-6 gap-2 font-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-red-500/20 transition-all"
                  >
                    {isSubmittingReport ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      "Submit Report"
                    )}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* Ask Doubt Modal */}
      {isDoubtModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="godmode-card bg-zinc-950 border-zinc-800/80 w-full max-w-md shadow-[0_15px_50px_rgba(0,0,0,0.8)] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/5 pointer-events-none opacity-50" />
            <CardHeader className="border-b border-zinc-800/60 relative z-10 flex flex-row items-center gap-4 bg-zinc-900/50">
              <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 shrink-0 shadow-inner">
                <Sparkles className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-lg font-black text-white tracking-tight">Ask a Doubt</CardTitle>
                <p className="text-xs text-zinc-400 mt-1 font-medium">Study Copilot will answer from this note.</p>
              </div>
            </CardHeader>
            <form onSubmit={handleAskDoubtSubmit} className="relative z-10">
              <CardContent className="pt-6 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <textarea
                    value={doubtQuestion}
                    onChange={(e) => setDoubtQuestion(e.target.value)}
                    required
                    maxLength={300}
                    placeholder="e.g. What is the difference between compiler and interpreter?"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none min-h-[120px] resize-none shadow-inner transition-all"
                    autoFocus
                  />
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-right">
                    {doubtQuestion.length}/300
                  </div>
                </div>
                
                <div className="flex gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDoubtModalOpen(false);
                      setDoubtQuestion("");
                    }}
                    className="flex-1 border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:bg-zinc-900 font-bold h-12 rounded-xl transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!doubtQuestion.trim()}
                    className="flex-1 glow-border bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black gap-2 disabled:opacity-50 h-12 rounded-xl shadow-xl shadow-indigo-500/20 transition-all"
                  >
                    Ask Copilot <Sparkles className="h-4.5 w-4.5" />
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
