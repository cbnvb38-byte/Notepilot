-- =========================================================================
-- Migration 016: Add Multi-PDF Study Pack types to ai_generations
-- =========================================================================

DO $$
BEGIN
  -- Drop the old constraint
  ALTER TABLE public.ai_generations
    DROP CONSTRAINT IF EXISTS valid_generation_type;

  -- Add the new constraint including the multi_pdf_* types
  ALTER TABLE public.ai_generations
    ADD CONSTRAINT valid_generation_type CHECK (
      generation_type IN (
        'summary', 'mcq', 'flashcards', 'important_questions', 
        'short_notes', 'revision_plan', 'doubt_answer', 
        'key_concepts', 'weak_topic_practice',
        'multi_pdf_summary', 'multi_pdf_important_questions', 'multi_pdf_revision_sheet'
      )
    );
END $$;
