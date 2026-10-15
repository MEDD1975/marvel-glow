import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Logo } from "@/components/Logo";

export function QRFullscreenModal({ open, onOpenChange, qr, pathwayName }: { open: boolean; onOpenChange: (open: boolean) => void; qr: string | null; pathwayName: string }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-dvh max-h-dvh w-screen max-w-none flex-col items-center justify-center gap-6 rounded-none border-0 bg-white p-6 sm:max-w-none">
        <Logo size="md" className="text-foreground" />
        <DialogTitle className="text-balance text-center text-2xl font-semibold text-foreground md:text-3xl">{pathwayName}</DialogTitle>
        {qr ? (
          <img src={qr} alt={`QR code du parcours ${pathwayName}`} className="aspect-square w-[min(80vw,60vh)] max-w-[520px]" />
        ) : null}
        <DialogDescription className="text-center text-lg text-foreground">Scannez ce QR code pour accéder à vos conseils.</DialogDescription>
        <button type="button" onClick={() => onOpenChange(false)} className="min-h-12 rounded-xl border border-border px-8 text-base font-semibold text-foreground hover:bg-muted">
          Fermer
        </button>
      </DialogContent>
    </Dialog>
  );
}
