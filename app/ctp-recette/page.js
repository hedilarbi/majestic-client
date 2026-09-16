"use client";

import { useState } from "react";

const TEST_CASES = [
  {
    id: "ctp-01",
    title: "CTP-01 — Enregistrement commande valide",
    description: "POST register.do avec tous les paramètres obligatoires (amount=10000, currency=788).",
    expected: 'errorCode absent ou = "0" — orderId présent — formUrl commençant par https://test.clictopay.com',
    needsManualPayment: false,
  },
  {
    id: "ctp-02",
    title: "CTP-02 — Redirection page de paiement",
    description: "Crée une commande puis ouvre formUrl : vérifiez visuellement le montant, le nom du marchand et les champs carte.",
    expected: "Page de paiement ClicToPay affichée, montant et marchand corrects, champs carte visibles.",
    needsManualPayment: false,
    showOpenLink: true,
  },
  {
    id: "ctp-03",
    title: "CTP-03 — Paiement accepté (carte 4509..1119)",
    description: "Créez la commande, ouvrez formUrl, payez avec la carte de test ci-dessous, puis cliquez sur \"Vérifier le statut\".",
    expected: "orderStatus = 2, actionCode = 0, montant = 10000, PAN masqué visible.",
    needsManualPayment: true,
    showOpenLink: true,
  },
  {
    id: "ctp-04",
    title: "CTP-04 — Paiement refusé (carte 5104..1115)",
    description: "Créez la commande, ouvrez formUrl, payez avec la carte de test ci-dessous (refusée), puis cliquez sur \"Vérifier le statut\".",
    expected: "orderStatus ≠ 2, actionCode contient un code d'erreur.",
    needsManualPayment: true,
    showOpenLink: true,
  },
  {
    id: "ctp-05",
    title: "CTP-05 — Vérification statut sur returnUrl",
    description: "Crée une commande puis appelle immédiatement getOrderStatusExtended.do, sans paiement.",
    expected: "orderStatus ≠ 2 → commande reste en attente, pas de fausse validation.",
    needsManualPayment: false,
  },
  {
    id: "ctp-06",
    title: "CTP-06 — Paramètres manquants register.do",
    description: "Envoie register.do sans le champ 'amount'.",
    expected: "errorCode ≠ 0, message d'erreur descriptif, pas d'orderId généré.",
    needsManualPayment: false,
  },
  {
    id: "ctp-07",
    title: "CTP-07 — Doublon orderNumber",
    description: "Envoie deux fois register.do avec le même orderNumber.",
    expected: "Erreur sur la 2ème requête, pas de double enregistrement silencieux.",
    needsManualPayment: false,
  },
  {
    id: "ctp-08",
    title: "CTP-08 — orderId inexistant",
    description: "Appelle getOrderStatusExtended.do avec orderId = 00000000-0000-0000-0000-000000000000.",
    expected: "errorCode ≠ 0, pas de crash, gestion d'erreur propre.",
    needsManualPayment: false,
  },
];

function JsonBlock({ value }) {
  const text = JSON.stringify(value, null, 2);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative mt-3">
      <button
        onClick={copy}
        className="absolute top-2 right-2 text-xs bg-zinc-700 hover:bg-zinc-600 text-white px-2 py-1 rounded"
      >
        {copied ? "Copié !" : "Copier"}
      </button>
      <pre className="bg-black/60 border border-zinc-800 rounded-lg p-4 text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap">
        {text}
      </pre>
    </div>
  );
}

function TestCard({ testCase }) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [statusResult, setStatusResult] = useState(null);
  const [error, setError] = useState(null);

  const orderId =
    result?.response?.orderId ||
    result?.registerResponse?.orderId ||
    null;
  const formUrl =
    result?.response?.formUrl ||
    result?.registerResponse?.formUrl ||
    null;

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setStatusResult(null);
    try {
      const res = await fetch(`/api/ctp-tests/${testCase.id}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || `Erreur HTTP ${res.status}`);
      }
      setResult(data);
    } catch (e) {
      setError(e.message || "Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!orderId) return;
    setChecking(true);
    try {
      const res = await fetch("/api/ctp-tests/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json().catch(() => ({}));
      setStatusResult(data);
    } catch (e) {
      setError(e.message || "Erreur réseau.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-white">{testCase.title}</h2>
          <p className="text-zinc-400 text-sm mt-1">{testCase.description}</p>
          <p className="text-zinc-500 text-xs mt-2">
            <span className="text-zinc-400 font-medium">Résultat attendu : </span>
            {testCase.expected}
          </p>
        </div>
        <button
          onClick={runTest}
          disabled={loading}
          className="shrink-0 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          {loading ? "Exécution..." : "Exécuter"}
        </button>
      </div>

      {testCase.card && null}

      {result?.card && (
        <div className="mt-3 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg p-3">
          Carte de test à saisir manuellement : <strong>{result.card.number}</strong> — exp {result.card.expiry} — CVV {result.card.cvv}
        </div>
      )}

      {error && (
        <div className="mt-3 text-sm bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-3">
          {error}
        </div>
      )}

      {result && <JsonBlock value={result} />}

      {result && formUrl && (
        <div className="mt-3 flex flex-wrap gap-3 items-center">
          <a
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-2 rounded-lg"
          >
            Ouvrir la page de paiement ClicToPay ↗
          </a>
          {testCase.needsManualPayment && (
            <button
              onClick={checkStatus}
              disabled={checking}
              className="text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3 py-2 rounded-lg"
            >
              {checking ? "Vérification..." : "Vérifier le statut (après paiement manuel)"}
            </button>
          )}
        </div>
      )}

      {statusResult && (
        <div className="mt-3">
          <p className="text-zinc-400 text-xs mb-1">Réponse getOrderStatusExtended.do :</p>
          <JsonBlock value={statusResult} />
        </div>
      )}
    </div>
  );
}

export default function CtpRecettePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Cahier de recette ClicToPay — Cas de test</h1>
        <p className="text-zinc-400 text-sm mb-8">
          Exécutez chaque cas ci-dessous puis copiez la réponse JSON dans la colonne « Réponse ClicToPay »
          du cahier de recette. Pour CTP-02/03/04, effectuez le paiement manuellement sur la page ouverte,
          puis vérifiez le statut.
        </p>
        <div className="space-y-5">
          {TEST_CASES.map((tc) => (
            <TestCard key={tc.id} testCase={tc} />
          ))}
        </div>
      </div>
    </div>
  );
}
