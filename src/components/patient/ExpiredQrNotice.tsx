export function ExpiredQrNotice() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12">
      <section className="flex max-w-md flex-col gap-4 rounded-2xl border border-border bg-card p-8 text-center" aria-labelledby="expired-qr-title">
        <h1 id="expired-qr-title" className="text-balance text-xl font-semibold text-foreground">
          Ce QR code Kivoir n&apos;est plus valide
        </h1>
        <p className="text-pretty leading-relaxed text-muted-foreground">
          Votre cabinet a mis à jour ses QR codes. Demandez-lui le nouveau QR code Kivoir pour retrouver vos conseils et
          ressources.
        </p>
      </section>
    </main>
  );
}
