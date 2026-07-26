import Link from "next/link";
import {
  ArrowRight,
  Search,
  UploadCloud,
  BookOpen,
  Sparkles,
  FileText,
  GraduationCap,
  HelpCircle,
  MessageSquareDiff,
  MessageCircleQuestion,
  Library,
  Rocket,
  Crown,
  Zap,
  Eye,
  CheckCircle2,
  Shield,
  Lock,
  User,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Show, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-50 overflow-hidden flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-full max-w-7xl h-[800px] pointer-events-none opacity-20 z-0">
        <div className="absolute top-[5%] left-[10%] w-[550px] h-[550px] rounded-full bg-indigo-600 blur-[130px] animate-pulse duration-[8000ms]" />
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-violet-600 blur-[140px] animate-pulse duration-[10000ms]" />
      </div>

      <Header />

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative z-10 pt-24 sm:pt-28 pb-20 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left — Copy */}
          <div className="flex flex-col gap-6 w-full lg:w-[55%] text-center lg:text-left animate-fade-in-up">
            {/* Banner Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/10 text-indigo-300 text-xs font-semibold shadow-inner shadow-indigo-500/5 hover:border-indigo-500/40 transition-all duration-300 mx-auto lg:mx-0 w-fit">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
              <span>AI-Powered Study Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.08] select-none">
              Study smarter from{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                every college note.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed mx-auto lg:mx-0">
              Browse notes, upload PDFs, and use Study Copilot to generate summaries, quizzes, flashcards, important questions, doubts, exam sprints, and multi-note study packs.
            </p>

            {/* CTAs — Auth-aware */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mt-2">
              <Show when="signed-in">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold shadow-xl hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 px-7 py-5 h-auto rounded-xl animate-glow-pulse">
                    Go to Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard/study-copilot">
                  <Button size="lg" variant="outline" className="border-indigo-500/30 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 px-7 py-5 h-auto rounded-xl font-semibold">
                    Open Study Copilot
                  </Button>
                </Link>
              </Show>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold shadow-xl hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 px-7 py-5 h-auto rounded-xl animate-glow-pulse">
                    Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800/40 px-7 py-5 h-auto rounded-xl font-semibold">
                    Sign In
                  </Button>
                </SignInButton>
              </Show>
              <Link href="/dashboard/browse">
                <Button size="lg" variant="ghost" className="text-zinc-400 hover:text-zinc-200 px-6 py-5 h-auto rounded-xl font-medium">
                  Browse Notes
                </Button>
              </Link>
            </div>
          </div>

          {/* Right — Floating Visual */}
          <div className="w-full lg:w-[45%] relative h-[320px] sm:h-[380px] flex items-center justify-center pointer-events-none">
            {/* Central orb glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-gradient-to-r from-indigo-500/25 via-violet-500/20 to-purple-500/15 blur-[60px]" />

            {/* Central Study Copilot card */}
            <div className="absolute w-52 h-60 glass-card rounded-2xl shadow-[0_0_50px_rgba(99,102,241,0.12)] flex flex-col p-5 animate-float" style={{ perspective: "1000px" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">STUDY COPILOT</span>
              </div>
              <div className="flex-1 flex flex-col gap-2.5">
                <div className="h-2 w-3/4 bg-zinc-700 rounded-full" />
                <div className="h-1.5 w-full bg-zinc-800 rounded-full" />
                <div className="h-1.5 w-11/12 bg-zinc-800 rounded-full" />
                <div className="h-1.5 w-full bg-zinc-800 rounded-full" />
                <div className="h-1.5 w-4/5 bg-zinc-800 rounded-full" />
              </div>
              <div className="mt-3 flex gap-2">
                <div className="flex-1 h-6 bg-indigo-500/15 rounded-md" />
                <div className="flex-1 h-6 bg-violet-500/15 rounded-md" />
              </div>
            </div>

            {/* Floating chip: PDF Notes */}
            <div className="absolute glass-card rounded-xl shadow-xl p-2.5 flex items-center gap-2 animate-float-delayed" style={{ top: "8%", right: "5%" }}>
              <FileText className="h-4 w-4 text-indigo-400" />
              <span className="text-[10px] font-bold text-zinc-200">PDF Notes</span>
            </div>

            {/* Floating chip: Smart Summary */}
            <div className="absolute glass-card rounded-xl shadow-xl p-2.5 flex items-center gap-2 animate-float-slow" style={{ top: "15%", left: "0%" }}>
              <FileText className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] font-bold text-zinc-200">Smart Summary</span>
            </div>

            {/* Floating chip: Practice Quiz */}
            <div className="absolute glass-card rounded-xl shadow-xl p-2.5 flex items-center gap-2 animate-float-delayed" style={{ bottom: "20%", right: "0%" }}>
              <BookOpen className="h-4 w-4 text-violet-400" />
              <span className="text-[10px] font-bold text-zinc-200">Practice Quiz</span>
            </div>

            {/* Floating chip: Flashcards */}
            <div className="absolute glass-card rounded-xl shadow-xl p-2.5 flex items-center gap-2 animate-float" style={{ bottom: "8%", left: "10%" }}>
              <GraduationCap className="h-4 w-4 text-amber-400" />
              <span className="text-[10px] font-bold text-zinc-200">Flashcards</span>
            </div>

            {/* Floating chip: Study Pack */}
            <div className="absolute glass-card rounded-xl shadow-xl p-2.5 flex items-center gap-2 animate-float-slow" style={{ bottom: "35%", left: "-5%" }}>
              <Library className="h-4 w-4 text-pink-400" />
              <span className="text-[10px] font-bold text-zinc-200">Study Pack</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURE SHOWCASE ═══════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 w-full mb-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-50 mb-4 select-none">
            Everything you need to revise faster
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto leading-relaxed">
            From PDFs to exam-ready study material in a few clicks.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {[
            { icon: Search, title: "Browse College Notes", desc: "Find approved notes by branch, semester, and subject.", color: "indigo" },
            { icon: UploadCloud, title: "Upload and Share PDFs", desc: "Contribute useful notes and build the study library.", color: "violet" },
            { icon: FileText, title: "Smart Summary", desc: "Turn long PDFs into clean revision summaries.", color: "emerald" },
            { icon: BookOpen, title: "Practice Quiz", desc: "Generate MCQs to test understanding.", color: "blue" },
            { icon: GraduationCap, title: "Flashcards", desc: "Create quick active-recall cards from your notes.", color: "amber" },
            { icon: HelpCircle, title: "Important Questions", desc: "Prepare exam-focused questions from PDFs.", color: "pink" },
            { icon: User, title: "Ask Doubt", desc: "Ask note-based doubts and get clear explanations.", color: "cyan" },
            { icon: Library, title: "Saved Study Library", desc: "All generated study material stays saved for later.", color: "purple" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="hover-lift glass-card rounded-2xl p-6 text-left group"
            >
              <div className={`bg-${color === "indigo" ? "indigo" : color === "violet" ? "violet" : color === "emerald" ? "emerald" : color === "blue" ? "blue" : color === "amber" ? "amber" : color === "pink" ? "pink" : color === "cyan" ? "cyan" : "purple"}-500/10 text-${color === "indigo" ? "indigo" : color === "violet" ? "violet" : color === "emerald" ? "emerald" : color === "blue" ? "blue" : color === "amber" ? "amber" : color === "pink" ? "pink" : color === "cyan" ? "cyan" : "purple"}-400 p-3 rounded-xl w-fit mb-4`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-100 mb-2 group-hover:text-white transition-colors">{title}</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ PREMIUM WORKFLOWS ═══════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 w-full mb-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-50 mb-4 select-none">
            Premium AI study workflows
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Advanced features for serious exam preparation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {/* Exam Sprint */}
          <div className="glass-card hover-lift rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-40 h-full bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="bg-amber-500/10 text-amber-400 p-3 rounded-xl w-fit">
                <Rocket className="h-5 w-5" />
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Active</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100 mb-1.5">Exam Sprint Mode</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Follow a guided revision path from summary to quiz.</p>
            </div>
            <Link href="/dashboard/study-copilot" className="mt-auto">
              <span className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                Open Study Copilot <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>

          {/* Multi-PDF Study Pack */}
          <div className="glass-card hover-lift rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-40 h-full bg-gradient-to-l from-violet-500/5 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="bg-violet-500/10 text-violet-400 p-3 rounded-xl w-fit">
                <Library className="h-5 w-5" />
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Active</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100 mb-1.5">Multi-PDF Study Pack</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Combine 2–5 notes into one source-aware study pack.</p>
            </div>
            <Link href="/dashboard/study-copilot" className="mt-auto">
              <span className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                Create Study Pack <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>

          {/* Extended Scanned PDF */}
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 opacity-80">
            <div className="flex items-center justify-between">
              <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-xl w-fit">
                <Eye className="h-5 w-5" />
              </div>
              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Premium</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-200 mb-1.5">Extended Scanned PDF Reading</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Use AI document reading when normal PDF text extraction is not enough.</p>
            </div>
          </div>

          {/* 100 AI Generations */}
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 opacity-80">
            <div className="flex items-center justify-between">
              <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-xl w-fit">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Premium</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-200 mb-1.5">100 AI Generations</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Get more monthly AI generations for serious exam preparation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 w-full mb-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-50 mb-4 select-none">
            How it works
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto leading-relaxed">
            From PDF to exam-ready in four simple steps.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-indigo-500/30 via-violet-500/30 to-pink-500/30" />

          {[
            { step: 1, title: "Browse or upload notes", color: "indigo" },
            { step: 2, title: "Open a PDF note", color: "violet" },
            { step: 3, title: "Generate study material", color: "pink" },
            { step: 4, title: "Save, revise, build packs", color: "emerald" },
          ].map(({ step, title, color }) => (
            <div key={step} className="flex flex-col items-center gap-4 relative">
              <div className={`h-12 w-12 rounded-full bg-${color}-500/10 border border-${color}-500/30 text-${color}-400 flex items-center justify-center font-bold text-sm z-10 bg-zinc-950`}>
                {step}
              </div>
              <h4 className="text-sm font-bold text-zinc-100">{title}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ TRUST ═══════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 w-full mb-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-50 mb-4 select-none">
            Built for real college study
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Every feature is designed with actual exam preparation in mind.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {[
            { icon: Library, title: "Source-aware Study Packs", desc: "Every generated point traces back to its source note." },
            { icon: CheckCircle2, title: "Saved AI results", desc: "All generated study material is permanently saved for you." },
            { icon: GraduationCap, title: "Exam-focused outputs", desc: "Summaries, quizzes, and questions designed for exam revision." },
            { icon: FileText, title: "Clean PDF workflow", desc: "Extract text from PDFs or use AI document reading for scanned notes." },
            { icon: Shield, title: "Premium/free limits", desc: "Free plan for trying, premium for serious preparation." },
            { icon: Lock, title: "Private saved materials", desc: "Your generated study materials are private to your account." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card-light hover-lift rounded-2xl p-6 flex flex-col gap-3">
              <Icon className="h-5 w-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-zinc-100">{title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ FAQ ═══════════════════ */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 w-full mb-28">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1 text-xs text-indigo-400 font-bold uppercase tracking-wider mb-2">
            <MessageCircleQuestion className="h-4 w-4" /> Got Questions?
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-50 select-none">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="glass-card rounded-3xl p-6 shadow-xl">
          <Accordion className="w-full">
            <AccordionItem value="faq-1" className="border-zinc-800/60">
              <AccordionTrigger className="text-sm font-semibold text-zinc-200 hover:text-zinc-50 hover:no-underline">
                What is Study Copilot?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400 text-xs leading-relaxed">
                Study Copilot is an AI-powered study tool that turns your college PDFs into summaries, practice quizzes, flashcards, important questions, and doubt answers. It works directly from the notes you upload or browse.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2" className="border-zinc-800/60">
              <AccordionTrigger className="text-sm font-semibold text-zinc-200 hover:text-zinc-50 hover:no-underline">
                Is Study Copilot free to use?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400 text-xs leading-relaxed">
                Yes. Free users get 10 AI generations per month. Premium users get 100 generations plus access to Exam Sprint Mode and Multi-PDF Study Pack.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3" className="border-zinc-800/60">
              <AccordionTrigger className="text-sm font-semibold text-zinc-200 hover:text-zinc-50 hover:no-underline">
                What file types are supported?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400 text-xs leading-relaxed">
                We support PDF document uploads. The maximum allowed file size is 50MB per document. Both text-based and scanned PDFs are handled.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-4" className="border-zinc-800/60">
              <AccordionTrigger className="text-sm font-semibold text-zinc-200 hover:text-zinc-50 hover:no-underline">
                Do saved results use extra AI generations?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400 text-xs leading-relaxed">
                No. Opening, reading, copying, deleting, searching, or filtering your saved results does not use any AI generations. Only creating new content counts.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-5" className="border-b-0">
              <AccordionTrigger className="text-sm font-semibold text-zinc-200 hover:text-zinc-50 hover:no-underline">
                How does the admin verification process work?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400 text-xs leading-relaxed">
                Once you upload a document, it enters a verification queue. Administrators evaluate file legibility, confirm details (semester, branch, subject), and check for copyright issues before approving it.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ═══════════════════ BOTTOM CTA ═══════════════════ */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 w-full mb-28">
        <div className="relative overflow-hidden bg-gradient-to-tr from-indigo-900/30 to-violet-900/10 border border-indigo-500/20 rounded-3xl p-10 sm:p-14 text-center flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(99,102,241,0.06)]">
          <div className="absolute inset-0 bg-zinc-950/20 pointer-events-none" />
          <Sparkles className="h-8 w-8 text-indigo-400 relative z-10" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-50 relative z-10 select-none">
            Ready to study smarter?
          </h2>
          <p className="text-zinc-400 max-w-lg leading-relaxed relative z-10">
            Start with Study Copilot for free. Generate summaries, quizzes, flashcards, and more from any college PDF.
          </p>
          <div className="flex flex-wrap gap-3 mt-2 relative z-10 justify-center">
            <Show when="signed-in">
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold shadow-xl hover:shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 px-8 py-5 h-auto rounded-xl">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/study-copilot">
                <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800/40 px-8 py-5 h-auto rounded-xl font-semibold">
                  Open Study Copilot
                </Button>
              </Link>
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold shadow-xl hover:shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 px-8 py-5 h-auto rounded-xl">
                  Get Started Now
                </Button>
              </SignInButton>
              <Link href="/dashboard/browse">
                <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800/40 px-8 py-5 h-auto rounded-xl font-semibold">
                  Browse Library
                </Button>
              </Link>
            </Show>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
