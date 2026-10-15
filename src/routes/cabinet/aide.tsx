import { createFileRoute } from "@tanstack/react-router";
import { DoctorHeader, DoctorPage } from "@/components/doctor/DoctorLayout";

export const Route = createFileRoute("/cabinet/aide")({
  head: () => ({ meta: [{ title: "Aide — Kivoir" }] }),
  component: HelpPage,
});

const faq = [
  { q: "Comment transmettre un parcours ?", a: "Dans « Transmettre un parcours », choisissez l’atteinte puis affichez le QR code en plein écran. Le patient le scanne avec l’appareil photo de son téléphone." },
  { q: "Le patient doit-il créer un compte ?", a: "Non. Le QR code ouvre directement son espace de conseils, sans inscription." },
  { q: "Puis-je ajouter mes propres documents ?", a: "Oui, dans « Mes ressources ». Chaque ressource est associée à un parcours et peut être masquée à tout moment." },
  { q: "Comment retirer un parcours de ma liste ?", a: "Dans « Mes parcours TMS », utilisez « Masquer ». Le parcours reste disponible et peut être proposé à nouveau." },
  { q: "Que voit le patient comme professionnels ?", a: "Les professionnels visibles de votre liste « Professionnels ». Les professionnels masqués ne lui sont pas présentés." },
];

function HelpPage() {
  return (
    <DoctorPage>
      <DoctorHeader title="Aide" description="Les réponses aux questions les plus fréquentes." />
      <div className="mt-6 flex max-w-3xl flex-col gap-2">
        {faq.map((item) => (
          <details key={item.q} className="group rounded-2xl border border-border bg-card px-4 shadow-sm">
            <summary className="flex min-h-12 cursor-pointer items-center font-semibold text-foreground">{item.q}</summary>
            <p className="pb-4 text-sm leading-6 text-muted-foreground">{item.a}</p>
          </details>
        ))}
        <p className="mt-4 text-sm text-muted-foreground">
          Une autre question ? Écrivez-nous à <a href="mailto:contact@kivoir.fr" className="font-medium text-care underline-offset-2 hover:underline">contact@kivoir.fr</a>.
        </p>
      </div>
    </DoctorPage>
  );
}
