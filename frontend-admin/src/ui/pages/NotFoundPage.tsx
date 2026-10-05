import { useNavigate } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import { Button } from "../../shared/ui";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
      <FileQuestion size={56} className="text-muted" />
      <div>
        <p className="text-4xl font-display font-bold text-foreground">404</p>
        <p className="mt-2 text-lg font-semibold text-foreground">Página não encontrada</p>
        <p className="mt-1 text-sm text-muted">O endereço que você acessou não existe ou foi movido.</p>
      </div>
      <Button onClick={() => navigate("/")}>Voltar ao início</Button>
    </div>
  );
}
