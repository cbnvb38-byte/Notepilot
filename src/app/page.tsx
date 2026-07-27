import Link from "next/link";
import Image from "next/image";
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
      <section className="relative z-10 pt-24 sm:pt-32 pb-24 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          {/* Left — Copy */}
          <div className="flex flex-col gap-8 w-full lg:w-[50%] text-center lg:text-left animate-fade-in-up">
            {/* Banner Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 text-indigo-300 text-xs font-semibold shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:border-indigo-500/40 hover:bg-indigo-500/15 transition-all duration-300 mx-auto lg:mx-0 w-fit">
              <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span className="uppercase tracking-widest text-[10px]">NotePilot · AI Study Copilot</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] select-none text-zinc-100">
              Turn notes into{" "}
              <br className="block" />
              <span className="bg-gradient-to-br from-indigo-400 via-violet-400 to-amber-400 bg-clip-text text-transparent animate-godmode-shimmer bg-[length:200%_auto]">
                exam-ready study packs.
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-zinc-400 max-w-xl leading-relaxed mx-auto lg:mx-0">
              Browse notes, upload PDFs, and use Study Copilot to generate summaries, quizzes, flashcards, doubts, exam sprints, and multi-note study packs.
            </p>

            <p className="text-xs font-medium uppercase tracking-widest text-zinc-600 mx-auto lg:mx-0 mt-2">
              Created and designed by Raj Dwivedi
            </p>

            {/* CTAs — Auth-aware */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mt-2">
              <Show when="signed-in">
                <Link href="/dashboard">
                  <Button size="lg" className="glow-border bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold shadow-xl hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 px-8 py-6 h-auto rounded-2xl text-base">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard/study-copilot">
                  <Button size="lg" variant="outline" className="border-indigo-500/30 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 px-8 py-6 h-auto rounded-2xl font-bold transition-all duration-300 text-base shadow-[0_0_20px_rgba(99,102,241,0.05)] hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                    Open Study Copilot
                  </Button>
                </Link>
              </Show>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <Button size="lg" className="glow-border bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold shadow-xl hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 px-8 py-6 h-auto rounded-2xl text-base">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button size="lg" variant="outline" className="glass-panel text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800/40 px-8 py-6 h-auto rounded-2xl font-bold transition-all duration-300 text-base">
                    Sign In
                  </Button>
                </SignInButton>
              </Show>
              <Link href="/dashboard/browse" className="w-full sm:w-auto">
                <Button size="lg" variant="ghost" className="text-zinc-400 hover:text-zinc-200 px-8 py-6 h-auto rounded-2xl font-semibold transition-all duration-300 text-base w-full sm:w-auto">
                  Explore Notes
                </Button>
              </Link>
            </div>
          </div>

          {/* Right — Floating Visual: AI Study Pilot */}
          <div className="w-full lg:w-[50%] relative h-[350px] sm:h-[450px] lg:h-[500px] flex flex-col items-center justify-center pointer-events-none group mt-10 lg:mt-0">
            {/* Soft Glow Behind Image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-gradient-to-tr from-indigo-500/20 via-violet-500/20 to-transparent rounded-full blur-[90px] animate-pulse duration-[6000ms]" />

            {/* Image & Signature Wrapper */}
            <div className="relative z-10 w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[480px] animate-hero-float motion-reduce:animate-none">
              {/* Hero Image Container */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/5 shadow-[0_0_50px_rgba(99,102,241,0.15)] bg-zinc-900/30">
                
                {/* Fallback Visual (behind image) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-0 p-6 text-center">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-1">
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                  </div>
                  <span className="font-bold text-zinc-300 text-sm">NotePilot</span>
                </div>

                <Image 
                  src="/assets/notepilot-hero.png" 
                  alt="NotePilot AI study workspace preview" 
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 z-10 text-transparent"
                />
              </div>

              {/* Signature Integration */}
              <div className="absolute -bottom-6 right-2 sm:-bottom-8 sm:right-6 w-24 sm:w-32 z-20 pointer-events-none transition-opacity duration-500" style={{ mixBlendMode: 'lighten', filter: 'invert(1) opacity(0.5)' }}>
                <Image 
                  src="/assets/signature.png" 
                  alt="Creator Signature" 
                  width={144}
                  height={72}
                  className="w-full h-auto object-contain drop-shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURE SHOWCASE ═══════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 w-full mb-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">
            <Zap className="h-3 w-3 text-indigo-400" />
            Powerful Toolset
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-zinc-50 mb-5 select-none">
            Everything you need to <span className="text-zinc-500">revise faster</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            From raw PDFs to exam-ready study material in just a few clicks. No prompt engineering required.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { icon: Search, title: "Explore Notes", desc: "Find approved notes by branch, semester, and subject.", color: "indigo" },
            { icon: UploadCloud, title: "Upload & Share", desc: "Contribute useful notes and build the study library.", color: "violet" },
            { icon: FileText, title: "Smart Summary", desc: "Turn long PDFs into clean, organized revision summaries.", color: "emerald" },
            { icon: BookOpen, title: "Practice Quiz", desc: "Generate MCQs with detailed explanations to test understanding.", color: "blue" },
            { icon: GraduationCap, title: "Flashcards", desc: "Create active-recall cards directly from your uploaded notes.", color: "amber" },
            { icon: HelpCircle, title: "Important Questions", desc: "Prepare exam-focused questions based on the PDF content.", color: "pink" },
            { icon: User, title: "Ask Doubt", desc: "Ask note-based doubts and get clear, simple explanations.", color: "cyan" },
            { icon: Library, title: "Saved Study Library", desc: "All generated study material stays securely saved for later.", color: "indigo" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="hover-lift godmode-card rounded-3xl p-7 text-left group flex flex-col gap-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none transform translate-x-4 -translate-y-4">
                <Icon className="h-24 w-24" />
              </div>
              <div className={`bg-${color}-500/10 text-${color}-400 p-3.5 rounded-2xl w-fit border border-${color}-500/20 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(var(--${color}-500),0.1)]`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100 mb-2 group-hover:text-white transition-colors">{title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ FOUNDER SECTION ═══════════════════ */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 w-full mb-32">
        <div className="flex items-center justify-center">
          <p className="text-sm font-medium text-zinc-600">
            Created and designed by Raj Dwivedi (RD)
          </p>
        </div>
      </section>

      {/* ═══════════════════ PREMIUM WORKFLOWS ═══════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 w-full mb-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest text-amber-400 mb-6">
            <Crown className="h-3 w-3" />
            Premium Access
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-zinc-50 mb-5 select-none">
            Pro study workflows
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Advanced features designed for serious exam preparation and intensive study sessions.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Exam Sprint */}
          <div className="premium-glass hover-lift hover-glow rounded-3xl p-8 flex flex-col gap-5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none transition-opacity group-hover:opacity-100 opacity-50" />
            <div className="absolute -right-8 -top-8 opacity-5 transform rotate-12 pointer-events-none">
              <Rocket className="h-48 w-48 text-amber-400" />
            </div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-3.5 rounded-2xl w-fit text-zinc-950 shadow-lg shadow-amber-500/20">
                <Rocket className="h-6 w-6" />
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-black uppercase tracking-widest">Active</span>
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-zinc-100 mb-2">Exam Sprint Mode</h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-md">Follow a guided, time-boxed revision path from summary reading directly to active recall quizzes. Perfect for the night before exams.</p>
            </div>
            <Link href="/dashboard/study-copilot" className="mt-auto relative z-10">
              <span className="text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 group-hover:translate-x-1 duration-300">
                Open Study Copilot <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>

          {/* Multi-PDF Study Pack */}
          <div className="premium-glass hover-lift hover-glow rounded-3xl p-8 flex flex-col gap-5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-violet-500/10 to-transparent pointer-events-none transition-opacity group-hover:opacity-100 opacity-50" />
            <div className="absolute -right-8 -top-8 opacity-5 transform -rotate-12 pointer-events-none">
              <Library className="h-48 w-48 text-violet-400" />
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="bg-gradient-to-br from-violet-400 to-purple-500 p-3.5 rounded-2xl w-fit text-zinc-950 shadow-lg shadow-violet-500/20">
                <Library className="h-6 w-6" />
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-black uppercase tracking-widest">Active</span>
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-zinc-100 mb-2">Multi-PDF Study Pack</h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-md">Combine up to 5 notes into a single, source-aware study pack. Generate comprehensive material that spans across multiple lectures.</p>
            </div>
            <Link href="/dashboard/study-copilot" className="mt-auto relative z-10">
              <span className="text-sm font-bold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1.5 group-hover:translate-x-1 duration-300">
                Create Study Pack <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>

          {/* Extended Scanned PDF */}
          <div className="godmode-card rounded-3xl p-7 flex flex-col gap-4 opacity-80 border-zinc-800/80">
            <div className="flex items-center justify-between">
              <div className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 p-3 rounded-xl w-fit">
                <Eye className="h-5 w-5" />
              </div>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1"><Crown className="h-3 w-3" /> NotePilot Pro</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-200 mb-2">Extended Scanned PDF Support</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Leverage advanced AI document reading when standard PDF text extraction falls short, perfect for handwritten notes.</p>
            </div>
          </div>

          {/* 100 AI Generations */}
          <div className="godmode-card rounded-3xl p-7 flex flex-col gap-4 opacity-80 border-zinc-800/80">
            <div className="flex items-center justify-between">
              <div className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 p-3 rounded-xl w-fit">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1"><Crown className="h-3 w-3" /> NotePilot Pro</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-200 mb-2">100 AI Generations / Month</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Expand your monthly AI limit drastically to ensure you never run out of study generations during exam season.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 w-full mb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-50 mb-4 select-none">
            How it works
          </h2>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
            From PDF to exam-ready in four simple steps.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-1 bg-zinc-900 rounded-full" />
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-1 bg-gradient-to-r from-indigo-500/50 via-violet-500/50 to-pink-500/50 rounded-full" />

          {[
            { step: 1, title: "Browse or Upload", color: "indigo" },
            { step: 2, title: "Open a PDF Note", color: "violet" },
            { step: 3, title: "Generate Study Material", color: "pink" },
            { step: 4, title: "Save, Revise, Build Packs", color: "emerald" },
          ].map(({ step, title, color }) => (
            <div key={step} className="flex flex-col items-center gap-5 relative group">
              <div className={`h-20 w-20 rounded-2xl bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center font-black text-2xl z-10 text-zinc-600 transition-all duration-300 group-hover:border-${color}-500/50 group-hover:text-${color}-400 group-hover:shadow-[0_0_30px_rgba(var(--${color}-500),0.2)]`}>
                {step}
              </div>
              <h4 className="text-base font-bold text-zinc-300 group-hover:text-zinc-100 transition-colors">{title}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ TRUST ═══════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 w-full mb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-50 mb-4 select-none">
            Built for real college study
          </h2>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Every feature is designed with actual exam preparation in mind.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { icon: Library, title: "Source-aware Study Packs", desc: "Every generated point traces back to its source note." },
            { icon: CheckCircle2, title: "Saved AI results", desc: "All generated study material is permanently saved for you." },
            { icon: GraduationCap, title: "Exam-focused outputs", desc: "Summaries, quizzes, and questions designed for exam revision." },
            { icon: FileText, title: "Clean PDF workflow", desc: "Extract text from PDFs or use AI document reading for scanned notes." },
            { icon: Shield, title: "Premium/free limits", desc: "Free plan for trying, premium for serious preparation." },
            { icon: Lock, title: "Private saved materials", desc: "Your generated study materials are private to your account." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card-light hover-lift rounded-3xl p-7 flex flex-col gap-4 border-zinc-800/60">
              <Icon className="h-6 w-6 text-indigo-400" />
              <h3 className="text-base font-bold text-zinc-100">{title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ FAQ ═══════════════════ */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 w-full mb-32">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6">
            <MessageCircleQuestion className="h-3 w-3" /> Got Questions?
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-50 select-none">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="godmode-card rounded-3xl p-8 shadow-2xl border-zinc-800/80">
          <Accordion className="w-full">
            <AccordionItem value="faq-1" className="border-zinc-800/60">
              <AccordionTrigger className="text-base font-bold text-zinc-200 hover:text-zinc-50 hover:no-underline py-5">
                What is Study Copilot?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400 text-sm leading-relaxed pb-5">
                Study Copilot is an AI-powered study tool that turns your college PDFs into summaries, practice quizzes, flashcards, important questions, and doubt answers. It works directly from the notes you upload or browse.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2" className="border-zinc-800/60">
              <AccordionTrigger className="text-base font-bold text-zinc-200 hover:text-zinc-50 hover:no-underline py-5">
                Is Study Copilot free to use?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400 text-sm leading-relaxed pb-5">
                Yes. Free users get 10 AI generations per month. Premium users get 100 generations plus access to Exam Sprint Mode and Multi-PDF Study Pack.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3" className="border-zinc-800/60">
              <AccordionTrigger className="text-base font-bold text-zinc-200 hover:text-zinc-50 hover:no-underline py-5">
                What file types are supported?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400 text-sm leading-relaxed pb-5">
                We support PDF document uploads. The maximum allowed file size is 50MB per document. Both text-based and scanned PDFs are handled.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-4" className="border-zinc-800/60">
              <AccordionTrigger className="text-base font-bold text-zinc-200 hover:text-zinc-50 hover:no-underline py-5">
                Do saved results use extra AI generations?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400 text-sm leading-relaxed pb-5">
                No. Opening, reading, copying, deleting, searching, or filtering your saved results does not use any AI generations. Only creating new content counts.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-5" className="border-b-0">
              <AccordionTrigger className="text-base font-bold text-zinc-200 hover:text-zinc-50 hover:no-underline py-5">
                How does the admin verification process work?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400 text-sm leading-relaxed pb-5">
                Once you upload a document, it enters a verification queue. Administrators evaluate file legibility, confirm details (semester, branch, subject), and check for copyright issues before approving it.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ═══════════════════ BOTTOM CTA ═══════════════════ */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 w-full mb-32">
        <div className="relative overflow-hidden godmode-card border-indigo-500/30 rounded-3xl p-12 md:p-20 text-center flex flex-col items-center gap-8 shadow-[0_0_80px_rgba(99,102,241,0.15)] group">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 via-transparent to-violet-900/20 pointer-events-none group-hover:opacity-70 transition-opacity duration-500" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-indigo-500/20 blur-[100px] pointer-events-none" />
          
          <Sparkles className="h-10 w-10 text-indigo-400 relative z-10 animate-pulse" />
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-zinc-50 relative z-10 select-none">
            Ready to study smarter?
          </h2>
          <p className="text-lg text-zinc-300 max-w-xl leading-relaxed relative z-10">
            Start with Study Copilot for free. Generate summaries, quizzes, flashcards, and more from any college PDF.
          </p>
          <div className="flex flex-wrap gap-4 mt-4 relative z-10 justify-center">
            <Show when="signed-in">
              <Link href="/dashboard">
                <Button size="lg" className="glow-border bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold shadow-xl hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 px-10 py-6 h-auto rounded-2xl text-lg">
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard/study-copilot">
                <Button size="lg" variant="outline" className="glass-panel text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 px-10 py-6 h-auto rounded-2xl font-bold transition-all duration-300 text-lg border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.05)]">
                  Open Study Copilot
                </Button>
              </Link>
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button size="lg" className="glow-border bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold shadow-xl hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 px-10 py-6 h-auto rounded-2xl text-lg">
                  Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignInButton>
              <Link href="/dashboard/browse">
                <Button size="lg" variant="outline" className="glass-panel text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800/40 px-10 py-6 h-auto rounded-2xl font-bold transition-all duration-300 text-lg border-zinc-700/50">
                  Explore Notes
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

