import { useEffect, useRef } from "react";
import SignaturePad from "signature_pad";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
  title: string;
}

function SignatureModal({
  isOpen,
  onClose,
  onSave,
  title,
}: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad>();

  useEffect(() => {
    if (!isOpen) {
      // Limpar a referência quando a modal fecha
      signaturePadRef.current = undefined;
      return;
    }

    const timeoutId = setTimeout(() => {
      initializeSignaturePad();
    }, 100);

    const resizeObserver = new ResizeObserver(() => {
      if (canvasRef.current && signaturePadRef.current) {
        const data = signaturePadRef.current.toData();
        initializeSignaturePad();
        if (data) {
          signaturePadRef.current.fromData(data);
        }
      }
    });

    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      if (signaturePadRef.current) {
        signaturePadRef.current.clear();
      }
    };
  }, [isOpen]);

  function initializeSignaturePad() {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    const context = canvas.getContext("2d");
    if (context) {
      context.scale(ratio, ratio);
    }

    // Sempre criar uma nova instância do SignaturePad
    signaturePadRef.current = new SignaturePad(canvas, {
      backgroundColor: "rgb(255, 255, 255)",
    });
  }

  function handleClear() {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  }

  function handleSave() {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      alert("Por favor, faça sua assinatura antes de salvar");
      return;
    }

    const dataUrl = signaturePadRef.current.toDataURL();
    onSave(dataUrl);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="w-full border rounded-lg overflow-hidden bg-white">
          <canvas ref={canvasRef} className="w-full h-64 touch-none" />
        </div>

        <div className="flex justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Use o mouse ou toque para assinar
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClear}>
              Limpar
            </Button>
            <Button onClick={handleSave}>Salvar Assinatura</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { SignatureModal };
