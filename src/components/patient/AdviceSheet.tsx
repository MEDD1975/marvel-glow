import { Link } from "@tanstack/react-router";
import { BookOpen, MessageCircleQuestion, Phone, Siren } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { emergencyNumbers } from "@/lib/patient-guides";
import { formatPhone, phoneHref } from "@/lib/typography";
import { usePatient } from "@/components/patient/PatientProvider";

export function AdviceSheet() {
  const { cabinetName, cabinetPhone } = usePatient();
  const cabinetHref = phoneHref(cabinetPhone);
  return (
    <Sheet>
      <SheetTrigger className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-base font-semibold text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <MessageCircleQuestion className="h-5 w-5 text-care" aria-hidden="true" />
        Demander un avis
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-w-2xl rounded-t-2xl pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <SheetHeader>
          <SheetTitle>Demander un avis</SheetTitle>
          <SheetDescription>Choisissez l&apos;option adaptée à votre situation.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-3 px-4">
          {cabinetHref ? (
            <a href={cabinetHref} className="flex min-h-14 items-center gap-3 rounded-xl border border-border p-3 hover:bg-accent">
              <Phone className="h-5 w-5 text-care" aria-hidden="true" />
              <span>
                <span className="block font-semibold text-foreground">{`Contacter ${cabinetName ?? "mon cabinet"}`}</span>
                <span className="block text-sm text-muted-foreground">{formatPhone(cabinetPhone)}</span>
              </span>
            </a>
          ) : null}
          <Link to="/patient/surveiller" className="flex min-h-14 items-center gap-3 rounded-xl border border-border p-3 hover:bg-accent">
            <BookOpen className="h-5 w-5 text-tone-orange-text" aria-hidden="true" />
            <span>
              <span className="block font-semibold text-foreground">Revoir les signes à surveiller</span>
              <span className="block text-sm text-muted-foreground">Savoir quand consulter rapidement</span>
            </span>
          </Link>
          <div className="rounded-xl border border-tone-red-border/40 bg-tone-red p-3 text-tone-red-text">
            <p className="flex items-center gap-2 font-semibold">
              <Siren className="h-5 w-5" aria-hidden="true" />
              En cas d&apos;urgence vitale
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {emergencyNumbers.map((item) => (
                <a
                  key={item.id}
                  href={`tel:${item.number}`}
                  className="flex min-h-12 flex-col items-center justify-center rounded-lg bg-card text-foreground"
                >
                  <span className="text-lg font-bold">{item.number}</span>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
