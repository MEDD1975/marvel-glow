import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, HeartPulse, ShieldCheck } from "lucide-react";
import { usePatient } from "@/components/patient/PatientProvider";
import { LoadingState, NoPathwayState, PageHeading, SafetyNotice } from "@/components/patient/PatientUi";

export const Route = createFileRoute("/patient/parcours")({
  component: PathwayPage,
});

function PathwayPage() {
  const { ready, guide } = usePatient();
  if (!ready) return <LoadingState />;
  if (!guide) return <NoPathwayState />;
  return (
    <div>
      <PageHeading back={{ to: "/patient", label: "Accueil" }} title="Comprendre mon parcours" description={`Voici les repères utiles pour avancer sereinement après votre prise en charge pour « ${guide.name} ».`} />

      <section className="mb-5 rounded-3xl border border-[#C9DCF3] bg-gradient-to-br from-[#EDF5FF] via-white to-[#F2FBF7] p-5 shadow-[0_10px_30px_rgba(31,78,121,0.06)]" aria-labelledby="pathway-value-title">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#DCEBFF] text-[#1769CF]" aria-hidden="true"><HeartPulse className="h-5 w-5" /></span>
          <div>
            <h2 id="pathway-value-title" className="text-lg font-bold tracking-tight text-[#101C33]">Un repère pour savoir quoi faire, quand et qui voir</h2>
            <p className="mt-2 text-sm leading-6 text-[#526176]">Votre professionnel vous a transmis ce parcours pour vous aider à comprendre la suite, suivre les bons conseils et réagir au bon moment.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="flex items-start gap-2 rounded-2xl bg-white/80 p-3 text-sm leading-5 text-[#33445D]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2F8A68]" aria-hidden="true" />Comprendre les étapes de votre récupération</div>
          <div className="flex items-start gap-2 rounded-2xl bg-white/80 p-3 text-sm leading-5 text-[#33445D]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1769CF]" aria-hidden="true" />Savoir quand demander un nouvel avis</div>
        </div>
      </section>

      <ol className="relative flex flex-col gap-5 border-l-2 border-[#D8E5F3] pl-6">
        {guide.careSteps.map((step, index) => (
          <li key={step.id} className="relative rounded-2xl border border-[#E1EAF3] bg-white p-4 shadow-[0_4px_14px_rgba(16,28,51,0.04)]">
            <span className="absolute -left-[39px] top-4 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#1769CF] text-xs font-bold text-white shadow-sm" aria-hidden="true">
              {index + 1}
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#1769CF]">Étape {index + 1}</p>
            <h2 className="mt-1 text-lg font-bold text-[#101C33]">{step.title}</h2>
            <p className="mt-2 text-base leading-7 text-[#526176]">{step.description}</p>
          </li>
        ))}
      </ol>
      <div className="mt-6">
        <SafetyNotice>Ce parcours vous donne des repères, mais votre professionnel reste la référence : il peut adapter les étapes selon votre examen, vos symptômes et votre évolution.</SafetyNotice>
      </div>
    </div>
  );
}
