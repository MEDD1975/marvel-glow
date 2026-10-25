import { Logo } from "@/components/Logo";

export function ExpiredQrNotice() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f7faff] px-6 py-12">
      <section className="w-full max-w-[830px] rounded-[3.25rem] border-2 border-[#d8e5f4] bg-white px-8 py-20 text-center shadow-[0_20px_55px_rgba(24,55,95,0.06)] sm:px-16 sm:py-28" aria-labelledby="expired-qr-title">
        <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-[2.5rem] bg-[#eef5ff] text-[#087f76]">
          <Logo size="lg" className="scale-150 text-[#087f76]" />
        </div>
        <p className="mt-14 text-sm font-bold uppercase tracking-[0.25em] text-[#1765c0] sm:text-xl">Espace patient privé</p>
        <h1 id="expired-qr-title" className="mx-auto mt-8 max-w-xl text-balance text-5xl font-bold leading-tight text-[#0d1935] sm:text-6xl">
          Accédez à votre parcours via le QR code
        </h1>
        <p className="mx-auto mt-10 max-w-2xl text-pretty text-2xl leading-relaxed text-[#53647d] sm:text-3xl">
          Cet espace contient des informations transmises par votre professionnel de santé. Scannez le QR code remis lors de votre consultation pour y accéder.
        </p>
      </section>
    </main>
  );
}
