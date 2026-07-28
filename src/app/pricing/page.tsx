import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getUserAIUsage } from "@/app/actions/ai-usage";
import {
  Crown,
  Sparkles,
  Check,
  X,
  Zap,
  Eye,
  Timer,
  GraduationCap,
  ChevronDown,
  ArrowRight,
  FileWarning,
} from "lucide-react";
import { RazorpayCheckoutButton } from "@/components/pricing/razorpay-checkout-button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pricing — Choose Your Study Plan | College Notes",
  description:
    "Start free with 10 AI study generations per month, or upgrade to Premium for 100 generations, scanned PDF support, and upcoming exam-focused workflows.",
};

const FREE_FEATURES = [
  "10 AI generations / month",
  "Smart Summary",
  "Practice Quiz",
  "Flashcards",
  "Important Questions",
  "Ask Doubt",
  "Saved Study Library",
  "Basic PDF note support",
];

const PREMIUM_FEATURES = [
  "100 AI generations / month",
  "Exam Sprint Mode",
  "Multi-PDF Study Pack",
  "Extended scanned / handwritten PDF usage",
  "Premium Member badge",
  "Premium Study Copilot workspace",
  "Saved Study Library",
];

const COMPARISON_ROWS: { feature: string; free: boolean | string; premium: boolean | string }[] = [
  { feature: "AI generations / month", free: "10", premium: "100" },
  { feature: "Smart Summary", free: true, premium: true },
  { feature: "Practice Quiz", free: true, premium: true },
  { feature: "Flashcards", free: true, premium: true },
  { feature: "Important Questions", free: true, premium: true },
  { feature: "Ask Doubt", free: true, premium: true },
  { feature: "Saved Study Library", free: true, premium: true },
  { feature: "Scanned PDF support", free: "Basic", premium: "Extended" },
  { feature: "Exam Sprint Mode", free: false, premium: true },
  { feature: "Multi-PDF Study Pack", free: false, premium: true },
  { feature: "Premium badge", free: false, premium: true },
];

const WHY_UPGRADE = [
  {
    icon: "zap",
    title: "More AI room",
    desc: "Generate more summaries, quizzes, flashcards, doubts, and exam questions without hitting a wall.",
  },
  {
    icon: "eye",
    title: "Better scanned note support",
    desc: "Use AI with scanned and handwritten PDFs more comfortably with extended extraction.",
  },
  {
    icon: "timer",
    title: "Exam-focused workflows",
    desc: "Exam Sprint Mode and Multi-PDF Study Pack help you revise faster and smarter before exams.",
  },
  {
    icon: "crown",
    title: "Premium study identity",
    desc: "Get a Premium Member badge and upgraded Study Copilot workspace built for serious students.",
  },
];

const FAQS = [
  {
    q: "Can I use Study Copilot for free?",
    a: "Yes. Free users get 10 AI generations per month, covering Smart Summary, Practice Quiz, Flashcards, Important Questions, and Ask Doubt.",
  },
  {
    q: "What counts as an AI generation?",
    a: "Generating a summary, quiz, flashcards, important questions, or submitting a doubt each count as one generation.",
  },
  {
    q: "Do saved results count again?",
    a: "No. Opening, reading, copying, deleting, searching, or filtering your saved results does not use any AI generations.",
  },
  {
    q: "Is scanned PDF support available?",
    a: "Basic scanned PDF support is available to all users. Extended and more reliable scanned/handwritten PDF usage is planned for Premium.",
  },
  {
    q: "Is payment available now?",
    a: "Yes! You can upgrade to Premium anytime for a one-time payment of ₹99, giving you 30 days of full access to all Godmode features.",
  },
];

function IconFor({ name }: { name: string }) {
  if (name === "zap") return <Zap className="h-5 w-5 text-indigo-400" />;
  if (name === "eye") return <Eye className="h-5 w-5 text-indigo-400" />;
  if (name === "timer") return <Timer className="h-5 w-5 text-indigo-400" />;
  return <Crown className="h-5 w-5 text-indigo-400" />;
}

export default async function PricingPage() {
  const { userId } = await auth();
  let plan: "free" | "premium" | null = null;
  let usedThisMonth = 0;
  let monthlyLimit = 10;
  let isPremiumActive = false;
  let isPremiumExpired = false;

  if (userId) {
    const usageResult = await getUserAIUsage();
    if (usageResult.success && usageResult.data) {
      plan = usageResult.data.plan;
      usedThisMonth = usageResult.data.usedThisMonth;
      monthlyLimit = usageResult.data.monthlyLimit;
      isPremiumActive = usageResult.data.isPremiumActive || false;
      isPremiumExpired = usageResult.data.isPremiumExpired || false;
    }
  }  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-50 overflow-x-hidden w-full min-w-0 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden w-full">
        <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute top-[10%] right-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[160px]" />
        <div className="absolute bottom-[20%] left-1/3 w-[450px] h-[450px] rounded-full bg-amber-600/5 blur-[140px]" />
      </div>

      <Header />

      <main className="flex-grow z-10 pt-28 pb-24 px-4 sm:px-6 max-w-6xl mx-auto w-full flex flex-col gap-24 relative">

        {/* HERO */}
        <div className="flex flex-col items-center text-center gap-6 pt-10">
          {isPremiumActive && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20 shadow-inner">
              <Crown className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Premium Member</span>
            </div>
          )}
          {isPremiumExpired && !isPremiumActive && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 shadow-inner">
              <FileWarning className="h-4 w-4 text-red-400" />
              <span className="text-xs font-black text-red-400 uppercase tracking-widest">Premium Expired</span>
            </div>
          )}
          {!isPremiumActive && !isPremiumExpired && userId && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/60 border border-zinc-800 shadow-inner">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Free Plan Active</span>
            </div>
          )}
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[1.1] max-w-4xl drop-shadow-2xl">
            Choose Your{" "}
            <span className="bg-gradient-to-br from-indigo-400 via-violet-400 to-amber-400 bg-clip-text text-transparent drop-shadow-lg">
              Study Plan
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 font-medium max-w-2xl leading-relaxed mt-2">
            Start for free. Upgrade when you need Godmode study power.
          </p>
        </div>

        {/* PLAN CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto w-full">

          {/* Free */}
          <div className="godmode-card flex flex-col gap-8 bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/80 rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg w-fit shadow-inner">Free</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-6xl font-black text-zinc-100 tracking-tighter">₹0</span>
                <span className="text-sm font-bold uppercase tracking-widest text-zinc-500">/month</span>
              </div>
              <p className="text-sm font-medium text-zinc-400 mt-2">For trying Study Copilot basics.</p>
            </div>

            {plan === "free" && userId && (
              <div className="flex flex-col gap-3 bg-zinc-900/80 border border-zinc-800/80 shadow-inner rounded-2xl p-5 mt-2">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                  <span className="text-zinc-500">AI Usage this month</span>
                  <span className="text-indigo-400">{usedThisMonth} / {monthlyLimit}</span>
                </div>
                <div className="h-2 w-full bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-500"
                    style={{ width: `${Math.min(100, (usedThisMonth / monthlyLimit) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            <ul className="flex flex-col gap-4 flex-1 mt-4">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm font-medium text-zinc-300">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-0.5 mt-0.5 shrink-0 shadow-inner">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-8">
              {isPremiumActive ? (
                <div className="w-full py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 font-black uppercase tracking-widest text-xs text-center cursor-default shadow-inner">
                  Included
                </div>
              ) : userId ? (
                <div className="w-full py-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-black uppercase tracking-widest text-xs text-center cursor-default shadow-inner">
                  ✓ Current Plan
                </div>
              ) : (
                <Link href="/sign-up" className="block w-full">
                  <button className="w-full py-4 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-900 font-black text-sm transition-all shadow-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    Start Free
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Premium */}
          <div className="godmode-card flex flex-col gap-8 bg-gradient-to-b from-zinc-950/80 to-zinc-900/80 backdrop-blur-xl border border-amber-500/30 rounded-[2.5rem] p-8 sm:p-10 relative shadow-[0_20px_80px_rgba(245,158,11,0.15)] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent shadow-[0_0_30px_rgba(245,158,11,0.6)]" />
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="absolute top-8 right-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-500 to-amber-300 text-amber-950 shadow-lg">
                <Crown className="h-3.5 w-3.5" /> Most Popular
              </span>
            </div>

            <div className="flex flex-col gap-2 relative z-10">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg w-fit shadow-inner">Premium</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl sm:text-6xl font-black text-white tracking-tight">₹99</span>
                <span className="text-sm font-bold uppercase tracking-widest text-amber-500/80">/ 30 Days</span>
              </div>
              <p className="text-sm font-medium text-zinc-400 mt-2">For serious Godmode exam preparation.</p>
            </div>

            <ul className="flex flex-col gap-4 flex-1 mt-4 relative z-10">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm font-medium text-zinc-200">
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-0.5 mt-0.5 shrink-0 shadow-inner">
                    <Check className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-8 flex flex-col gap-4 relative z-10">
              <RazorpayCheckoutButton 
                isPremiumExpired={isPremiumExpired}
                isPremiumActive={isPremiumActive}
                userId={userId}
              />
              <Link href="/dashboard/contact" className="block w-full">
                <button className="w-full py-3.5 rounded-2xl bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800/80 text-zinc-400 hover:text-white font-bold text-xs transition-colors shadow-inner">
                  Contact Admin / Questions
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="flex flex-col gap-10 max-w-4xl mx-auto w-full">
          <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Plan Comparison</h2>
            <p className="text-sm font-medium text-zinc-400">Everything side by side.</p>
          </div>

          <div className="godmode-card rounded-3xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl overflow-x-auto shadow-[0_15px_50px_rgba(0,0,0,0.5)]">
            <div className="min-w-[500px]">
            <div className="grid grid-cols-3 border-b border-zinc-800/80 bg-zinc-900/80">
              <div className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest">Feature</div>
              <div className="px-6 py-5 text-xs font-black text-zinc-300 uppercase tracking-widest text-center border-l border-zinc-800/80">Free</div>
              <div className="px-6 py-5 text-xs font-black text-amber-400 uppercase tracking-widest text-center border-l border-zinc-800/80">
                <span className="flex items-center justify-center gap-2"><Crown className="h-4 w-4" />Premium</span>
              </div>
            </div>
            {COMPARISON_ROWS.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 border-b border-zinc-800/60 last:border-b-0 hover:bg-zinc-900/30 transition-colors ${i % 2 !== 0 ? "bg-zinc-950/40" : "bg-transparent"}`}>
                <div className="px-6 py-4 text-sm text-zinc-300 font-semibold">{row.feature}</div>
                <div className="px-6 py-4 text-center border-l border-zinc-800/60 flex items-center justify-center">
                  {typeof row.free === "boolean"
                    ? row.free ? <Check className="h-5 w-5 text-emerald-400" /> : <X className="h-5 w-5 text-zinc-600" />
                    : <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{row.free}</span>}
                </div>
                <div className="px-6 py-4 text-center border-l border-zinc-800/60 flex items-center justify-center">
                  {typeof row.premium === "boolean"
                    ? row.premium ? <Check className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" /> : <X className="h-5 w-5 text-zinc-600" />
                    : <span className={`text-xs font-bold uppercase tracking-widest ${row.premium === "Coming Soon" ? "text-amber-500/50" : "text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"}`}>{row.premium}</span>}
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* WHY PREMIUM */}
        <div className="flex flex-col gap-10 max-w-5xl mx-auto w-full">
          <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Why students upgrade</h2>
            <p className="text-sm font-medium text-zinc-400">Study smarter with more AI power.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {WHY_UPGRADE.map(({ icon, title, desc }) => (
              <div key={title} className="godmode-card flex flex-col gap-4 bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8 hover:border-indigo-500/30 hover:bg-zinc-900/60 transition-all shadow-lg hover:shadow-[0_15px_40px_rgba(99,102,241,0.1)] group">
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 w-fit shadow-inner group-hover:scale-110 transition-transform">
                  <IconFor name={icon} />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-tight mb-2 group-hover:text-indigo-300 transition-colors">{title}</h3>
                  <p className="text-sm font-medium text-zinc-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="flex flex-col gap-10 max-w-3xl mx-auto w-full">
          <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="flex flex-col gap-4">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group godmode-card bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all shadow-lg">
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none select-none">
                  <span className="text-base font-black text-zinc-100 group-hover:text-indigo-300 transition-colors">{q}</span>
                  <div className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg shadow-inner group-open:bg-indigo-500/10 group-open:border-indigo-500/30 transition-colors">
                     <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0 transition-transform duration-300 group-open:rotate-180 group-open:text-indigo-400" />
                  </div>
                </summary>
                <div className="px-6 pb-6 pt-0">
                  <p className="text-sm font-medium text-zinc-400 leading-relaxed">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="flex flex-col items-center gap-8 text-center godmode-card bg-zinc-950/60 border border-zinc-800/80 rounded-[3rem] py-20 px-8 backdrop-blur-xl relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] max-w-4xl mx-auto w-full">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-indigo-600/10 blur-[100px] rounded-full" />
          </div>
          <div className="bg-indigo-500/10 p-4 rounded-3xl border border-indigo-500/20 shadow-inner z-10 mb-2">
             <GraduationCap className="h-10 w-10 text-indigo-400" />
          </div>
          <div className="z-10 flex flex-col gap-4 items-center">
            <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tighter">Ready to study smarter?</h3>
            <p className="text-base font-medium text-zinc-400 max-w-md">
              Start with Study Copilot for free. Upgrade when you need more Godmode study power.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 z-10 w-full sm:w-auto mt-4">
            <Link href="/dashboard/study-copilot" className="block w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl glow-border bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-sm transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2">
                Open Study Copilot <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/dashboard/contact" className="block w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white font-bold text-sm transition-colors shadow-inner">
                Request Premium Access
              </button>
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
