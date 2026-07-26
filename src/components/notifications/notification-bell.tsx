"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getUnreadNotificationCount } from "@/app/actions/notifications";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = async () => {
    const res = await getUnreadNotificationCount();
    if (res.success && "data" in res && typeof res.data === "number") {
      setUnreadCount(res.data);
    }
  };

  useEffect(() => {
    fetchCount();
    
    // Poll every 30 seconds for new notifications
    const interval = setInterval(() => {
      fetchCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Link href="/dashboard/notifications" className="relative flex items-center justify-center group">
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-zinc-400 group-hover:text-zinc-100 group-hover:bg-zinc-800/60 rounded-full transition-all duration-300"
      >
        <Bell className="h-[18px] w-[18px]" />
      </Button>
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute top-1 right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-indigo-500 text-[9px] font-black text-white border-2 border-zinc-950 leading-none shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
