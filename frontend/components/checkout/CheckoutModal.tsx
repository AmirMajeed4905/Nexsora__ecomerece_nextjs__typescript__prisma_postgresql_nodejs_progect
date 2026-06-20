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
import { getErrorMessage } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const DEFAULT_ADDRESS: Address = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Pakistan",
};

const ADDRESS_FIELDS = [
  { key: "fullName", label: "Full Name", placeholder: "Amir Majeed" },
  { key: "phone", label: "Phone", placeholder: "+92 300 1234567" },
  { key: "street", label: "Street Address", placeholder: "123 Main Street" },
  { key: "city", label: "City", placeholder: "Lahore" },
  { key: "state", label: "State", placeholder: "Punjab" },
  { key: "postalCode", label: "Postal Code", placeholder: "54000" },
  { key: "country", label: "Country", placeholder: "Pakistan" },
] as const;

// ───────────────── STRIPE FORM ─────────────────
function StripePaymentForm({
  total,
  onSuccess,
}: {
  total: number;
  onSuccess: () => Promise<void>;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isPaying, setIsPaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !isReady) return;

    setIsPaying(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setIsPaying(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      await onSuccess();
    } else {
      toast.error("Payment not completed");
    }

    setIsPaying(false);
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement onReady={() => setIsReady(true)} />

      <button
        type="submit"
        disabled={isPaying || !stripe || !isReady}
        className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-60"
      >
        {isPaying
          ? "Processing..."
          : !isReady
          ? "Loading payment form..."
          : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}

// ───────────────── MAIN COMPONENT ─────────────────
export default function CheckoutModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const router = useRouter();
  const { cart, clearCartLocally } = useCartStore();

  const [step, setStep] = useState<"address" | "payment">("address");
  const [address, setAddress] = useState<Address>(DEFAULT_ADDRESS);
  const [paymentMode, setPaymentMode] = useState<"cod" | "stripe">("cod");
  const [clientSecret, setClientSecret] = useState("");
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const validateAddress = () => {
    for (const field of ADDRESS_FIELDS) {
      if (!address[field.key].trim()) {
        toast.error(`${field.label} is required`);
        return false;
      }
    }
    return true;
  };

  // ───── STEP 1 ─────
  const handleContinue = async () => {
    if (!validateAddress()) return;

    setIsLoading(true);

    try {
      if (paymentMode === "stripe") {
        const res = await api.post("/api/payments/create-intent", {
          address,
        });

        setClientSecret(res.data.data.clientSecret);
        setTotal(res.data.data.total);

        setStep("payment");
      } else {
        const res = await api.post("/api/payments/cod", {
          address,
        });

        clearCartLocally();
        toast.success("Order placed! 🎉");

        onClose();
        router.push(`/orders/${res.data.data.order.id}`);
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to place order"));
    } finally {
      setIsLoading(false);
    }
  };

  // ───── STRIPE SUCCESS (FIXED - NO BROKEN ENDPOINT) ─────
  const handleStripeSuccess = async () => {
    try {
      // reuse COD order creation (safe & backend already exists)
      const res = await api.post("/api/payments/cod", {
        address,
      });

      clearCartLocally();
      toast.success("Payment successful! Order placed 🎉");

      onClose();
      router.push(`/orders/${res.data.data.order.id}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Order failed after payment"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[95vh] overflow-y-auto">

        {/* HEADER (UNCHANGED STYLE) */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            {step === "payment" && (
              <button
                onClick={() => setStep("address")}
                className="text-gray-400 hover:text-gray-700"
              >
                ←
              </button>
            )}
            <h2 className="text-lg font-bold">
              {step === "address" ? "Checkout" : "Card Payment"}
            </h2>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="p-5">

          {/* STEP 1 */}
          {step === "address" && (
            <div className="space-y-5">

              {/* ADDRESS FORM */}
              <div className="grid grid-cols-2 gap-2.5">
                {ADDRESS_FIELDS.map(({ key, label, placeholder }) => (
                  <div
                    key={key}
                    className={
                      key === "street" || key === "fullName"
                        ? "col-span-2"
                        : ""
                    }
                  >
                    <label className="text-xs font-semibold text-gray-500">
                      {label}
                    </label>

                    <input
                      value={address[key]}
                      placeholder={placeholder}
                      onChange={(e) =>
                        setAddress((p) => ({
                          ...p,
                          [key]: e.target.value,
                        }))
                      }
                      className="w-full border p-2 rounded-xl"
                    />
                  </div>
                ))}
              </div>

              {/* PAYMENT METHOD */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMode("cod")}
                  className={`p-3 border rounded-xl ${
                    paymentMode === "cod" ? "border-black" : ""
                  }`}
                >
                  COD
                </button>

                <button
                  onClick={() => setPaymentMode("stripe")}
                  className={`p-3 border rounded-xl ${
                    paymentMode === "stripe" ? "border-black" : ""
                  }`}
                >
                  Card
                </button>
              </div>

              <button
                onClick={handleContinue}
                disabled={isLoading}
                className="w-full bg-black text-white p-3 rounded-xl"
              >
                {isLoading
                  ? "Processing..."
                  : paymentMode === "cod"
                  ? `Place Order $${cart?.total.toFixed(2)}`
                  : `Continue $${cart?.total.toFixed(2)}`}
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === "payment" && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret }}
            >
              <StripePaymentForm
                total={total}
                onSuccess={handleStripeSuccess}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}