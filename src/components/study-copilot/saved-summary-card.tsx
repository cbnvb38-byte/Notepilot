"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Clock, Copy, Check, FileText, ExternalLink, ArrowRight, BookOpen, Trash2, Loader2, GraduationCap, HelpCircle } from "lucide-react";
import { SavedGeneration, deleteAIGenerationAction } from "@/app/actions/copilot-history";
import { getResultPreview, getCopyableResultText, getGenerationTypeLabel } from "@/lib/ai/result-formatting";
import { toast } from "sonner";

interface SavedSummaryCardProps {
  generation: SavedGeneration;
}

import { Layers } from "lucide-react";

export function SavedSummaryCard({ generation }: SavedSummaryCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedDate = new Date(generation.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

    const preview = getResultPreview(generation);
  
  const isMultiPdf = typeof generation.result_json === 'object' && generation.result_json !== null && 'is_multi_pdf' in generation.result_json;
  let titleStr = generation.note_title;
  
  let subtitleStr = "";
  if (isMultiPdf) {
    const json = generation.result_json as any;
    const selectedNotes = json.selected_notes || [];
    if (selectedNotes.length > 0) {
      titleStr = `Sources: ${selectedNotes.length} note${selectedNotes.length > 1 ? 's' : ''}`;
      const firstTwo = selectedNotes.slice(0, 2).map((n: any) => n.title).join(" • ");
      const moreCount = selectedNotes.length - 2;
      subtitleStr = moreCount > 0 ? `${firstTwo} + ${moreCount} more` : firstTwo;
    } else {
      titleStr = "Multi-PDF Study Pack";
    }
  }

  const handleCopy = async () => {
    try {
      const copyText = getCopyableResultText(generation);
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      toast.success("Copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this saved result? This cannot be undone.");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await deleteAIGenerationAction(generation.id);
      if (res.success) {
        toast.success("Saved result deleted.");
        router.refresh();
      } else {
        toast.error(res.error || "Could not delete saved result. Please try again.");
      }
    } catch {
      toast.error("Could not delete saved result. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* ── Desktop Layout ── */}
      <div className="hidden sm:flex flex-row items-start gap-4 px-5 py-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm hover:bg-zinc-900/80 hover:border-indigo-500/30 hover:shadow-[0_4px_20px_rgba(99,102,241,0.05)] transition-all group">
        <div className="flex items-start gap-4 w-auto flex-1 min-w-0">
          {/* Icon */}
          <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20 shrink-0 mt-0.5">
            {isMultiPdf ? (
              <Layers className="h-4 w-4 text-amber-400" />
            ) : generation.generation_type === "mcq" ? (
              <BookOpen className="h-4 w-4 text-indigo-400" />
            ) : generation.generation_type === "flashcards" ? (
              <GraduationCap className="h-4 w-4 text-indigo-400" />
            ) : generation.generation_type === "doubt_answer" ? (
              <HelpCircle className="h-4 w-4 text-indigo-400" />
            ) : (
              <FileText className="h-4 w-4 text-indigo-400" />
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 px-2 py-0.5 rounded-full">
                <Sparkles className="h-2.5 w-2.5" />
                {getGenerationTypeLabel(generation.generation_type)}
              </span>
              <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {formattedDate}
              </span>
            </div>
            <p className="text-sm font-bold text-zinc-100 truncate">{titleStr}</p>
            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{subtitleStr || preview}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-start w-auto gap-2 shrink-0 pt-0.5 mt-0 border-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              title="Copy summary"
              className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-200 border border-zinc-700/50 hover:border-zinc-600 bg-zinc-800/40 hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg transition-all"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete saved result"
              className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-red-400 border border-zinc-700/50 hover:border-red-500/30 bg-zinc-800/40 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          {/* Open navigates to the dedicated result reader — no Gemini, no usage */}
          <Link
            href={`/dashboard/study-copilot/${generation.id}`}
            className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 hover:border-indigo-400/40 bg-indigo-500/10 hover:bg-indigo-500/15 px-3 py-1.5 rounded-lg transition-all"
          >
            Open <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Mobile Layout ── */}
      <div className="flex sm:hidden flex-col gap-2.5 p-3.5 rounded-xl border border-zinc-800/40 bg-zinc-950/40 backdrop-blur-sm shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md">
              {isMultiPdf ? <Layers className="h-2.5 w-2.5" /> : <Sparkles className="h-2.5 w-2.5" />}
              {getGenerationTypeLabel(generation.generation_type)}
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
            {formattedDate}
          </span>
        </div>
        
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-xs font-black text-zinc-200 line-clamp-1 leading-tight">{titleStr}</p>
          <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">{subtitleStr || preview}</p>
        </div>

        <div className="flex items-center justify-between mt-1 pt-2 border-t border-zinc-800/40 gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center h-7 w-7 text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-zinc-200"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center justify-center h-7 w-7 text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-red-400 disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
            </button>
          </div>
          <Link
            href={`/dashboard/study-copilot/${generation.id}`}
            className="flex items-center justify-center h-7 px-3 gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg"
          >
            Open <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </>
  );
}

