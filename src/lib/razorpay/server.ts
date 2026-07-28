import Razorpay from "razorpay";

export function getRazorpayClient() {
  if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
    throw new Error("Missing NEXT_PUBLIC_RAZORPAY_KEY_ID environment variable.");
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Missing RAZORPAY_KEY_SECRET environment variable.");
  }

  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}
