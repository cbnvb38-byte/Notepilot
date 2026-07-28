import Link from "next/link";
import { History, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLink: string;
  actionText: string;
}

export function EmptyDashboardState({ title, description, actionLink, actionText }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 sm:py-16 px-2 sm:px-4 w-full min-w-0 max-w-full">
      <div className="relative mb-6 group">
        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full group-hover:bg-indigo-500/30 transition-colors" />
        <div className="h-20 w-20 bg-zinc-950/80 backdrop-blur-sm border-2 border-indigo-500/30 text-indigo-400 rounded-3xl flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(99,102,241,0.2)] group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3">
          <History className="h-8 w-8" />
        </div>
      </div>
      <h3 className="font-black text-lg sm:text-xl text-white mb-2 break-words whitespace-normal max-w-full px-2">{title}</h3>
      <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md font-medium break-words whitespace-normal px-2">
        {description}
      </p>
      <Link href={actionLink} className="mt-8">
        <Button size="lg" className="glow-border bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold gap-2 text-sm py-6 px-8 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all duration-300">
          <Plus className="h-5 w-5" />
          {actionText}
        </Button>
      </Link>
    </div>
  );
}
