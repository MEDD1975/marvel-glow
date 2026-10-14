import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeading } from "@/components/patient/PatientUi";
import { patientFaq } from "@/lib/patient-guides";

export const Route = createFileRoute("/patient/faq")({
  component: FaqPage,
});

function FaqPage() {
  return (
    <div>
      <PageHeading back={{ to: "/patient", label: "Accueil" }} title="Questions fréquentes" />
      <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-4">
        {patientFaq.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="min-h-12 text-left text-base">{item.question}</AccordionTrigger>
            <AccordionContent className="text-base leading-relaxed text-muted-foreground">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
