"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [status, setStatus] = useState("verifying"); // verifying, success, failed
  const [hasVerified, setHasVerified] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      return;
    }

    if (hasVerified) return;

    const verifyPayment = async () => {
      setHasVerified(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/payments/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ orderId }),
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          setStatus("success");
          setTimeout(() => {
            if (data.type === "booking" && data.seanceId) {
              router.push(`/reservations/${data.seanceId}/checkout/succes?bookingId=${data.bookingId}`);
            } else {
              router.push("/profil");
            }
          }, 3000);
        } else {
          setStatus("failed");
          setTimeout(() => {
            if (data.seanceId) {
              router.push(`/reservations/${data.seanceId}/checkout`);
            } else {
              router.push("/");
            }
          }, 3000);
        }
      } catch (error) {
        console.error("Payment verification failed", error);
        setStatus("failed");
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    };

    verifyPayment();
  }, [orderId, router, hasVerified]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <div className="text-center p-8 bg-zinc-900 rounded-xl shadow-xl max-w-md w-full border border-zinc-800">
        {status === "verifying" && (
          <div>
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold mb-2">Vérification du paiement de test...</h1>
            <p className="text-zinc-400">Veuillez ne pas fermer cette page.</p>
          </div>
        )}

        {status === "success" && (
          <div>
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Paiement validé !</h1>
            <p className="text-zinc-400">Votre réservation est confirmée. Redirection en cours...</p>
          </div>
        )}

        {status === "failed" && (
          <div>
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Paiement échoué</h1>
            <p className="text-zinc-400">La transaction n'a pas pu aboutir. Redirection vers la commande en cours...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="text-zinc-400">Chargement...</div>
      </div>
    }>
      <PaymentVerifyContent />
    </Suspense>
  );
}
