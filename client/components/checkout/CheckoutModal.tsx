"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useCartStore } from "@/store/cartStore";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Address {
  fullName: string; phone: string; street: string;
  city: string; state: string; postalCode: string; country: string;
}

const DEFAULT_ADDRESS: Address = {
  fullName: "", phone: "", street: "",
  city: "", state: "", postalCode: "", country: "Pakistan",
};

const ADDRESS_FIELDS = [
  { key: "fullName",   label: "Full Name",     placeholder: "Amir Majeed" },
  { key: "phone",      label: "Phone",          placeholder: "+92 300 1234567" },
  { key: "street",     label: "Street Address", placeholder: "123 Main Street" },
  { key: "city",       label: "City",           placeholder: "Lahore" },
  { key: "state",      label: "State",          placeholder: "Punjab" },
  { key: "postalCode", label: "Postal Code",    placeholder: "54000" },
  { key: "country",    label: "Country",        placeholder: "Pakistan" },
] as const;

// ── Stripe Payment Form ────────────────────────────────────────
function StripePaymentForm({
  total,
  onSuccess,
}: {
  total: number;
  onSuccess: () => void;
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const [isPaying, setIsPaying] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsPaying(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/orders` },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setIsPaying(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={isPaying || !stripe}
        className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-60"
      >
        {isPaying ? "Processing..." : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function CheckoutModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { cart, clearCartLocally } = useCartStore();

  const [step,         setStep]         = useState<"address" | "payment">("address");
  const [address,      setAddress]      = useState<Address>(DEFAULT_ADDRESS);
  const [paymentMode,  setPaymentMode]  = useState<"cod" | "stripe">("cod");
  const [clientSecret, setClientSecret] = useState("");
  const [total,        setTotal]        = useState(0);
  const [isLoading,    setIsLoading]    = useState(false);

  const validateAddress = () => {
    for (const field of ADDRESS_FIELDS) {
      if (!address[field.key as keyof Address].trim()) {
        toast.error(`${field.label} is required`);
        return false;
      }
    }
    return true;
  };

  const handleContinue = async () => {
    if (!validateAddress()) return;
    setIsLoading(true);

    try {
      if (paymentMode === "stripe") {
        const res = await api.post("/api/payments/create-intent", { address });
        setClientSecret(res.data.data.clientSecret);
        setTotal(res.data.data.total);
        setStep("payment");
      } else {
        const res = await api.post("/api/payments/cod", { address });
        clearCartLocally(); // ✅ Clear cart immediately
        toast.success("Order placed! 🎉");
        onClose();
        router.push(`/orders/${res.data.data.order.id}`);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Called after Stripe payment success — clear cart here
  const handleStripeSuccess = () => {
    clearCartLocally();
    toast.success("Payment successful! Order placed 🎉");
    onClose();
    router.push("/orders");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            {step === "payment" && (
              <button onClick={() => setStep("address")} aria-label="Back" className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            <h2 className="text-lg font-bold text-gray-900">
              {step === "address" ? "Checkout" : "Card Payment"}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">

          {/* Step 1: Address */}
          {step === "address" && (
            <div className="space-y-5">

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-bold text-gray-700 mb-2">Order Summary</p>
                <div className="space-y-1">
                  {cart?.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-500 truncate flex-1 mr-2">{item.product.name} ×{item.quantity}</span>
                      <span className="font-semibold text-gray-900">${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>${cart?.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Address */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">Delivery Address</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {ADDRESS_FIELDS.map(({ key, label, placeholder }) => (
                    <div key={key} className={key === "street" || key === "fullName" ? "col-span-2" : ""}>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={address[key as keyof Address]}
                        onChange={(e) => setAddress((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">Payment Method</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { mode: "cod"    as const, icon: "💵", title: "Cash on Delivery", sub: "Pay when received" },
                    { mode: "stripe" as const, icon: "💳", title: "Card / Online",     sub: "Powered by Stripe" },
                  ].map(({ mode, icon, title, sub }) => (
                    <button key={mode} onClick={() => setPaymentMode(mode)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${paymentMode === mode ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <div className="text-xl mb-1">{icon}</div>
                      <p className="text-sm font-bold text-gray-900">{title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleContinue} disabled={isLoading}
                className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60">
                {isLoading ? "Processing..." : paymentMode === "cod"
                  ? `Place Order · $${cart?.total.toFixed(2)}`
                  : `Continue to Payment · $${cart?.total.toFixed(2)}`
                }
              </button>
            </div>
          )}

          {/* Step 2: Stripe */}
          {step === "payment" && clientSecret && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Total: <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
              </p>
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
                <StripePaymentForm total={total} onSuccess={handleStripeSuccess} />
              </Elements>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}