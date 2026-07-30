"use client";

import Link from "next/link";
import { GraduationCap, ArrowRight, Menu, X } from "lucide-react";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

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

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800/40 bg-zinc-950/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-3">
          <Show when="signed-in">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-zinc-300 hover:text-zinc-50 py-2 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/study-copilot"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 py-2 transition-colors"
            >
              Study Copilot
            </Link>
          </Show>
          <Link
            href="/dashboard/browse"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-medium text-zinc-300 hover:text-zinc-50 py-2 transition-colors"
          >
            Browse Notes
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-medium text-zinc-300 hover:text-zinc-50 py-2 transition-colors"
          >
            Pricing
          </Link>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                onClick={() => setMobileOpen(false)}
                className="text-left text-sm font-medium text-zinc-300 hover:text-zinc-50 py-2 transition-colors w-full"
              >
                Sign In
              </button>
            </SignInButton>
          </Show>
        </div>
      )}
    </header>
  );
}
