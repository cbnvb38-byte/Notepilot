"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Layers,
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
  Lock,
  BookOpen,
  FileSearch,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  generateMultiPdfStudyPackAction,
  resolveMultiPdfNoteStatusAction,
  triggerDocumentReadingForNoteAction,
  MultiPdfPackType,
  NoteResolvedStatus,
} from "@/app/actions/multi-pdf";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccessibleNote {
  id: string;
  title: string;
  subject: string;
  semester: string;
}

interface MultiPdfClientProps {
  isPremiumActive: boolean;
  accessibleNotes: AccessibleNote[];
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function NoteStatusBadge({
  noteId,
  noteStatuses,
  resolvingNotes,
}: {
  noteId: string;
  noteStatuses: Record<string, NoteResolvedStatus>;
  resolvingNotes: Set<string>;
}) {
  if (resolvingNotes.has(noteId)) {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 shrink-0">
        <Loader2 className="h-2.5 w-2.5 animate-spin" />
        Checking…
      </span>
    );
  }

  const s = noteStatuses[noteId];
  if (!s) return null;

  if (s.status === "ready_text") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shrink-0">
        <Check className="h-2.5 w-2.5" />
        Text ready
      </span>
    );
  }
  if (s.status === "ready_saved_result") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20 shrink-0">
        <BookOpen className="h-2.5 w-2.5" />
        Using saved AI result
      </span>
    );
  }
  if (s.status === "needs_document_reading") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0">
        <AlertCircle className="h-2.5 w-2.5" />
        Needs reading
      </span>
    );
  }
  if (s.status === "error") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20 shrink-0">
        <AlertCircle className="h-2.5 w-2.5" />
        Error
      </span>
    );
  }
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MultiPdfStudyPackClient({
  isPremiumActive,
  accessibleNotes,
}: MultiPdfClientProps) {
  const router = useRouter();

  // Modal open/close
  const [isOpen, setIsOpen] = useState(false);

  // Note selection
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

  // Pack type
  const [packType, setPackType] = useState<MultiPdfPackType>(
    "multi_pdf_summary"
  );

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [successGenerationId, setSuccessGenerationId] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Per-note content resolution
  const [noteStatuses, setNoteStatuses] = useState<
    Record<string, NoteResolvedStatus>
  >({});
  const [resolvingNotes, setResolvingNotes] = useState<Set<string>>(new Set());

  // resolvedRef tracks which noteIds have been resolved (prevents duplicate calls)
  const resolvedRef = useRef<Set<string>>(new Set());

  // Per-note document reading state
  const [docReadingStates, setDocReadingStates] = useState<
    Record<string, "loading" | "error">
  >({});

  // ── Close & reset modal ──────────────────────────────────────────────────
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSelectedNoteIds([]);
    setNoteStatuses({});
    setResolvingNotes(new Set());
    resolvedRef.current = new Set();
    setDocReadingStates({});
    setSuccessGenerationId(null);
    setError(null);
  }, []);

  // ── Resolve note statuses ────────────────────────────────────────────────
  const resolveNotes = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;

    setResolvingNotes((prev) => {
      const n = new Set(prev);
      ids.forEach((id) => n.add(id));
      return n;
    });

    try {
      const result = await resolveMultiPdfNoteStatusAction(ids);
      if (result.success) {
        const updates: Record<string, NoteResolvedStatus> = {};
        for (const s of result.statuses) updates[s.noteId] = s;
        setNoteStatuses((prev) => ({ ...prev, ...updates }));
      } else {
        console.error("[Multi PDF Notes Resolve]", result.message);
      }
    } catch (err) {
      console.error("[Multi PDF Notes Resolve Error]", err);
    } finally {
      setResolvingNotes((prev) => {
        const n = new Set(prev);
        ids.forEach((id) => n.delete(id));
        return n;
      });
    }
  }, []);

  // Auto-resolve newly selected notes
  useEffect(() => {
    const toResolve = selectedNoteIds.filter(
      (id) => !resolvedRef.current.has(id)
    );
    if (toResolve.length > 0) {
      toResolve.forEach((id) => resolvedRef.current.add(id));
      resolveNotes(toResolve);
    }
  }, [selectedNoteIds, resolveNotes]);

  // ── Note selection toggle ────────────────────────────────────────────────
  const toggleNoteSelection = (id: string) => {
    setSuccessGenerationId(null);
    setError(null);
    if (selectedNoteIds.includes(id)) {
      setSelectedNoteIds((prev) => prev.filter((n) => n !== id));
    } else {
      if (selectedNoteIds.length >= 5) {
        setError("You can select a maximum of 5 notes.");
        return;
      }
      setSelectedNoteIds((prev) => [...prev, id]);
    }
  };

  // ── Document reading for a scanned note ─────────────────────────────────
  const handleDocumentReading = async (noteId: string, noteTitle: string) => {
    setDocReadingStates((prev) => ({ ...prev, [noteId]: "loading" }));
    toast.loading(`Reading document: ${noteTitle}…`, {
      id: `doc-read-${noteId}`,
    });

    try {
      const result = await triggerDocumentReadingForNoteAction(noteId);

      if (result.success) {
        toast.success("Document read! Note is now ready.", {
          id: `doc-read-${noteId}`,
        });
        // Clear old status, clear docReadingState, re-resolve this note
        setDocReadingStates((prev) => {
          const n = { ...prev };
          delete n[noteId];
          return n;
        });
        setNoteStatuses((prev) => {
          const n = { ...prev };
          delete n[noteId];
          return n;
        });
        // Allow resolveNotes to re-run for this noteId (resolvedRef keeps it)
        await resolveNotes([noteId]);
      } else {
        toast.error(result.message || "Document reading failed.", {
          id: `doc-read-${noteId}`,
        });
        setDocReadingStates((prev) => ({ ...prev, [noteId]: "error" }));
      }
    } catch (err) {
      toast.error("Document reading failed. Please try again.", {
        id: `doc-read-${noteId}`,
      });
      setDocReadingStates((prev) => ({ ...prev, [noteId]: "error" }));
    }
  };

  // ── Readiness computation ────────────────────────────────────────────────
  const isResolving = selectedNoteIds.some((id) => resolvingNotes.has(id));

  const allResolved =
    selectedNoteIds.length >= 2 &&
    selectedNoteIds.every(
      (id) => !resolvingNotes.has(id) && !!noteStatuses[id]
    );

  const allReady =
    allResolved &&
    selectedNoteIds.every((id) => {
      const s = noteStatuses[id];
      return s?.status === "ready_text" || s?.status === "ready_saved_result";
    });

  const hasNotReady = allResolved && !allReady;

  const canGenerate =
    selectedNoteIds.length >= 2 &&
    selectedNoteIds.length <= 5 &&
    allReady &&
    !isGenerating &&
    !successGenerationId;

  // ── Generate handler ─────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!packType) {
      setError("Choose a valid study pack type.");
      return;
    }
    if (selectedNoteIds.length < 2 || selectedNoteIds.length > 5) {
      setError("Select 2 to 5 notes.");
      return;
    }
    if (!allReady) {
      setError("Some selected notes are not ready.");
      return;
    }

    console.log("[MultiPDF Generate Click]", packType, selectedNoteIds.length);

    setIsGenerating(true);
    setSuccessGenerationId(null);
    setError(null);
    toast.loading("Combining notes and generating Study Pack…", {
      id: "multi-pdf",
    });

    try {
      // Build source overrides for saved-result notes
      const sourceOverrides: Record<
        string,
        { sourceType: "saved_result"; reusedGenerationId: string }
      > = {};
      for (const noteId of selectedNoteIds) {
        const status = noteStatuses[noteId];
        if (status?.status === "ready_saved_result") {
          sourceOverrides[noteId] = {
            sourceType: "saved_result",
            reusedGenerationId: status.reusedGenerationId,
          };
        }
      }

      const res = await generateMultiPdfStudyPackAction(
        selectedNoteIds,
        packType,
        Object.keys(sourceOverrides).length > 0 ? sourceOverrides : undefined
      );

      if (!res) {
        throw new Error("Server returned no response.");
      }

      console.log("[MultiPDF Generate Response]", res.success, res.generationId, res.code, res.message);

      if (!res.success) {
        setError(res.message || "Study Pack generation failed. Please try again.");
        toast.dismiss("multi-pdf");
        return;
      }

      if (res.success && res.generationId) {
        toast.success("Study Pack generated and saved.", { id: "multi-pdf" });
        setSuccessGenerationId(res.generationId);
        router.refresh();
      } else {
        setError("Study Pack was generated but could not be saved. Please try again.");
        toast.dismiss("multi-pdf");
      }
    } catch (error: any) {
      console.error("[Multi PDF Client Error]", error);
      setError(error.message || "An unexpected error occurred while generating.");
      toast.dismiss("multi-pdf");
    } finally {
      setIsGenerating(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // LOCKED STATE (non-premium)
  // ─────────────────────────────────────────────────────────────────────────
  if (!isPremiumActive) {
    return (
      <div className="bg-zinc-950/40 border border-zinc-800/80 p-6 rounded-3xl flex flex-col gap-5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-zinc-100 font-bold text-lg flex items-center gap-2">
                Multi-PDF Study Pack
                <span className="bg-gradient-to-r from-amber-500 to-orange-400 text-zinc-950 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest flex items-center gap-1">
                  Premium
                </span>
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono mt-1 mb-1 text-emerald-400">
                Multi-PDF card mounted
              </p>
              <p className="text-sm text-zinc-400 mt-0.5">
                Combine 2-5 notes into one exam-ready study pack.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 relative z-10 mt-auto">
          <Link href="/pricing" className="w-full">
            <Button className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold border border-zinc-800">
              <Lock className="mr-2 h-4 w-4 text-zinc-500" /> Unlock with
              Premium
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PREMIUM STATE
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Card ── */}
      <div className="bg-zinc-950/40 border border-indigo-500/20 p-6 rounded-3xl flex flex-col gap-5 relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-zinc-100 font-bold text-lg flex items-center gap-2">
                Multi-PDF Study Pack
                <span className="bg-gradient-to-r from-amber-500 to-orange-400 text-zinc-950 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest flex items-center gap-1">
                  Premium
                </span>
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono mt-1 mb-1 text-emerald-400">
                Multi-PDF card mounted
              </p>
              <p className="text-sm text-zinc-400 mt-0.5">
                Combine 2-5 notes into one exam-ready study pack.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 relative z-10 mt-auto">
          <Button
            onClick={() => setIsOpen(true)}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
          >
            <Sparkles className="mr-2 h-4 w-4" /> Create Study Pack
          </Button>
        </div>
      </div>

      {/* ── Modal ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-3xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30 shrink-0">
              <div>
                <h2 className="text-xl font-black text-white">
                  Create Study Pack
                </h2>
                <p className="text-sm text-zinc-400">
                  Select 2 to 5 notes to combine.
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={closeModal}
                className="text-zinc-400 hover:text-white rounded-full"
              >
                ✕
              </Button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* ── 1. Pack Type ── */}
              <div>
                <h3 className="text-sm font-bold text-zinc-300 mb-3 uppercase tracking-wider">
                  1. Select Pack Type
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "multi_pdf_summary", label: "Combined Summary" },
                    {
                      id: "multi_pdf_important_questions",
                      label: "Important Questions",
                    },
                    {
                      id: "multi_pdf_revision_sheet",
                      label: "Final Revision Sheet",
                    },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setPackType(t.id as MultiPdfPackType);
                        setError(null);
                      }}
                      className={`p-3 rounded-xl border text-sm font-bold transition-all flex flex-col items-center justify-center text-center gap-1
                        ${
                          packType === t.id
                            ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── 2. Note Selection ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                    2. Select Notes
                  </h3>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-md ${
                      selectedNoteIds.length >= 2 &&
                      selectedNoteIds.length <= 5
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {selectedNoteIds.length} / 5 selected
                  </span>
                </div>

                {accessibleNotes.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-zinc-800 text-center flex flex-col items-center gap-3">
                    <p className="text-zinc-500 text-sm">
                      No study notes available yet.
                    </p>
                    <div className="flex gap-2">
                      <Link href="/dashboard/browse">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-500/5"
                        >
                          Browse Notes
                        </Button>
                      </Link>
                      <Link href="/dashboard/upload">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-zinc-400 hover:text-zinc-300 border border-zinc-700 hover:border-zinc-600"
                        >
                          Upload Note
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {accessibleNotes.map((note) => {
                      const isSelected = selectedNoteIds.includes(note.id);
                      const noteStatus = noteStatuses[note.id];
                      const isResolving = resolvingNotes.has(note.id);
                      const needsReading =
                        isSelected &&
                        noteStatus?.status === "needs_document_reading";
                      const docReading = docReadingStates[note.id];

                      return (
                        <div key={note.id} className="flex flex-col gap-1.5">
                          {/* Note card (clickable for selection) */}
                          <button
                            onClick={() => toggleNoteSelection(note.id)}
                            className={`p-4 rounded-xl border text-left flex flex-col gap-1.5 transition-all w-full
                              ${
                                isSelected
                                  ? needsReading
                                    ? "bg-amber-500/5 border-amber-500/30"
                                    : "bg-indigo-500/10 border-indigo-500/50"
                                  : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                              }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className={`text-sm font-bold line-clamp-2 ${
                                  isSelected
                                    ? needsReading
                                      ? "text-amber-300"
                                      : "text-indigo-300"
                                    : "text-zinc-200"
                                }`}
                              >
                                {note.title || "Untitled Note"}
                              </span>
                              {isSelected && !needsReading && (
                                <Check className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                              )}
                            </div>

                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                              {note.subject
                                ? `${note.subject} • `
                                : ""}
                              Sem {note.semester}
                            </span>

                            {/* Status badge (shown only when selected) */}
                            {isSelected && (
                              <div className="mt-0.5">
                                <NoteStatusBadge
                                  noteId={note.id}
                                  noteStatuses={noteStatuses}
                                  resolvingNotes={resolvingNotes}
                                />
                              </div>
                            )}
                          </button>

                          {/* Use Document Reading button (below card, only when needed) */}
                          {needsReading && (
                            <div
                              className="px-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {docReading === "loading" ? (
                                <div className="flex items-center gap-2 text-[11px] text-amber-400 font-semibold px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                  <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                                  Reading document…
                                </div>
                              ) : (
                                <div className="flex flex-col gap-1.5">
                                  <p className="text-[10px] text-amber-400/80 px-1">
                                    This PDF is scanned. No saved result found.
                                  </p>
                                  <div className="flex gap-1.5">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleDocumentReading(
                                          note.id,
                                          note.title
                                        )
                                      }
                                      className="h-7 text-[10px] font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 hover:border-amber-500/50 flex-1"
                                    >
                                      <FileSearch className="h-3 w-3 mr-1" />
                                      Use Document Reading
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        toggleNoteSelection(note.id)
                                      }
                                      className="h-7 text-[10px] text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-500/30"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                  {docReading === "error" && (
                                    <p className="text-[10px] text-red-400 px-1">
                                      Document reading failed. Please try again.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Readiness message */}
                {hasNotReady && (
                  <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    This scanned note needs document reading or saved Study Copilot content first.
                  </div>
                )}

                {isResolving && selectedNoteIds.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-zinc-500 text-xs">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Checking note content…
                  </div>
                )}
              </div>

              {/* ── Success State ── */}
              {successGenerationId && (
                <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-1">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="text-emerald-400 font-bold">
                    Study Pack Ready!
                  </h3>
                  <p className="text-emerald-500/80 text-sm">
                    Study Pack generated and saved.
                  </p>
                  
                  <div className="flex flex-col gap-2 w-full mt-2">
                    <Link
                      href={`/dashboard/study-copilot/${successGenerationId}`}
                      className="w-full"
                    >
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11">
                        Open Study Pack
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 h-11 font-bold"
                      onClick={() => {
                        closeModal();
                        setTimeout(() => {
                          window.scrollTo({
                            top: document.body.scrollHeight,
                            behavior: 'smooth'
                          });
                        }, 100);
                      }}
                    >
                      View Saved Results
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full text-emerald-500/80 hover:text-emerald-400 hover:bg-emerald-500/10 h-11 font-bold mt-1"
                      onClick={() => {
                        setSuccessGenerationId(null);
                        setSelectedNoteIds([]);
                        setNoteStatuses({});
                        setResolvingNotes(new Set());
                        resolvedRef.current = new Set();
                        setError(null);
                      }}
                    >
                      Create Another Pack
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/30 flex flex-col gap-2 shrink-0">
              {/* Validation hint */}
              {selectedNoteIds.length > 0 && selectedNoteIds.length < 2 && (
                <p className="text-[11px] text-zinc-500 text-center">
                  Select at least 2 notes to generate a study pack.
                </p>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={closeModal}
                  className="text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || isResolving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 min-w-[120px] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isResolving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Checking…
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
