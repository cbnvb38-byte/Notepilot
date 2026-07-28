import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getRazorpayClient } from "@/lib/razorpay/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify existing profile
    const supabase = createAdminSupabaseClient();
    const { data: profile, error } = await (supabase
      .from("profiles")
      .select("plan, premium_status")
      .eq("id", userId)
      .single() as any);

    if (error && error.code !== "PGRST116") {
      console.error("Supabase profile error:", error);
      return NextResponse.json({ error: "Failed to fetch user profile." }, { status: 500 });
    }

    // If user is already premium, do not create an order
    if (profile?.plan === "premium" && profile?.premium_status === "active") {
      return NextResponse.json(
        { error: "Already Premium. You do not need to upgrade again." },
        { status: 400 }
      );
    }

    // Amount is configured in INR (e.g., 99), but Razorpay requires paise internally.
    const amountInINR = Number(process.env.RAZORPAY_PREMIUM_AMOUNT_INR || 99);
    const amount = amountInINR * 100;
    const currency = "INR";

    // Create Razorpay Order
    const orderOptions = {
      amount,
      currency,
      receipt: `rcpt_${userId.substring(0, 10)}_${Date.now()}`,
      notes: {
        clerk_user_id: userId,
        product: "notepilot_premium",
      },
    };

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create(orderOptions);

    if (!order || !order.id) {
      throw new Error("Failed to create Razorpay order.");
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("Razorpay Create Order Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
