"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

interface RazorpayCheckoutButtonProps {
  isPremiumExpired: boolean;
  isPremiumActive: boolean;
  userId: string | null;
  userEmail?: string;
  userName?: string;
}

export function RazorpayCheckoutButton({
  isPremiumExpired,
  isPremiumActive,
  userId,
  userEmail,
  userName,
}: RazorpayCheckoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (isPremiumActive) {
    return (
      <button
        disabled
        className="w-full py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black uppercase tracking-widest text-xs cursor-default shadow-inner"
      >
        ✓ Current Plan: Premium
      </button>
    );
  }

  const handleCheckout = async () => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    try {
      setIsLoading(true);

      // 1. Create order
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        alert(orderData.error || "Failed to create order");
        setIsLoading(false);
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "NotePilot",
        description: "NotePilot Premium (30 Days)",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            
            if (verifyRes.ok) {
              alert("Premium activated successfully! Enjoy Godmode.");
              router.refresh();
            } else {
              alert(verifyData.error || "Payment verification failed.");
            }
          } catch (e) {
            alert("Verification error. If money was deducted, contact support.");
          }
        },
        prefill: {
          name: userName || "",
          email: userEmail || "",
        },
        theme: {
          color: "#4f46e5", // NotePilot purple
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Failed to start payment process.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Starting Payment..." : isPremiumExpired ? "Renew Premium — ₹99" : "Upgrade to Premium — ₹99"}
      </button>
    </>
  );
}
