import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { DoctorHeader, DoctorPage } from "@/components/doctor/DoctorLayout";
import { ErrorState, LoadingState, SaveStatus, type SaveState } from "@/components/doctor/states";
import { doctorKeys, sendJson, useDoctorCache, useDoctorNetwork } from "@/components/doctor/use-doctor-data";

export const Route = createFileRoute("/cabinet/mon-cabinet")({
  head: () => ({ meta: [{ title: "Mon cabinet — Kivoir" }] }),
  component: CabinetPage,
});

const field = "mt-1 min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function CabinetPage() {
  const { data: session } = authClient.useSession();
  const network = useDoctorNetwork();
  const cache = useDoctorCache();
  const [state, setState] = useState<SaveState>({ status: "idle" });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    if (!data["name"]?.trim() || !data["address"]?.trim()) return setState({ status: "error", message: "Le nom et l’adresse du cabinet sont obligatoires." });
    setState({ status: "saving" });
    try {
      await sendJson("/api/doctor-network", "PUT", data);
      await cache.invalidateQueries({ queryKey: doctorKeys.network });
      setState({ status: "saved", message: "Informations du cabinet enregistrées." });
    } catch (cause) {
      setState({ status: "error", message: cause instanceof Error ? cause.message : "L’enregistrement a échoué." });
    }
  };

  return (
    <DoctorPage>
      <DoctorHeader title="Mon cabinet" description="Ces informations accompagnent les parcours transmis à vos patients." />
      <div className="mt-6 max-w-2xl">
        {network.isPending ? (
          <LoadingState />
        ) : network.isError ? (
          <ErrorState message="Impossible de charger votre cabinet." onRetry={() => void network.refetch()} />
        ) : (
          <form key={network.data?.id ?? "new"} onSubmit={(event) => void submit(event)} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="rounded-xl bg-muted/60 px-4 py-3 text-sm">
              <p className="text-muted-foreground">Compte</p>
              <p className="font-medium text-foreground">{session?.user.name}</p>
              <p className="text-muted-foreground">{session?.user.email}</p>
            </div>
            <label className="text-sm font-medium">Nom du cabinet<input name="name" required defaultValue={network.data?.name ?? ""} autoComplete="organization" className={field} /></label>
            <label className="text-sm font-medium">Adresse complète<input name="address" required defaultValue={network.data?.address ?? ""} placeholder="12 rue de la Paix, 75002 Paris" autoComplete="street-address" className={field} /></label>
            <label className="text-sm font-medium">Téléphone <span className="font-normal text-muted-foreground">(facultatif)</span><input name="phone" type="tel" defaultValue={network.data?.phone ?? ""} autoComplete="tel" className={field} /></label>
            <SaveStatus state={state} />
            <div className="flex justify-end">
              <button type="submit" disabled={state.status === "saving"} className="min-h-11 rounded-xl bg-care px-5 text-sm font-semibold text-care-foreground disabled:opacity-60">Enregistrer</button>
            </div>
          </form>
        )}
      </div>
    </DoctorPage>
  );
}
