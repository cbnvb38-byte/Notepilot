"use client";

import { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Lightbulb,
  BookOpen,
  ListChecks,
  Target,
  Eye,
  HelpCircle,
  GraduationCap
} from "lucide-react";
import { parseSummarySections, getGenerationTypeLabel, getCopyableResultText, parseMCQResult, parseFlashcardsResult, parseImportantQuestionsResult, parseDoubtAnswerResult } from "@/lib/ai/result-formatting";

import { StudyMarkdownRenderer } from "./study-markdown-renderer";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface GeneratedResultCardProps {
  resultText: string;
  resultJson?: Record<string, unknown> | null;
  generationType: string;
  noteTitle?: string;
  createdAt?: string;
  /** Show a close / hide button. Call this to dismiss the card. */
  onHide?: () => void;
  /** Compact mode: show preview only, with an "Open" toggle */
  compact?: boolean;
}

// â”€â”€â”€ Section Icon Map â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SECTION_ICONS: Record<string, typeof Sparkles> = {
  "Quick Summary": Sparkles,
  "Detailed Summary": FileText,
  "Key Concepts": Lightbulb,
  "Important Exam Points": ListChecks,
  "Revision Tip": Target,
  "Summary": BookOpen,
};

const SECTION_ACCENT: Record<string, string> = {
  "Quick Summary": "border-indigo-500/30 bg-indigo-500/5",
  "Detailed Summary": "border-zinc-700/50 bg-zinc-900/40",
  "Key Concepts": "border-violet-500/30 bg-violet-500/5",
  "Important Exam Points": "border-amber-500/30 bg-amber-500/5",
  "Revision Tip": "border-emerald-500/30 bg-emerald-500/5",
  "Summary": "border-zinc-700/50 bg-zinc-900/40",
};

const SECTION_HEADING_COLOR: Record<string, string> = {
  "Quick Summary": "text-indigo-300",
  "Detailed Summary": "text-zinc-200",
  "Key Concepts": "text-violet-300",
  "Important Exam Points": "text-amber-300",
  "Revision Tip": "text-emerald-300",
  "Summary": "text-zinc-200",
};

// â”€â”€â”€ MCQ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function McqCard({ question, index }: { question: any, index: number }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const labels = ["A", "B", "C", "D", "E"];

  let difficultyColor = "bg-zinc-900 text-zinc-300 border-zinc-800";
  if (question.difficulty === "easy") difficultyColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (question.difficulty === "medium") difficultyColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  if (question.difficulty === "hard") difficultyColor = "bg-red-500/10 text-red-400 border-red-500/20";

  return (
    <div className="flex flex-col gap-4 p-6 relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="flex items-start justify-between gap-4 relative z-10">
        <h3 className="text-sm font-black text-white flex items-start gap-2 tracking-tight">
          <span className="text-indigo-400 mt-0.5">{index + 1}.</span>
          <div className="flex-1 -mt-1"><StudyMarkdownRenderer content={question.question} /></div>
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border shadow-inner ${difficultyColor}`}>
            {question.difficulty}
          </span>
          {question.topic && (
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-zinc-900 text-zinc-400 border-zinc-800 shadow-inner">
              {question.topic}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 pl-6 relative z-10">
        {(question.options || []).map((opt: string, i: number) => (
          <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/60 shadow-inner hover:border-indigo-500/30 transition-colors">
            <span className="font-black text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-md shrink-0 uppercase">{labels[i] || "-"}</span>
            <div className="text-sm text-zinc-300 font-medium -mt-0.5"><StudyMarkdownRenderer content={opt} /></div>
          </div>
        ))}
      </div>

      <div className="pl-6 mt-2 relative z-10">
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-4 py-2 rounded-xl transition-all shadow-inner"
          >
            <Eye className="h-4 w-4" /> Show Answer
          </button>
        ) : (
          <div className="flex flex-col gap-3 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)] animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-sm font-black text-emerald-300"><StudyMarkdownRenderer content={question.answer} /></div>
            </div>
            {question.explanation && (
              <div className="flex items-start gap-2 mt-2 pt-3 border-t border-emerald-500/20">
                <HelpCircle className="h-4 w-4 text-emerald-500/60 shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-100/70 font-medium -mt-0.5"><StudyMarkdownRenderer content={question.explanation} /></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// â”€â”€â”€ Flashcard Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Flashcard({ card, index }: { card: any, index: number }) {
  const [showAnswer, setShowAnswer] = useState(false);

  let difficultyColor = "bg-zinc-900 text-zinc-300 border-zinc-800";
  if (card.difficulty === "easy") difficultyColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (card.difficulty === "medium") difficultyColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  if (card.difficulty === "hard") difficultyColor = "bg-red-500/10 text-red-400 border-red-500/20";

  return (
    <div className="flex flex-col gap-4 p-6 relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="flex items-start justify-between gap-4 relative z-10">
        <h3 className="text-sm font-black text-white flex items-start gap-2 tracking-tight">
          <span className="text-indigo-400 mt-0.5">{index + 1}.</span>
          <div className="flex-1 -mt-1"><StudyMarkdownRenderer content={card.front} /></div>
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border shadow-inner ${difficultyColor}`}>
            {card.difficulty || "medium"}
          </span>
          {card.topic && (
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-zinc-900 text-zinc-400 border-zinc-800 shadow-inner">
              {card.topic}
            </span>
          )}
        </div>
      </div>

      <div className="pl-6 mt-2 relative z-10">
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-4 py-2 rounded-xl transition-all shadow-inner"
          >
            <Eye className="h-4 w-4" /> Show Answer
          </button>
        ) : (
          <div className="flex flex-col gap-3 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)] animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-sm font-black text-emerald-300"><StudyMarkdownRenderer content={card.back} /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// â”€â”€â”€ Important Questions Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ImportantQuestionCard({ question, index }: { question: any, index: number }) {
  let difficultyColor = "bg-zinc-900 text-zinc-300 border-zinc-800";
  if (question.difficulty === "easy") difficultyColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (question.difficulty === "medium") difficultyColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  if (question.difficulty === "hard") difficultyColor = "bg-red-500/10 text-red-400 border-red-500/20";

  return (
    <div className="flex flex-col gap-3 p-6 relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="flex items-start justify-between gap-4 relative z-10">
        <h3 className="text-sm font-black text-white flex items-start gap-2 tracking-tight">
          <span className="text-indigo-400 mt-0.5">Q{index + 1}.</span>
          <div className="flex-1 -mt-1"><StudyMarkdownRenderer content={question.question} /></div>
        </h3>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          {question.marks && (
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-inner">
              {question.marks} Marks
            </span>
          )}
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border shadow-inner ${difficultyColor}`}>
            {question.difficulty || "medium"}
          </span>
          {question.topic && (
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-zinc-900 text-zinc-400 border-zinc-800 shadow-inner">
              {question.topic}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 pl-8 relative z-10">
        {question.why_important && (
          <div className="flex items-start gap-2 pt-2">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest shrink-0 mt-0.5 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded shadow-inner">Why it matters:</span>
            <div className="text-xs text-zinc-300 font-medium leading-relaxed -mt-0.5"><StudyMarkdownRenderer content={question.why_important} /></div>
          </div>
        )}
        
        {question.answer_hint && (
          <div className="mt-2 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 shadow-inner">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Answer Hint</span>
                <div className="text-sm text-emerald-100/80 font-medium"><StudyMarkdownRenderer content={question.answer_hint} /></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// â”€â”€â”€ Doubt Answer Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function DoubtAnswerCard({ data }: { data: any }) {
  let confidenceColor = "bg-zinc-900 text-zinc-300 border-zinc-800";
  if (data.confidence === "high") confidenceColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (data.confidence === "medium") confidenceColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  if (data.confidence === "low") confidenceColor = "bg-red-500/10 text-red-400 border-red-500/20";

  let statusText = "";
  let statusColor = "";
  if (data.source_status === "fully_answered_from_note") {
    statusText = "Fully answered from note";
    statusColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  } else if (data.source_status === "partially_available_in_note") {
    statusText = "Partially available in note";
    statusColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  } else if (data.source_status === "not_available_in_note") {
    statusText = "Not available in note";
    statusColor = "bg-red-500/10 text-red-400 border-red-500/20";
  }

  return (
    <div className="flex flex-col p-6 gap-6 relative">
      {/* Question Header */}
      <div className="flex flex-col gap-3 pb-5 border-b border-zinc-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20 shadow-inner shrink-0">
            <HelpCircle className="h-5 w-5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-black text-white tracking-tight leading-snug">{data.question}</h2>
        </div>
        <div className="flex flex-wrap gap-2 pl-12">
          {data.confidence && (
             <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border shadow-inner ${confidenceColor}`}>
              {data.confidence} Confidence
            </span>
          )}
          {statusText && (
             <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border shadow-inner ${statusColor}`}>
              {statusText}
            </span>
          )}
        </div>
      </div>

      {/* Answer Body */}
      <div className="flex flex-col gap-8 pl-12 relative z-10">
        {data.answer && (
          <div className="text-sm text-zinc-200 leading-relaxed font-medium">
            <StudyMarkdownRenderer content={data.answer} />
          </div>
        )}

        {data.note_based_answer && (
          <div className="flex flex-col gap-3 mt-2">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg w-fit shadow-inner">
              <FileText className="h-3.5 w-3.5" /> From Your Note
            </h4>
            <div className="text-sm text-zinc-200 font-medium leading-relaxed bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800/80 shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <StudyMarkdownRenderer content={data.note_based_answer} />
            </div>
          </div>
        )}

        {data.general_explanation && (
          <div className="flex flex-col gap-3 mt-2">
            <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-lg w-fit shadow-inner">
              <GraduationCap className="h-3.5 w-3.5" /> General Explanation
            </h4>
            <div className="text-sm text-zinc-200 font-medium leading-relaxed bg-zinc-950/80 p-5 rounded-2xl border border-violet-500/30 shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <StudyMarkdownRenderer content={data.general_explanation} />
            </div>
          </div>
        )}

        {data.simple_explanation && (
          <div className="p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.1)] mt-2">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> In Simple Words
            </h4>
            <div className="text-sm text-indigo-100/90 font-medium leading-relaxed">
              <StudyMarkdownRenderer content={data.simple_explanation} />
            </div>
          </div>
        )}

        {(data.key_points && data.key_points.length > 0) && (
          <div className="flex flex-col gap-3 mt-2">
            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <Check className="h-4 w-4" /> Key Points
            </h4>
            <ul className="flex flex-col gap-2.5 list-none pl-0">
              {data.key_points.map((kp: string, idx: number) => (
                <li key={idx} className="text-sm text-zinc-300 font-medium flex items-start gap-3 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50 hover:border-emerald-500/30 transition-colors shadow-inner">
                  <span className="text-emerald-500 mt-0.5"><Check className="h-4 w-4" /></span>
                  <StudyMarkdownRenderer content={kp} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.exam_tip && (
          <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)] mt-4">
            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" /> Exam Tip
            </h4>
            <div className="text-sm text-amber-100/90 font-medium leading-relaxed">
              <StudyMarkdownRenderer content={data.exam_tip} />
            </div>
          </div>
        )}

        {(data.related_topics && data.related_topics.length > 0) && (
          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-zinc-800/80 mt-2">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><ListChecks className="h-3.5 w-3.5" /> Related:</span>
            {data.related_topics.map((rt: string, idx: number) => (
              <span key={idx} className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg shadow-inner hover:bg-zinc-800 hover:text-white transition-colors cursor-default">
                {rt}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function GeneratedResultCard({
  resultText,
  resultJson,
  noteTitle,
  createdAt,
  generationType,
  onHide,
  compact = false,
}: GeneratedResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(!compact);

  const isMcq = generationType === "mcq";
  const isFlashcards = generationType === "flashcards";
  const isImportantQuestions = generationType === "important_questions" || generationType === "multi_pdf_important_questions";
  const isDoubtAnswer = generationType === "doubt_answer";
  const isMultiPdf = typeof resultJson === 'object' && resultJson !== null && 'is_multi_pdf' in (resultJson as object);

  const parsedQuestions = isMcq ? parseMCQResult(resultText, resultJson || null) : null;
  const parsedCards = isFlashcards ? parseFlashcardsResult(resultText, resultJson || null) : null;
  const parsedImportant = isImportantQuestions ? parseImportantQuestionsResult(resultText, resultJson || null) : null;
  const parsedDoubtAnswer = isDoubtAnswer ? parseDoubtAnswerResult(resultText, resultJson || null) : null;

  const questions = parsedQuestions || [];
  const cards = parsedCards || [];
  const importantSections = parsedImportant?.sections || [];
  const doubtAnswerData = parsedDoubtAnswer;

  const validMcq = isMcq && questions.length > 0;
  const validFlashcards = isFlashcards && cards.length > 0;
  const validImportant = isImportantQuestions && importantSections.length > 0;
  const validDoubtAnswer = isDoubtAnswer && doubtAnswerData !== null;
  
  const sections = !isMcq && !isFlashcards && !isImportantQuestions && !isDoubtAnswer && !isMultiPdf ? parseSummarySections(resultText, resultJson || null) : [];

  const handleCopy = async () => {
    try {
      const copyText = getCopyableResultText({
        id: "", note_id: "", status: "completed", created_at: "",
        generation_type: generationType,
        note_title: noteTitle || "",
        result_text: resultText,
        result_json: resultJson || null
      });
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent
    }
  };

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const typeLabel = getGenerationTypeLabel(generationType);

  return (
    <div className="godmode-card w-full flex flex-col gap-0 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-col gap-2 min-w-0 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md shadow-inner">
              <Sparkles className="h-3 w-3" />
              {typeLabel}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md shadow-inner">
              <Check className="h-3 w-3" />
              Saved
            </span>
          </div>
          {noteTitle && (
            <p className="text-sm font-black text-white truncate tracking-tight">
                            {generationType === "mcq" ? "Generated Practice Quiz" : generationType === "flashcards" ? "Generated Flashcards" : isImportantQuestions ? "Generated Important Questions" : generationType === "doubt_answer" ? "Answered Doubt" : "Generated Study Summary"}
            </p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            {noteTitle && (
              <span className="text-[11px] font-bold text-zinc-500 truncate max-w-xs uppercase tracking-widest">
                From: <span className="text-zinc-400">{noteTitle}</span>
              </span>
            )}
            {formattedDate && (
              <span className="text-[11px] font-bold text-zinc-500 flex items-center gap-1 shrink-0 uppercase tracking-widest">
                <Clock className="h-3 w-3" />
                {formattedDate}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0 relative z-10">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white border border-zinc-700/80 hover:border-zinc-500 bg-zinc-900/50 hover:bg-zinc-800 px-3 py-2 rounded-lg transition-all shadow-inner"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>

          {compact && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white border border-zinc-700/80 hover:border-zinc-500 bg-zinc-900/50 hover:bg-zinc-800 px-3 py-2 rounded-lg transition-all shadow-inner"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" /> Hide
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" /> Open
                </>
              )}
            </button>
          )}

          {onHide && (
            <button
              onClick={onHide}
              className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-400 border border-zinc-700/80 hover:border-red-500/50 bg-zinc-900/50 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-all shadow-inner"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* ── Body: Multi-PDF ── */}
      {expanded && isMultiPdf && (
        <div className="flex flex-col p-6 text-zinc-200 font-medium">
          {(resultJson as any)?.selected_notes && (
             <div className="mb-6 p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 shadow-inner">
               <h3 className="font-black text-white mb-3 text-sm tracking-tight flex items-center gap-2"><BookOpen className="h-4 w-4 text-indigo-400"/> Study Pack Sources:</h3>
               <div className="space-y-4">
                 {(resultJson as any).selected_notes.map((note: any, idx: number) => (
                   <div key={note.id || idx}>
                     <p className="font-bold text-zinc-200 text-sm">{note.source_index || idx + 1}. {note.title}</p>
                     <ul className="text-xs text-zinc-400 font-semibold pl-4 list-disc space-y-0.5 mt-1.5">
                       {note.subject && <li>Subject: {note.subject}</li>}
                       {note.semester && <li>Semester: {note.semester}</li>}
                       <li>Source type: {note.source_type === 'saved_result' ? 'Saved AI content' : 'Extracted PDF text'}</li>
                     </ul>
                   </div>
                 ))}
               </div>
             </div>
          )}
          <StudyMarkdownRenderer content={resultText || ""} />
        </div>
      )}

      {/* ── Body: sections ── */}
      {expanded && (!isMcq && !isFlashcards && !isImportantQuestions && !isDoubtAnswer && !isMultiPdf) && (
        <div className="flex flex-col gap-0 divide-y divide-zinc-800/60">
          {sections.map((section, i) => {
            const Icon = SECTION_ICONS[section.heading] ?? BookOpen;
            const accent = SECTION_ACCENT[section.heading] ?? "border-zinc-700/50 bg-zinc-900/40";
            const headingColor = SECTION_HEADING_COLOR[section.heading] ?? "text-zinc-200";

            return (
              <div
                key={i}
                className={`px-6 py-6 ${i === 0 ? accent + ' shadow-inner' : ""}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-2 rounded-xl border shadow-inner ${
                      section.heading === "Quick Summary"
                        ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                        : section.heading === "Key Concepts"
                        ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                        : section.heading === "Important Exam Points"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : section.heading === "Revision Tip"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-zinc-800/60 border-zinc-700 text-zinc-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className={`text-base font-black tracking-tight ${headingColor}`}>{section.heading}</h3>
                </div>
                <StudyMarkdownRenderer content={section.content} />
              </div>
            );
          })}
        </div>
      )}

      {/* ── Body: MCQ ── */}
      {expanded && validMcq && (
        <div className="flex flex-col gap-0 divide-y divide-zinc-800/60">
          {questions.map((q: any, i: number) => (
            <McqCard key={i} question={q} index={i} />
          ))}
        </div>
      )}

      {/* ── Body: Flashcards ── */}
      {expanded && validFlashcards && (
        <div className="flex flex-col gap-0 divide-y divide-zinc-800/60">
          {cards.map((c: any, i: number) => (
            <Flashcard key={i} card={c} index={i} />
          ))}
        </div>
      )}

      {/* ── Body: Important Questions ── */}
      {expanded && validImportant && (
        <div className="flex flex-col gap-8 p-6">
          {importantSections.map((sec: any, secIdx: number) => (
            <div key={secIdx} className="flex flex-col gap-5">
              <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-3">
                <Target className="h-5 w-5 text-indigo-400" />
                <h3 className="font-black text-white uppercase tracking-widest text-sm">{sec.title}</h3>
              </div>
              <div className="flex flex-col gap-0 divide-y divide-zinc-800/60 border border-zinc-800/80 rounded-2xl overflow-hidden bg-zinc-950/60 shadow-inner">
                {(sec.questions || []).map((q: any, qIdx: number) => (
                  <ImportantQuestionCard key={qIdx} question={q} index={qIdx} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Body: Important Questions Text-Only Fallback (Normal IQ) ── */}
      {expanded && isImportantQuestions && !validImportant && !isMultiPdf && resultText && resultText.length >= 100 && (
         <div className="flex flex-col p-6 text-zinc-300 font-medium leading-relaxed">
           <StudyMarkdownRenderer content={resultText} />
         </div>
      )}

      {/* ── Body: Doubt Answer ── */}
      {expanded && validDoubtAnswer && (
        <DoubtAnswerCard data={doubtAnswerData} />
      )}

      {/* ── Body: MCQ Fallback ── */}
      {expanded && isMcq && !validMcq && (
        <div className="p-6 flex flex-col gap-5 text-sm text-zinc-300">
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-5 rounded-2xl flex items-start gap-4 shadow-inner">
            <HelpCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <p className="font-bold">Practice Quiz was generated but could not be parsed into quiz cards.</p>
          </div>
          <details className="text-xs">
            <summary className="cursor-pointer text-zinc-500 font-black uppercase tracking-widest mb-3 hover:text-zinc-300 transition-colors">View raw fallback</summary>
            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl overflow-x-auto shadow-inner">
              <pre className="text-zinc-400 whitespace-pre-wrap font-mono">{resultText || JSON.stringify(resultJson, null, 2)}</pre>
            </div>
          </details>
        </div>
      )}

      {/* ── Body: Flashcards Fallback ── */}
      {expanded && isFlashcards && !validFlashcards && (
        <div className="p-6 flex flex-col gap-5 text-sm text-zinc-300">
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-5 rounded-2xl flex items-start gap-4 shadow-inner">
            <HelpCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <p className="font-bold">Flashcards were generated but could not be parsed into individual cards.</p>
          </div>
          <details className="text-xs">
            <summary className="cursor-pointer text-zinc-500 font-black uppercase tracking-widest mb-3 hover:text-zinc-300 transition-colors">View raw fallback</summary>
            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl overflow-x-auto shadow-inner">
              <pre className="text-zinc-400 whitespace-pre-wrap font-mono">{resultText || JSON.stringify(resultJson, null, 2)}</pre>
            </div>
          </details>
        </div>
      )}

      {/* ── Body: Important Questions Fallback ── */}
      {expanded && isImportantQuestions && !validImportant && (!isMultiPdf && (!resultText || resultText.length < 100)) && (
        <div className="p-6 flex flex-col gap-5 text-sm text-zinc-300">
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-5 rounded-2xl flex items-start gap-4 shadow-inner">
            <HelpCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <p className="font-bold">Important questions were generated but could not be parsed correctly.</p>
          </div>
          <details className="text-xs">
            <summary className="cursor-pointer text-zinc-500 font-black uppercase tracking-widest mb-3 hover:text-zinc-300 transition-colors">View raw fallback</summary>
            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl overflow-x-auto shadow-inner">
              <pre className="text-zinc-400 whitespace-pre-wrap font-mono">{resultText || JSON.stringify(resultJson, null, 2)}</pre>
            </div>
          </details>
        </div>
      )}

      {/* ── Body: Doubt Answer Fallback ── */}
      {expanded && isDoubtAnswer && !validDoubtAnswer && (
        <div className="p-6 flex flex-col gap-5 text-sm text-zinc-300">
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-5 rounded-2xl flex items-start gap-4 shadow-inner">
            <HelpCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <p className="font-bold">Doubt answer was generated but could not be parsed correctly.</p>
          </div>
          <details className="text-xs">
            <summary className="cursor-pointer text-zinc-500 font-black uppercase tracking-widest mb-3 hover:text-zinc-300 transition-colors">View raw fallback</summary>
            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl overflow-x-auto shadow-inner">
              <pre className="text-zinc-400 whitespace-pre-wrap font-mono">{resultText || JSON.stringify(resultJson, null, 2)}</pre>
            </div>
          </details>
        </div>
      )}

      {/* ── Compact preview (when collapsed) ── */}
      {!expanded && (
        <div className="px-6 py-5">
          <p className="text-xs text-zinc-400 font-semibold line-clamp-2 leading-relaxed">
            {validMcq 
              ? `${questions.length} questions generated. Click Open to view and practice.`
              : validFlashcards
              ? `${cards.length} flashcards generated. Click Open to view and practice.`
              : validImportant
              ? `Important questions generated across ${importantSections.length} sections. Click Open to view.`
              : validDoubtAnswer
              ? `Doubt answered. Click Open to view.`
              : (sections[0]?.content.slice(0, 200).replace(/\*\*/g, "") ?? "Click Open to view the full result.")
            }
          </p>
        </div>
      )}
    </div>
  );
}

