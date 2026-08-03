import { auth } from "@clerk/nextjs/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MyUploadsClient from "@/app/dashboard/my-uploads/my-uploads-client";
import { FileUp, Sparkles } from "lucide-react";

export const metadata = {
  title: "My Uploads - College Notes",
  description: "Manage your uploaded study materials.",
};

export default async function MyUploadsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Use service-role client (Clerk auth already verified user above)
  const supabase = createServiceRoleSupabaseClient();
  
  // Fetch notes authored by current user, including related subject and branch names
  const { data: notes, error } = await supabase
    .from("notes")
    .select(`
      *,
      rejection_reason,
      subjects (
        name,
        branches (
          name
        )
      )
    `)
    .eq("author_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Fetch My Uploads Error]:", error);
  }

  const processedNotes = (notes || []).map((n: any) => {
    return {
      ...n,
    };
  });

  return (
    <div className="flex flex-col lg:gap-6 max-w-6xl mx-auto pb-12 w-full">
      <div className="flex flex-col gap-2 px-4 lg:px-0 pt-6 lg:pt-0 pb-4 lg:pb-0">
        {/* Desktop Header */}
        <h1 className="hidden lg:flex text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent items-center gap-2">
          My Uploads
          <Sparkles className="h-5 w-5 text-indigo-400" />
        </h1>
        <p className="hidden lg:block text-zinc-400 text-sm">
          Manage your contributed study materials, check their review status, and track engagement.
        </p>

        {/* Mobile Header */}
        <h1 className="flex lg:hidden text-2xl font-black tracking-tight text-white items-center gap-2">
          My Uploads <Sparkles className="h-5 w-5 text-indigo-400" />
        </h1>
        <p className="block lg:hidden text-zinc-400 text-sm font-medium">
          Track your shared materials.
        </p>
      </div>

      <div className="px-4 lg:px-0">
        <MyUploadsClient initialNotes={processedNotes} />
      </div>
    </div>
  );
}
