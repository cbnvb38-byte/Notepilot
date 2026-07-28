"use client";

import Link from "next/link";
import { GraduationCap, ArrowRight, Menu, X } from "lucide-react";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/40 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 p-2 rounded-xl text-white group-hover:scale-105 transition-transform duration-300 shadow-md shadow-indigo-500/15">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-300 bg-clip-text text-transparent">
            NotePilot
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
          <Show when="signed-in">
            <Link href="/dashboard" className="hover:text-zinc-50 transition-colors duration-200">
              Dashboard
            </Link>
            <Link href="/dashboard/study-copilot" className="hover:text-zinc-50 transition-colors duration-200">
              Study Copilot
            </Link>
          </Show>
          <Link href="/dashboard/browse" className="hover:text-zinc-50 transition-colors duration-200">
            Browse Notes
          </Link>
          <Link href="/pricing" className="hover:text-zinc-50 transition-colors duration-200">
            Pricing
          </Link>
        </nav>

        {/* Actions Menu */}
        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/50"
              >
                Sign In
              </Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button
                size="sm"
                className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Get Started
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard/study-copilot" className="hidden sm:inline-flex">
              <Button
                variant="ghost"
                size="sm"
                className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 mr-1"
              >
                Study Copilot
              </Button>
            </Link>
            <Link href="/dashboard" className="hidden sm:inline-flex">
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/50"
              >
                Dashboard
              </Button>
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 rounded-full ring-2 ring-indigo-500/25 hover:ring-indigo-500/50 transition-all duration-200",
                },
              }}
            />
          </Show>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-zinc-50 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[280px] bg-zinc-950/95 border-l border-zinc-800/60 shadow-2xl z-[100] md:hidden flex flex-col backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-800/40">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-300 bg-clip-text text-transparent">
                  NotePilot Menu
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-50 transition-colors rounded-full hover:bg-zinc-800/50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col gap-2 p-4 overflow-y-auto">
                <Show when="signed-in">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 px-4 mt-2">
                    Study
                  </div>
                  <Link
                    href="/dashboard"
                    prefetch={true}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      pathname === "/dashboard"
                        ? "bg-zinc-900/80 text-zinc-100"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/study-copilot"
                    prefetch={true}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      pathname === "/dashboard/study-copilot"
                        ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                        : "text-indigo-400/80 hover:text-indigo-300 hover:bg-indigo-500/10"
                    }`}
                  >
                    Study Copilot
                  </Link>
                  <div className="h-px bg-zinc-800/40 my-2" />
                </Show>

                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 px-4 mt-2">
                  Explore
                </div>
                <Link
                  href="/dashboard/browse"
                  prefetch={true}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    pathname === "/dashboard/browse"
                      ? "bg-zinc-900/80 text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                  }`}
                >
                  Browse Notes
                </Link>
                <Link
                  href="/pricing"
                  prefetch={true}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    pathname === "/pricing"
                      ? "bg-zinc-900/80 text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                  }`}
                >
                  Pricing
                </Link>
                <Link
                  href="/dashboard/help"
                  prefetch={true}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    pathname === "/dashboard/help"
                      ? "bg-zinc-900/80 text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                  }`}
                >
                  Help / About
                </Link>

                <Show when="signed-out">
                  <div className="h-px bg-zinc-800/40 my-2" />
                  <div className="px-4 py-2 flex flex-col gap-3">
                    <SignInButton mode="modal">
                      <Button
                        variant="outline"
                        className="w-full justify-center border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800"
                      >
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignInButton mode="modal">
                      <Button
                        className="w-full justify-center bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg"
                      >
                        Get Started
                      </Button>
                    </SignInButton>
                  </div>
                </Show>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
