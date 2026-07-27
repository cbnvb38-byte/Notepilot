import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment details." },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new Error("Missing RAZORPAY_KEY_SECRET");
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // Calculate 30 days from now
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Update user profile to premium
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
      console.error("Failed to update profile to premium:", updateError);
      return NextResponse.json(
        { error: "Payment verified but failed to update profile. Please contact support." },
        { status: 500 }
      );
    }

    // Attempt to log the payment event if the table exists (ignore error if migration not applied)
    const amountInINR = Number(process.env.RAZORPAY_PREMIUM_AMOUNT_INR || 99);
    const amountInPaise = amountInINR * 100;
    await (supabase.from("payment_events" as any).insert({
      user_id: userId,
      provider: "razorpay",
      razorpay_order_id,
      razorpay_payment_id,
      amount: amountInPaise,
      currency: "INR",
      status: "captured",
    }) as any); // we ignore result because migration might not be run yet

    return NextResponse.json({ success: true, message: "Premium activated successfully." });
  } catch (error: any) {
    console.error("Verify Payment Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
