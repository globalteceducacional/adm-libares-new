import { useNavigate } from "react-router-dom";
import { ShieldOff } from "lucide-react";
import { Button } from "../../shared/ui";

export function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
      <ShieldOff size={56} className="text-danger" />
      <div>
        <p className="text-4xl font-display font-bold text-foreground">403</p>
        <p className="mt-2 text-lg font-semibold text-foreground">Acesso negado</p>
        <p className="mt-1 text-sm text-muted">Você não tem permissão para acessar esta página.</p>
      </div>
      <Button variant="secondary" onClick={() => navigate(-1)}>Voltar</Button>
    </div>
  );
}
