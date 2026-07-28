"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, SignOutButton } from "@clerk/nextjs";
import {
  BookOpen,
  LayoutDashboard,
  UploadCloud,
  Search,
  Bookmark,
  User,
  Settings,
  ShieldAlert,
  Menu,
  X,
  Bell,
  LogOut,
  ChevronRight,
  GraduationCap,
  FileUp,
  Sparkles,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/notification-bell";

interface DashboardShellProps {
  children: React.ReactNode;
  userRole?: string;
}

export function DashboardShell({ children, userRole = "student" }: DashboardShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  const isAdminOrModerator = userRole === "admin" || userRole === "moderator";

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Study Copilot", href: "/dashboard/study-copilot", icon: Sparkles },
    { name: "Upload Notes", href: "/dashboard/upload", icon: UploadCloud },
    { name: "My Uploads", href: "/dashboard/my-uploads", icon: FileUp },
    { name: "Browse Notes", href: "/dashboard/browse", icon: Search },
    { name: "Bookmarks", href: "/dashboard/bookmarks", icon: Bookmark },
  ];

  const bottomNavigation = [
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ...(isAdminOrModerator ? [{ name: "Admin Panel", href: "/dashboard/admin", icon: ShieldAlert }] : []),
  ];

  const mobileBottomNav = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "Browse", href: "/dashboard/browse", icon: Search },
    { name: "Copilot", href: "/dashboard/study-copilot", icon: Sparkles },
    { name: "Bookmarks", href: "/dashboard/bookmarks", icon: Bookmark },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex overflow-hidden font-sans select-none">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800/80 bg-zinc-950/50 backdrop-blur-3xl shrink-0 z-40 relative">
        <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent" />
        
        <div className="h-20 flex items-center px-6 border-b border-zinc-800/60 relative">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-xl text-white group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-black text-base tracking-tight text-zinc-50 group-hover:text-white transition-colors">
              Study Copilot
            </span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-8 px-4 flex flex-col gap-10 scrollbar-hide">
          <nav className="flex flex-col gap-1.5">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 px-3">Main Menu</div>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 group",
                    isActive 
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]" 
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
                  )}
                >
                  <item.icon className={cn("h-4.5 w-4.5 transition-transform duration-300", isActive ? "text-indigo-400" : "text-zinc-500 group-hover:scale-110")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <nav className="flex flex-col gap-1.5 mt-auto pb-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 px-3">Preferences</div>
            {bottomNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 group",
                    isActive 
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                      : item.name === "Admin Panel" 
                        ? "text-amber-500/80 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
                  )}
                >
                  <item.icon className={cn("h-4.5 w-4.5 transition-transform duration-300", isActive ? "text-indigo-400" : item.name === "Admin Panel" ? "text-amber-500/80 group-hover:scale-110" : "text-zinc-500 group-hover:scale-110")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[280px] max-w-[80vw] bg-zinc-950 border-l border-zinc-800/80 shadow-2xl z-50 md:hidden flex flex-col"
            >
              <div className="h-16 shrink-0 border-b border-zinc-800/60 px-4 flex items-center justify-between">
                <span className="font-black text-sm tracking-tight text-zinc-50">NotePilot Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-full h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-8 scrollbar-hide">
                <nav className="flex flex-col gap-1.5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 px-3">Main Menu</div>
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        prefetch={true}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                          isActive 
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                        )}
                      >
                        <item.icon className={cn("h-4.5 w-4.5", isActive ? "text-indigo-400" : "text-zinc-500")} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
                <nav className="flex flex-col gap-1.5 mt-auto pb-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 px-3">Preferences</div>
                  {bottomNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        prefetch={true}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                          isActive 
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                            : item.name === "Admin Panel" 
                              ? "text-amber-500/80 hover:text-amber-400 hover:bg-amber-500/10"
                              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                        )}
                      >
                        <item.icon className={cn("h-4.5 w-4.5", isActive ? "text-indigo-400" : item.name === "Admin Panel" ? "text-amber-500/80" : "text-zinc-500")} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full h-screen overflow-x-hidden bg-zinc-950">
        {/* Top Header */}
        <header className="h-16 md:h-20 shrink-0 border-b border-zinc-800/60 bg-zinc-950/80 md:bg-zinc-950/50 backdrop-blur-2xl sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between w-full min-w-0">
          <div className="flex items-center gap-4">
            {/* Mobile App Title */}
            <Link href="/" className="md:hidden flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-1.5 rounded-lg text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="font-black text-sm tracking-tight text-zinc-50">
                NotePilot
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <NotificationBell />

            <div className="h-8 w-px bg-zinc-800 hidden sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 outline-none cursor-pointer rounded-full p-1 hover:bg-zinc-800/50 transition-colors group">
                {user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt="Avatar" 
                    className="h-9 w-9 rounded-full border-2 border-zinc-800 group-hover:border-indigo-500/50 transition-colors"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border-2 border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                    {user?.firstName?.charAt(0).toUpperCase() || "S"}
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-950/90 backdrop-blur-xl border-zinc-800 text-zinc-300 w-64 rounded-2xl shadow-2xl p-2" align="end">
                <DropdownMenuLabel className="flex flex-col gap-1 p-3">
                  <span className="text-sm font-black text-white">{user?.fullName || "Student"}</span>
                  <span className="text-xs text-zinc-500 font-medium">{user?.primaryEmailAddress?.emailAddress}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800/60 my-1" />
                <DropdownMenuItem className="p-0">
                  <Link href="/dashboard/profile" className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-zinc-800/60 text-sm font-medium cursor-pointer rounded-xl transition-colors">
                    <User className="h-4.5 w-4.5 text-zinc-400" /> Profile & Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0">
                  <Link href="/dashboard/settings" className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-zinc-800/60 text-sm font-medium cursor-pointer rounded-xl transition-colors">
                    <Settings className="h-4.5 w-4.5 text-zinc-400" /> Preferences
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800/60 my-1" />
                <DropdownMenuItem className="p-0 group">
                  <SignOutButton>
                    <div className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer rounded-xl transition-colors">
                      <LogOut className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" /> Sign Out
                    </div>
                  </SignOutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Hamburger Menu Trigger */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-full h-9 w-9 border-2 border-zinc-800/50"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-10 sm:p-8 lg:p-10 relative w-full min-w-0">
          {/* Subtle background gradient for the main content area */}
          <div className="fixed top-0 left-1/4 w-1/2 h-1/2 bg-indigo-500/5 blur-[150px] pointer-events-none -z-10" />
          {children}
        </main>
      </div>

    </div>
  );
}
