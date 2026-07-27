import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("Missing RAZORPAY_WEBHOOK_SECRET");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(bodyText)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(bodyText);

    // Only handle specific events
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment?.entity;
      const orderEntity = event.payload.order?.entity;
      
      // Try to get userId from payment notes or order notes
      const userId = paymentEntity?.notes?.clerk_user_id || orderEntity?.notes?.clerk_user_id;

      if (!userId) {
        console.warn("Webhook received but no clerk_user_id found in notes. Cannot update profile.");
        return NextResponse.json({ success: true, message: "No user attached to payment." });
      }

      const supabase = createAdminSupabaseClient();

      // Check if user is already premium
      const { data: profile } = await (supabase
        .from("profiles")
        .select("plan, premium_status")
        .eq("id", userId)
        .single() as any);

      // Only extend/activate if needed (in case the client verify-payment already did it)
      if (profile?.plan !== "premium" || profile?.premium_status !== "active") {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const { error: updateError } = await (supabase
          .from("profiles")
          .update({
            plan: "premium",
            premium_status: "active",
            premium_started_at: now.toISOString(),
            premium_expires_at: expiresAt,
          } as any)
          .eq("id", userId) as any);

        if (updateError) {
          console.error("Webhook failed to update profile:", updateError);
        }
      }

      // Record payment event safely
      const razorpay_payment_id = paymentEntity?.id;
      const razorpay_order_id = paymentEntity?.order_id || orderEntity?.id;
      const amount = paymentEntity?.amount || orderEntity?.amount;
      
      if (razorpay_payment_id) {
        await (supabase.from("payment_events" as any).insert({
          user_id: userId,
          provider: "razorpay",
          razorpay_order_id,
          razorpay_payment_id,
          amount: amount,
          currency: paymentEntity?.currency || "INR",
          status: "captured",
        }) as any);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
