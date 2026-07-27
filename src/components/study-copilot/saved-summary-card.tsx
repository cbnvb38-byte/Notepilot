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
    <div className="flex flex-col items-start gap-4 px-5 py-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm hover:bg-zinc-900/80 hover:border-indigo-500/30 hover:shadow-[0_4px_20px_rgba(99,102,241,0.05)] transition-all group w-full min-w-0">
      
      {/* Top Row / Icon + Meta */}
      <div className="flex items-start gap-4 w-full min-w-0">
        {/* Icon */}
        <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20 shrink-0 mt-0.5 shadow-inner">
          {isMultiPdf ? (
            <Layers className="h-5 w-5 text-amber-400" />
          ) : generation.generation_type === "mcq" ? (
            <BookOpen className="h-5 w-5 text-indigo-400" />
          ) : generation.generation_type === "flashcards" ? (
            <GraduationCap className="h-5 w-5 text-indigo-400" />
          ) : generation.generation_type === "doubt_answer" ? (
            <HelpCircle className="h-5 w-5 text-indigo-400" />
          ) : (
            <FileText className="h-5 w-5 text-indigo-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 px-2 py-0.5 rounded-full shadow-sm truncate max-w-[120px] sm:max-w-none">
              <Sparkles className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{getGenerationTypeLabel(generation.generation_type).replace('Combined Important Questions', 'Combined Qs').replace('Important Questions', 'Important Qs').replace('Smart Summary', 'Summary').replace('Practice Quiz', 'Quiz').replace('Flashcards', 'Cards')}</span>
            </span>
            <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1 uppercase tracking-wider">
              <Clock className="h-3 w-3" /> {formattedDate}
            </span>
          </div>
          <p className="text-sm font-black text-zinc-100 line-clamp-2 break-words leading-tight min-w-0 w-full overflow-hidden">{titleStr}</p>
          <p className="text-xs font-medium text-zinc-400 line-clamp-2 leading-relaxed break-words min-w-0 w-full overflow-hidden">{subtitleStr || preview}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full pt-4 border-t border-zinc-800/50 justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            title="Copy summary"
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-200 border border-zinc-700/50 hover:border-zinc-500 bg-zinc-800/40 hover:bg-zinc-700 px-3 py-2 rounded-xl transition-all shadow-sm"
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
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-400 border border-zinc-700/50 hover:border-red-500/30 bg-zinc-800/40 hover:bg-red-500/10 px-3 py-2 rounded-xl transition-all disabled:opacity-50 shadow-sm"
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Open Button */}
        <Link
          href={`/dashboard/study-copilot/${generation.id}`}
          className="flex justify-center items-center gap-1.5 text-xs font-black uppercase tracking-widest text-indigo-100 hover:text-white border border-indigo-500/50 hover:border-indigo-400 bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)] hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] w-full sm:w-auto sm:ml-auto"
        >
          Open <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

