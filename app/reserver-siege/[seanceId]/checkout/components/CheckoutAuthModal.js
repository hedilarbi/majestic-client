export default function CheckoutAuthModal({
  isOpen,
  authModalStep,
  isSubmitting,
  guestContact,
  guestFormError,
  onClose,
  onOpenLogin,
  onContinueAsGuest,
  onGuestFieldChange,
  onGuestSubmit,
  onBackToChoice,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0"
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-[#111820] p-6 shadow-2xl">
        {authModalStep === "choice" ? (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">
              Finaliser votre reservation
            </h3>
            <p className="text-sm text-white/65">
              Choisissez comment continuer pour confirmer vos billets.
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => onOpenLogin("login")}
                className="flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-accent hover:text-accent"
              >
                Se connecter
              </button>
              <button
                type="button"
                onClick={() => onOpenLogin("signup")}
                className="flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-accent hover:text-accent"
              >
                S&apos;inscrire
              </button>
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110"
              >
                Continuer sans compte
              </button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onGuestSubmit}>
            <h3 className="text-xl font-semibold text-white">
              Informations de contact
            </h3>
            <p className="text-sm text-white/65">
              Ces informations seront utilisees pour finaliser votre reservation.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                  Prenom
                </span>
                <input
                  name="firstName"
                  value={guestContact.firstName}
                  onChange={onGuestFieldChange}
                  className="h-11 rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/35 focus:border-accent focus:outline-none"
                  placeholder="Prenom"
                  autoComplete="given-name"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                  Nom
                </span>
                <input
                  name="lastName"
                  value={guestContact.lastName}
                  onChange={onGuestFieldChange}
                  className="h-11 rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/35 focus:border-accent focus:outline-none"
                  placeholder="Nom"
                  autoComplete="family-name"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                Email
              </span>
              <input
                name="email"
                type="email"
                value={guestContact.email}
                onChange={onGuestFieldChange}
                className="h-11 rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/35 focus:border-accent focus:outline-none"
                placeholder="email@exemple.com"
                autoComplete="email"
              />
            </label>

            {guestFormError ? (
              <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200">
                {guestFormError}
              </p>
            ) : null}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBackToChoice}
                className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-accent hover:text-accent"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isSubmitting
                    ? "cursor-not-allowed bg-white/10 text-white/35"
                    : "bg-accent text-black hover:brightness-110"
                }`}
              >
                {isSubmitting ? "Finalisation..." : "Confirmer"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
