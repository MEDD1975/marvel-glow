import { useNavigate } from "@tanstack/react-router";

export function DoctorHome() {
  const navigate = useNavigate();

  return (
    <section className="flex justify-center px-4 py-6 md:px-8 md:py-10">
      <div className="w-full max-w-2xl rounded-[2rem] border border-care/20 bg-card px-6 py-10 text-center shadow-xl shadow-care/10 md:px-12 md:py-16">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-care/20 bg-care/10 p-5">
          <img src="/favicon.svg" alt="" className="h-full w-full" />
        </div>
        <p className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-care">Espace médecin</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-foreground md:text-7xl">Kivoir</h1>
        <p className="mx-auto mt-5 max-w-md text-pretty text-lg leading-8 text-muted-foreground md:text-xl">Préparez simplement les contenus et les ressources à partager avec vos patients.</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/cabinet/" })}
          className="mt-9 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Commencer
        </button>
      </div>
    </section>
  );
}
