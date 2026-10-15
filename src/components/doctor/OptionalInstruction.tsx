import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function OptionalInstruction({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(Boolean(value));
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-2xl border border-border bg-card shadow-sm">
      <CollapsibleTrigger className="flex min-h-12 w-full items-center justify-between gap-2 px-4 text-left text-sm font-semibold text-foreground sm:px-5">
        <span>
          Ajouter une consigne au patient <span className="font-normal text-muted-foreground">(facultatif)</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 sm:px-5">
        <label htmlFor="patient-instruction" className="sr-only">Consigne au patient</label>
        <textarea
          id="patient-instruction"
          rows={3}
          maxLength={300}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Exemple : reprise progressive de la marche"
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="mt-1 text-right text-xs tabular-nums text-muted-foreground">{value.length}/300</p>
      </CollapsibleContent>
    </Collapsible>
  );
}
