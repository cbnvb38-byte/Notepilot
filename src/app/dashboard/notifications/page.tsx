"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle2, AlertCircle, Sparkles, BookOpen, Clock, MailOpen, Trash2, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  getCurrentUserNotifications, 
  markAllNotificationsAsRead, 
  markNotificationAsRead, 
  deleteNotification 
} from "@/app/actions/notifications";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await getCurrentUserNotifications();
      if (res.success && "data" in res && res.data) {
        setNotifications(res.data as NotificationItem[]);
      } else {
        toast.error("Failed to load notifications.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while loading notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      const res = await markAllNotificationsAsRead();
      if (res.success) {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        toast.success("All notifications marked as read");
      } else {
        toast.error("Failed to mark notifications as read");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNotificationClick = async (n: NotificationItem) => {
    // Optimistically mark as read locally
    if (!n.is_read) {
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item));
      await markNotificationAsRead(n.id);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // prevent triggering the click on the notification itself
    const previous = [...notifications];
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    try {
      const res = await deleteNotification(id);
      if (res.success) {
        toast.success("Notification deleted");
      } else {
        setNotifications(previous);
        toast.error("Failed to delete notification");
      }
    } catch (error) {
      setNotifications(previous);
      toast.error("An error occurred");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "note_approved":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "note_rejected":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case "new_comment":
        return <Sparkles className="h-4 w-4 text-amber-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-indigo-400" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    }).format(d);
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            Notifications
          </h1>
          <p className="text-zinc-400 text-sm">
            Stay updated with note reviews, achievements, and platform status.
          </p>
        </div>
        
        {notifications.some(n => !n.is_read) && (
          <Button 
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll || isLoading}
            variant="outline" 
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800/30 text-xs py-4 px-5 rounded-xl gap-2 font-semibold"
          >
            {isMarkingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailOpen className="h-4 w-4" />} 
            Mark as Read
          </Button>
        )}
      </div>

      <Card className="godmode-card bg-zinc-950/60 border-zinc-800/80 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none transform translate-x-1/3 -translate-y-1/2" />
        <CardHeader className="pb-4 border-b border-zinc-800/60 bg-zinc-900/40 relative z-10">
          <CardTitle className="text-sm font-bold text-zinc-200">Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-zinc-800/40 relative z-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
              <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
              <p className="text-sm font-bold tracking-wider uppercase">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-6 relative group">
              <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
              <div className="bg-zinc-950/80 p-5 rounded-full border border-zinc-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative z-10">
                <Bell className="h-10 w-10 text-zinc-600" />
              </div>
              <div className="flex flex-col gap-2 relative z-10">
                <h3 className="font-black text-2xl text-white">You're all caught up!</h3>
                <p className="text-zinc-400 max-w-sm mx-auto font-medium">
                  Updates about your notes, reviews, and Study Copilot will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => handleNotificationClick(n)}
                  className={`flex items-start gap-4 px-6 py-5 transition-all duration-300 group cursor-pointer border-l-2 ${
                    n.is_read 
                      ? "bg-transparent border-transparent hover:bg-zinc-900/40" 
                      : "bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500"
                  }`}
                >
                  <span className={`p-2.5 rounded-xl border mt-0.5 flex-shrink-0 transition-all ${
                    n.is_read ? "border-zinc-800/80 bg-zinc-900/50" : "border-indigo-500/30 bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                  }`}>
                    {getIcon(n.type)}
                  </span>
                  
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col min-w-0 flex-1">
                        <h4 className={`text-sm font-bold flex items-center gap-2 transition-colors ${n.is_read ? "text-zinc-400" : "text-zinc-100 group-hover:text-indigo-400"}`}>
                          <span className="truncate">{n.title}</span>
                          {!n.is_read && (
                            <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                          )}
                        </h4>
                        <p className={`text-xs leading-relaxed mt-1 break-words transition-colors ${n.is_read ? "text-zinc-500" : "text-zinc-400"}`}>
                          {n.message}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-[10px] text-zinc-500 font-bold tracking-wide uppercase flex items-center gap-1 whitespace-nowrap">
                          <Clock className="h-3 w-3" /> {formatDate(n.created_at)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDelete(e, n.id)}
                          className="h-8 w-8 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all rounded-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
