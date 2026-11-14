import { createFileRoute } from "@tanstack/react-router";
import { DoctorResourceRow } from "@/components/patient/PatientBlocks";
import {
  PatientProvider,
  useDoctorResources,
  usePatient,
} from "@/components/patient/PatientProvider";
import { LoadingState } from "@/components/patient/PatientUi";
import { ExpiredQrNotice } from "@/components/patient/ExpiredQrNotice";
import { Logo } from "@/components/Logo";
import { conditions } from "@/lib/conditions";
import { isExpiredLegacyQr, isExpiredSignedCabinetRef } from "@/lib/legacy-qr";

export const Route = createFileRoute("/parcours-kine")({
  head: () => ({
    meta: [
      { title: "Votre parcours kiné — Kivoir" },
      { name: "description", content: "Les contenus transmis par votre kinésithérapeute." },
    ],
  }),
  component: PublicKinePathwayPage,
});

function PublicKinePathwayPage() {
  const search = Route.useSearch() as {
    pathway?: string;
    ref?: string;
    items?: string;
    focus?: string;
  };
  const pathway = search.pathway?.trim();
  const ref = search.ref?.trim();
  const focus = search.focus?.trim().slice(0, 120);
  const expired = isExpiredLegacyQr(ref) || isExpiredSignedCabinetRef(ref);
  const resourceIds = (search.items ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0 && id.length <= 128)
    .slice(0, 100);

  if (expired) return <ExpiredQrNotice />;
  if (!pathway || !ref) return <InvalidKineQrNotice />;

  return (
    <PatientProvider search={{ pathway, ref }}>
      <KinePathwayContent pathway={pathway} focus={focus} resourceIds={resourceIds} />
    </PatientProvider>
  );
}

function InvalidKineQrNotice() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F4F8F6] px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-[#D7E7E1] bg-white p-7 text-center shadow-sm">
        <Logo size="sm" />
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Lien de parcours invalide</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Demandez à votre kinésithérapeute de vous transmettre un nouveau QR code.
        </p>
      </section>
    </main>
  );
}

function KinePathwayContent({
  pathway,
  focus,
  resourceIds,
}: {
  pathway: string;
  focus?: string;
  resourceIds: string[];
}) {
  const { cabinetName } = usePatient();
  const resources = useDoctorResources({ resourceIds });
  const condition = conditions.find((item) => item.id === pathway);
  const pathwayName = condition?.name ?? "Votre parcours de rééducation";

  return (
    <div className="min-h-dvh bg-[#F4F8F6]">
      <header className="border-b border-[#DCE8E2] bg-white">
        <div className="mx-auto flex min-h-16 max-w-3xl items-center justify-between gap-4 px-5 py-3">
          <Logo size="sm" />
          <span className="rounded-full bg-[#E8F4F0] px-3 py-1.5 text-xs font-semibold text-[#177E78]">
            Parcours kiné
          </span>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 pb-12">
        <section className="rounded-3xl bg-[#0E4A4A] p-6 text-white shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B8E3D5]">
            Transmis par votre kinésithérapeute
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {focus || pathwayName}
          </h1>
          {focus ? <p className="mt-2 text-sm text-[#D5E9E3]">Parcours : {pathwayName}</p> : null}
          {cabinetName ? <p className="mt-3 text-sm text-[#D5E9E3]">{cabinetName}</p> : null}
          <p className="mt-5 max-w-xl text-sm leading-6 text-[#E8F4F0]">
            Retrouvez ici les contenus choisis pour vous accompagner entre vos séances.
          </p>
        </section>

        <section aria-labelledby="kine-content-title" className="flex flex-col gap-4">
          <div>
            <h2 id="kine-content-title" className="text-xl font-bold text-slate-900">
              Vos contenus transmis
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Ces ressources complètent les consignes données pendant vos séances.
            </p>
          </div>
          {resources.isLoading ? (
            <LoadingState />
          ) : resources.isError ? (
            <p
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              Impossible de charger les contenus. Réessayez en scannant le QR code transmis par
              votre kinésithérapeute.
            </p>
          ) : resources.data?.length ? (
            <ul className="flex flex-col gap-3">
              {resources.data.map((resource) => (
                <li key={resource.id}>
                  <DoctorResourceRow resource={resource} sharedBy="votre kinésithérapeute" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-[#D7E7E1] bg-white p-4 text-sm leading-6 text-slate-600">
              Aucun contenu n’est disponible pour ce QR code. Demandez à votre kinésithérapeute de
              vérifier la sélection et de générer un nouveau code.
            </p>
          )}
          <p className="rounded-2xl border border-[#D7E7E1] bg-white p-4 text-sm leading-6 text-slate-600">
            Ces contenus ne remplacent pas les consignes de votre kinésithérapeute ni une
            consultation. En cas de doute ou d’aggravation, contactez votre professionnel de santé.
          </p>
        </section>
      </main>
    </div>
  );
}
