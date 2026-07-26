"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import {
  checkAILimitBeforeGeneration,
  incrementAIUsageAfterSuccess,
  getUserAIUsage,
} from "./ai-usage";
import { saveAIGenerationResult, generateWithDocumentFallback } from "./copilot";
import { getStudyContentForNote } from "@/lib/ai/document-content";
import { normalizeMultiPdfOutputToMarkdown } from "@/lib/ai/result-formatting";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function makeClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

const isDev = process.env.NODE_ENV !== "production";

function devLog(...args: any[]) {
  if (isDev) {
    console.log("[Multi PDF]", ...args);
  }
}

// ─── Helper: Check Note Accessibility ──────────────────────────────────────────

export async function getAccessibleNotesForSelectorAction() {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, data: [] };

    const supabase = makeClient();
    const { data: notes, error } = await supabase
      .from("notes")
      .select("id, title, semester, subjects(name), status, author_id")
      .or(`status.eq.approved,author_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("[getAccessibleNotes] Error:", error.message);
      return { success: false, data: [] };
    }
    return { success: true, data: notes };
  } catch (err: any) {
    console.error("[getAccessibleNotes] Exception:", err.message);
    return { success: false, data: [] };
  }
}

export async function verifyNotesAccessibleForStudyPack(userId: string, noteIds: string[]) {
  const supabase = makeClient();
  const { data: notes, error } = await supabase
    .from("notes")
    .select("id, title, status, file_path, semester, subjects(name), author_id")
    .in("id", noteIds)
    .or(`status.eq.approved,author_id.eq.${userId}`);
    
  if (error) {
    console.error("[verifyNotesAccessible] Error:", error.message);
    return null;
  }
  return notes;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type MultiPdfPackType =
  | "multi_pdf_summary"
  | "multi_pdf_important_questions"
  | "multi_pdf_revision_sheet";

/**
 * Per-note content resolution status for the Multi-PDF modal.
 * Computed server-side by resolveMultiPdfNoteStatusAction.
 */
export type NoteResolvedStatus =
  | { noteId: string; title: string; status: "ready_text"; sourceLabel: string }
  | {
      noteId: string;
      title: string;
      status: "ready_saved_result";
      sourceLabel: string;
      reusedGenerationId: string;
      generationType: string;
    }
  | { noteId: string; title: string; status: "needs_document_reading" }
  | { noteId: string; title: string; status: "error"; message: string };

// ─── Helper: Convert saved generation to readable context text ────────────────

function buildContentTextFromSavedGeneration(gen: {
  generation_type: string;
  result_text: string | null;
  result_json: any;
}): string {
  const type = gen.generation_type;
  const label = `[Saved Study Copilot Result — ${type.replace(/_/g, " ")}]`;

  // Prefer result_text (summary stores full markdown here)
  if (gen.result_text && gen.result_text.trim().length > 50) {
    return `${label}\n${gen.result_text.substring(0, 8000)}`;
  }

  if (gen.result_json) {
    const json = gen.result_json as any;
    const parts: string[] = [label];

    if (type === "important_questions" && Array.isArray(json.sections)) {
      for (const section of json.sections) {
        parts.push(`\n${section.title}:`);
        for (const q of (section.questions || []).slice(0, 12)) {
          parts.push(`Q: ${q.question}`);
          if (q.answer_hint) parts.push(`Hint: ${q.answer_hint}`);
        }
      }
    } else if (type === "flashcards" && Array.isArray(json.flashcards)) {
      for (const card of (json.flashcards || []).slice(0, 20)) {
        parts.push(`${card.front}: ${card.back}`);
      }
    } else if (type === "mcq" && Array.isArray(json.questions)) {
      for (const q of (json.questions || []).slice(0, 10)) {
        parts.push(
          `Q: ${q.question}\nAnswer: ${q.answer}\n${q.explanation || ""}`
        );
      }
    } else if (type === "doubt_answer") {
      if (json.note_based_answer)
        parts.push(`Answer from note: ${json.note_based_answer}`);
      if (json.general_explanation)
        parts.push(`General: ${json.general_explanation}`);
      if (Array.isArray(json.key_points))
        parts.push(`Key points: ${json.key_points.join(", ")}`);
    } else {
      // Generic fallback: stringify up to 6000 chars
      parts.push(JSON.stringify(json).substring(0, 6000));
    }

    const result = parts.join("\n");
    return result.length > 50 ? result : "";
  }

  return "";
}

// ─── Action: Resolve Per-Note Content Status ──────────────────────────────────

/**
 * For each selected note, determines which content source can be used:
 *   ready_text          → clean text extracted from PDF (cache or live)
 *   ready_saved_result  → scanned PDF but user has a saved Study Copilot result
 *   needs_document_reading → scanned PDF, no saved result; must use Use Document Reading
 *   error               → note inaccessible or missing file
 *
 * Usage: called client-side whenever note selection changes.
 * This does NOT increment AI usage.
 */
export async function resolveMultiPdfNoteStatusAction(noteIds: string[]): Promise<
  | { success: true; statuses: NoteResolvedStatus[] }
  | { success: false; message: string }
> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized." };

    if (!noteIds || noteIds.length === 0)
      return { success: true, statuses: [] };

    const usageCheck = await getUserAIUsage();
    if (!usageCheck.success || !usageCheck.data?.isPremiumActive)
      return { success: false, message: "Premium required." };

    const supabase = makeClient();

    // Fetch all note metadata using shared access helper
    const notes = await verifyNotesAccessibleForStudyPack(userId, noteIds);

    if (!notes) {
      return { success: false, message: "Failed to fetch notes." };
    }

    devLog("[Multi PDF Content Resolve Start]", { noteCount: noteIds.length });

    const noteMap = new Map(((notes as any[]) || []).map((n) => [n.id, n]));

    // Preferred generation types for saved-result reuse (priority order)
    const preferredTypes = [
      "summary",
      "important_questions",
      "flashcards",
      "mcq",
      "doubt_answer",
    ];

    const statuses: NoteResolvedStatus[] = [];

    for (const noteId of noteIds) {
      const note = noteMap.get(noteId) as any;

      if (!note) {
        statuses.push({
          noteId,
          title: "Unknown Note",
          status: "error",
          message: "Note not found or not approved.",
        });
        continue;
      }

      if (!note.file_path) {
        statuses.push({
          noteId,
          title: note.title || "Untitled",
          status: "error",
          message: "PDF file path is missing.",
        });
        continue;
      }

      try {
        // Step 1: Try text extraction pipeline (cache → live extraction)
        const contentResult = await getStudyContentForNote(noteId, note.file_path);

        if (
          !contentResult.needsDocumentFallback &&
          contentResult.contentMarkdown &&
          contentResult.contentMarkdown.length >= 100
        ) {
          devLog("[Multi PDF Note Content Status]", {
            noteId,
            title: note.title,
            status: "ready_text",
            sourceType: contentResult.sourceType,
          });
          statuses.push({
            noteId,
            title: note.title || "Untitled",
            status: "ready_text",
            sourceLabel: "Extracted PDF text",
          });
          continue;
        }

        // Step 2: Scanned PDF — check for user's saved Study Copilot results
        devLog("[Multi PDF Note Content Status]", {
          noteId,
          title: note.title,
          status: "checking_saved_results",
        });

        const { data: savedGens, error: genError } = await supabase
          .from("ai_generations")
          .select("id, generation_type, result_text, result_json, created_at")
          .eq("user_id", userId)
          .eq("note_id", noteId)
          .in("generation_type", preferredTypes)
          .eq("status", "completed")
          .order("created_at", { ascending: false });

        if (!genError && savedGens && (savedGens as any[]).length > 0) {
          // Pick best generation by priority order
          let bestGen: any = null;
          for (const pType of preferredTypes) {
            const found = (savedGens as any[]).find(
              (g) => g.generation_type === pType
            );
            if (found) {
              bestGen = found;
              break;
            }
          }

          if (bestGen) {
            const contentText = buildContentTextFromSavedGeneration(bestGen);
            if (contentText.length > 50) {
              devLog("[Multi PDF Saved Context Found]", {
                noteId,
                generationType: bestGen.generation_type,
                generationId: bestGen.id,
              });
              statuses.push({
                noteId,
                title: note.title || "Untitled",
                status: "ready_saved_result",
                sourceLabel: `Saved ${bestGen.generation_type.replace(/_/g, " ")}`,
                reusedGenerationId: bestGen.id,
                generationType: bestGen.generation_type,
              });
              continue;
            }
          }
        }

        // Step 3: No usable content — needs document reading
        devLog("[Multi PDF Needs Document Reading]", {
          noteId,
          title: note.title,
        });
        statuses.push({
          noteId,
          title: note.title || "Untitled",
          status: "needs_document_reading",
        });
      } catch (err: any) {
        console.error("[Multi PDF Note Content Status Error]", {
          noteId,
          message: err?.message,
        });
        statuses.push({
          noteId,
          title: note.title || "Untitled",
          status: "error",
          message: err?.message || "Content check failed.",
        });
      }
    }

    return { success: true, statuses };
  } catch (err: any) {
    console.error("[Multi PDF Content Resolve Error]:", err);
    return { success: false, message: "Failed to resolve note statuses." };
  }
}

// ─── Action: Trigger Document Reading for One Note ────────────────────────────

/**
 * Generates a Smart Summary for a scanned note via the existing document
 * fallback pipeline (Gemini reads the raw PDF).
 *
 * Increments AI usage +1 on success (inside generateWithDocumentFallback).
 * After success, call resolveMultiPdfNoteStatusAction again — the note will
 * appear as ready_saved_result.
 */
export async function triggerDocumentReadingForNoteAction(noteId: string): Promise<
  | { success: true; generationId: string; message: string }
  | { success: false; message: string }
> {
  devLog("[Multi PDF Document Reading Start]", { noteId });
  try {
    const result = await generateWithDocumentFallback(noteId, "summary");
    if (result.success) {
      return {
        success: true,
        generationId: result.data?.id || "",
        message: "Document read and summary saved.",
      };
    } else {
      return {
        success: false,
        message:
          result.error?.message ||
          "Document reading failed. Please try again.",
      };
    }
  } catch (err: any) {
    console.error("[Multi PDF Document Reading Error]", err?.message);
    return {
      success: false,
      message: "Document reading failed. Please try again.",
    };
  }
}

// ─── Action: Generate Multi-PDF Study Pack ────────────────────────────────────

/**
 * Generates a combined study pack from 2-5 notes.
 *
 * sourceOverrides: for notes where PDF is scanned but a saved result exists,
 *   pass { sourceType: "saved_result", reusedGenerationId } and the server
 *   will re-validate and reuse that saved AI content as context.
 *
 * Increments AI usage +1 on success (for the final pack generation only).
 */
export async function generateMultiPdfStudyPackAction(
  noteIds: string[],
  packType: MultiPdfPackType,
  sourceOverrides?: Record<
    string,
    { sourceType: "saved_result"; reusedGenerationId: string }
  >
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        code: "NOT_AUTHENTICATED",
        message: "Please sign in to create a study pack.",
      };
    }

    if (!noteIds || noteIds.length < 2 || noteIds.length > 5) {
      return {
        success: false,
        code: "INVALID_SELECTION",
        message: "Select 2 to 5 notes.",
      };
    }

    const validTypes = [
      "multi_pdf_summary",
      "multi_pdf_important_questions",
      "multi_pdf_revision_sheet",
    ];
    if (!validTypes.includes(packType)) {
      return {
        success: false,
        code: "INVALID_TYPE",
        message: "Invalid pack type selected.",
      };
    }

    // 1. Premium & limit check
    const usageCheck = await getUserAIUsage();
    if (!usageCheck.success || !usageCheck.data?.isPremiumActive) {
      return {
        success: false,
        code: "PREMIUM_REQUIRED",
        message: "Multi-PDF Study Pack is a Premium feature.",
      };
    }

    const limitCheck = await checkAILimitBeforeGeneration(userId);
    if (!limitCheck.success) {
      return {
        success: false,
        code: "USAGE_CHECK_FAILED",
        message: limitCheck.error || "Failed to check limits.",
      };
    }
    if (limitCheck.limitReached) {
      return {
        success: false,
        code: "USAGE_LIMIT_REACHED",
        message: "You have reached your monthly AI generation limit.",
      };
    }

    const supabase = makeClient();

    // 2. Verify all notes exist and are accessible using shared helper
    const notes = await verifyNotesAccessibleForStudyPack(userId, noteIds);

    if (!notes || (notes as any[]).length !== noteIds.length) {
      // Find which ones failed for better error message
      const foundIds = notes ? notes.map((n: any) => n.id) : [];
      const missingIds = noteIds.filter(id => !foundIds.includes(id));
      console.log("[MultiPDF Error]", "INVALID_NOTES", "Missing IDs:", missingIds);
      
      return {
        success: false,
        code: "INVALID_NOTES",
        message:
          "Some selected notes are no longer available. Remove them and try again.",
      };
    }

    // 3. Collect content for each note
    console.log("[MultiPDF Server Start]", packType, noteIds.length);

    type ContentItem = {
      noteId: string;
      title: string;
      content: string;
      sourceType: "extracted_text" | "saved_result";
      subject?: string;
      semester?: string;
      reusedGenerationId?: string;
    };

    const collectedContent: ContentItem[] = [];
    const sourceStatuses: Array<{
      sourceIndex: number;
      noteId: string;
      title: string;
      sourceType: string;
      subject?: string;
      semester?: string;
      reusedGenerationId?: string;
    }> = [];

    let currentSourceIndex = 1;

    for (const note of notes as any[]) {
      const override = sourceOverrides?.[note.id];

      // ── Saved result override path ────────────────────────────────────────
      if (override?.sourceType === "saved_result" && override.reusedGenerationId) {
        // Server-side re-validation: confirm ownership and note association
        const { data: gen, error: genErr } = await supabase
          .from("ai_generations")
          .select("id, generation_type, result_text, result_json")
          .eq("id", override.reusedGenerationId)
          .eq("user_id", userId)
          .eq("note_id", note.id)
          .eq("status", "completed")
          .single();

        if (!genErr && gen) {
          const contentText = buildContentTextFromSavedGeneration(gen as any);
          if (contentText.length > 50) {
            collectedContent.push({
              noteId: note.id,
              title: note.title || "Untitled",
              content: contentText,
              sourceType: "saved_result",
              subject: note.subjects?.name,
              semester: note.semester,
              reusedGenerationId: (gen as any).id,
            });
            sourceStatuses.push({
              sourceIndex: currentSourceIndex++,
              noteId: note.id,
              title: note.title,
              sourceType: "saved_result",
              subject: note.subjects?.name,
              semester: note.semester,
              reusedGenerationId: (gen as any).id,
            });
            continue; // Move to next note
          }
        }
        // Validation failed — fall through to normal extraction
      }

      // ── Normal text extraction path ───────────────────────────────────────
      if (!note.file_path) {
        return {
          success: false,
          code: "MISSING_PDF",
          message: `Note "${note.title}" is missing a PDF file.`,
        };
      }

      const contentResult = await getStudyContentForNote(
        note.id,
        note.file_path
      );

      if (contentResult.needsDocumentFallback) {
        return {
          success: false,
          code: "PACK_NOT_READY",
          message: `Note "${note.title}" needs document reading first. Process or remove it.`,
        };
      }

      const content = contentResult.contentMarkdown || "";
      collectedContent.push({
        noteId: note.id,
        title: note.title || "Untitled",
        content,
        sourceType: "extracted_text",
        subject: note.subjects?.name,
        semester: note.semester,
      });
      sourceStatuses.push({
        sourceIndex: currentSourceIndex++,
        noteId: note.id,
        title: note.title,
        sourceType: "extracted_text",
        subject: note.subjects?.name,
        semester: note.semester,
      });
    }

    if (collectedContent.length < 2) {
      console.log("[MultiPDF Error]", "INSUFFICIENT_CONTENT", "Not enough note content to generate a study pack.");
      return {
        success: false,
        code: "INSUFFICIENT_CONTENT",
        message: "Not enough note content to generate a study pack.",
      };
    }

    const readyCount = collectedContent.length;
    const blockedCount = noteIds.length - readyCount;
    console.log("[MultiPDF Content Resolved]", readyCount, blockedCount);

    // 4. Build combined prompt with strict source boundaries
    let combinedText = "";
    for (let i = 0; i < collectedContent.length; i++) {
      const item = collectedContent[i];
      const trimmed =
        item.content.length > 15000
          ? item.content.substring(0, 15000) + "...(truncated)"
          : item.content;
      combinedText += `\n<SOURCE_NOTE index="${i + 1}" note_id="${item.noteId}" title="${item.title}" subject="${item.subject || ""}" semester="${item.semester || ""}" source_type="${item.sourceType}">\nCONTENT_START\n${trimmed}\nCONTENT_END\n</SOURCE_NOTE>\n`;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        code: "CONFIG_ERROR",
        message: "Gemini API key is not configured.",
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    let prompt = "";
    if (packType === "multi_pdf_summary") {
      prompt = `You are an expert AI Study Assistant.
Your task is to create a clean, cohesive Combined Study Summary from the provided notes.
Use ONLY the information in the provided text. Do not add outside facts.

Rules for the AI:
1. Treat each SOURCE_NOTE as a separate source.
2. Do not mix facts from one note into another note-wise section.
3. If a point comes from Source 1, label it as Source 1.
4. If a point appears in multiple notes, put it only in "Common Concepts Across Notes".
5. If a concept is not present in a source, do not claim it belongs to that source.
6. Do not invent missing content.
7. Preserve note titles and source labels.
8. Every important question must mention source note title or source number.
9. Use "Source unclear" only if the given content is not enough to locate the source.
10. Final combined section can synthesize, but note-wise sections must remain source-faithful.

Output clean Markdown exactly in this structure:

# Combined Summary

## Selected Notes
- Source 1: <note title>
- Source 2: <note title>

## Overall Summary
A short combined overview across all selected notes.

## Note-wise Summary

### Source 1 — <note title>
- Main points only from Source 1.
- Do not include content from other sources.

### Source 2 — <note title>
- Main points only from Source 2.
- Do not include content from other sources.

## Common Concepts Across Notes
- Concept: ...
  - Found in: Source 1, Source 2
  - Why it matters: ...

## Important Definitions
- **Term**: definition
  - Source: Source 1 — <note title>

## Important Formulas / Rules
- Formula/rule...
  - Source: Source 2 — <note title>

## Exam Focus Points
- Point...
  - Source: Source 1 / Source 2 / Multiple Sources

## Quick Revision Bullets
- Bullet...
  - Source: ...

Provided Notes Text:
${combinedText}`;
    } else if (packType === "multi_pdf_important_questions") {
      prompt = `You are an expert AI Study Assistant.
Your task is to generate combined important exam questions from the provided notes.
Use ONLY the information in the provided text.

Rules for the AI:
1. Treat each SOURCE_NOTE as a separate source.
2. Do not mix facts from one note into another note-wise section.
3. If a point comes from Source 1, label it as Source 1.
4. If a point appears in multiple notes, put it only in "Cross-Note Questions".
5. If a concept is not present in a source, do not claim it belongs to that source.
6. Do not invent missing content.
7. Preserve note titles and source labels.

Output clean Markdown exactly in this structure:

# Combined Important Questions

## Selected Notes
- Source 1: <note title>
- Source 2: <note title>

## Very Short Answer Questions

### Source 1 — <note title>
1. Question...
   - Marks: 2
   - Why important: ...
   - Answer hint: ...

### Source 2 — <note title>
1. Question...
   - Marks: 2
   - Why important: ...
   - Answer hint: ...

## Short Answer Questions

### Source 1 — <note title>
1. Question...
   - Marks: 5
   - Answer hint: ...

### Source 2 — <note title>
1. Question...
   - Marks: 5
   - Answer hint: ...

## Long Answer Questions

### Source 1 — <note title>
1. Question...
   - Marks: 10
   - Answer hint: ...

### Source 2 — <note title>
1. Question...
   - Marks: 10
   - Answer hint: ...

## Cross-Note Questions
Each cross-note question must include:
- Sources used: Source 1, Source 2
- Why connected: ...

Provided Notes Text:
${combinedText}`;
    } else if (packType === "multi_pdf_revision_sheet") {
      prompt = `You are an expert AI Study Assistant.
Your task is to create a Final 1-Day Revision Sheet summarizing the most critical points from all the provided notes.
Use ONLY the information in the provided text.

Rules for the AI:
1. Treat each SOURCE_NOTE as a separate source.
2. Do not mix facts from one note into another note-wise section.
3. If a point comes from Source 1, label it as Source 1.
4. Preserve note titles and source labels.

Output clean Markdown exactly in this structure:

# Final Revision Sheet

## Selected Notes
- Source 1: <note title>
- Source 2: <note title>

## Last-Day Study Order
1. Source 1 — <note title>: what to revise first
2. Source 2 — <note title>: what to revise next

## Source-wise Must-Remember Concepts

### Source 1 — <note title>
- Concept...
- Formula...
- Definition...

### Source 2 — <note title>
- Concept...
- Formula...
- Definition...

## Common Mistakes
- Mistake...
  - Source: Source 1 — <note title>

## Formula Sheet
- Formula...
  - Source: Source 2 — <note title>

## Quick Self-Test Questions
1. Question...
   - Source: Source 1 — <note title>

## Final 30-Minute Revision Plan
- 10 min: Source 1 — ...
- 10 min: Source 2 — ...
- 10 min: Common/Cross-note concepts

Provided Notes Text:
${combinedText}`;
    }

    devLog("Calling Gemini for Multi-PDF Pack...");
    let resultText = "";

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      resultText = response.text || "";
      console.log("[MultiPDF Gemini Done]", resultText.length);
      
      if (!resultText) {
        console.log("[MultiPDF Error]", "GENERATION_FAILED", "Study pack generation failed (empty response).");
        return {
          success: false,
          code: "GENERATION_FAILED",
          message: "Study pack generation failed (empty response).",
        };
      }
    } catch (genError: any) {
      console.error("[Study Copilot] Gemini Multi-PDF Error:", genError);
      if (genError.status === 429) {
        return {
          success: false,
          code: "GEMINI_QUOTA_EXHAUSTED",
          message:
            "Gemini free quota reached. Please try again after quota resets.",
        };
      } else if (genError.status === 503) {
        return {
          success: false,
          code: "GEMINI_TEMPORARILY_BUSY",
          message: "Gemini is temporarily busy. Please try again in a minute.",
        };
      }
      return {
        success: false,
        code: "GENERATION_FAILED",
        message: "Study pack generation failed. Please try again.",
      };
    }

    const cleanMarkdown = normalizeMultiPdfOutputToMarkdown(packType, resultText);

    if (!cleanMarkdown || cleanMarkdown.trim() === "" || cleanMarkdown.length < 100) {
        console.log("[MultiPDF Error]", "GENERATION_FAILED", "Study Pack generation returned empty output. Please try again.");
        return { success: false, code: "GENERATION_FAILED", message: "Study Pack generation returned empty output. Please try again." };
    }

    const hasSavedResultContext = sourceStatuses.some(
      (s) => s.sourceType === "saved_result"
    );

    const selectedNotesMetadata = sourceStatuses.map((s) => ({
      source_index: s.sourceIndex,
      id: s.noteId,
      title: s.title,
      subject: s.subject,
      semester: s.semester,
      source_type: s.sourceType,
      reused_generation_id: s.reusedGenerationId,
    }));

    if (isDev) {
      const hasSources = /Source 1|Source 2/i.test(cleanMarkdown) || selectedNotesMetadata.some(n => cleanMarkdown.includes(n.title));
      if (!hasSources) {
         console.warn("[Multi PDF Source Separation Warning] Output lacks clear source labels or note titles. Prompt may need adjusting.");
      }
    }

    const finalJson: Record<string, any> = {
      pack_type: packType,
      is_multi_pdf: true,
      selected_note_ids: noteIds,
      selected_notes: selectedNotesMetadata,
      source_statuses: sourceStatuses,
      source_separation_enabled: true,
      ...(hasSavedResultContext && { includes_saved_ai_context: true }),
    };

    // 5. Save result directly
    const { data: genRow, error: saveError } = await supabase
      .from("ai_generations")
      .insert({
        user_id: userId,
        note_id: noteIds[0],
        generation_type: packType,
        status: "completed",
        result_text: cleanMarkdown,
        result_json: finalJson,
      })
      .select("id")
      .single();

    if (saveError || !genRow) {
      console.error("[Multi PDF] DB Save Error:", saveError);
      console.log("[MultiPDF Error]", "SAVE_FAILED", "Study Pack was generated but could not be saved.");
      return {
        success: false,
        code: "SAVE_FAILED",
        message: "Study Pack was generated but could not be saved. Please try again.",
      };
    }

    console.log("[MultiPDF Save Done]", genRow.id);

    // 6. Increment usage +1 for final pack generation only
    await incrementAIUsageAfterSuccess(userId, genRow.id, packType);
    
    console.log("[MultiPDF Usage Incremented]", genRow.id);

    return {
      success: true,
      generationId: genRow.id,
      generationType: packType,
      selectedNoteIds: noteIds,
      message: "Study Pack generated and saved.",
    };
  } catch (error: any) {
    console.error("[Study Copilot] Multi-PDF Unexpected Error:", error);
    console.log("[MultiPDF Error]", "UNEXPECTED_ERROR", error?.message || "An unexpected error occurred while generating.");
    return {
      success: false,
      code: "UNEXPECTED_ERROR",
      message: "An unexpected error occurred while generating.",
    };
  }
}
