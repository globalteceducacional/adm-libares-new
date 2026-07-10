import { motion } from "framer-motion";
import { BookOpen, ShieldCheck, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, saveToken } from "../../lib/auth";
import { useAuth } from "../../features/auth/AuthContext";
import { login } from "../../services/authService";
import { Alert, Button, Field, Input } from "../../shared/ui";

export function LoginPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [username, setUsername] = useState("teste.admin");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({ username, password });
      const token = typeof response.accessToken === "string" ? response.accessToken.trim() : "";
      if (!token) {
        throw new Error("Resposta de login invalida (sem accessToken).");
      }
      saveToken(token);
      if (!isAuthenticated()) {
        throw new Error("Token JWT invalido. Verifique a resposta do servidor.");
      }
      await refresh();
      navigate("/dashboard", { replace: true });
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Falha ao autenticar";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-violet-800 via-violet-700 to-indigo-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_40%)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium">
            <Sparkles size={14} />
            Painel Administrativo
          </div>
          <h1 className="mt-8 max-w-md text-4xl font-bold leading-tight">
            Gestao moderna do catalogo Libare Digital
          </h1>
          <p className="mt-4 max-w-lg text-sm text-indigo-100/90">
            Controle livros, autores, usuarios e moderacao em um unico lugar, com navegacao
            dinamica e experiencia responsiva.
          </p>
        </div>

        <div className="relative grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <BookOpen size={20} className="mb-2 text-violet-200" />
            <p className="text-sm font-semibold">Catalogo unificado</p>
            <p className="mt-1 text-xs text-indigo-100/80">Livros e autores com visao consolidada.</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <ShieldCheck size={20} className="mb-2 text-violet-200" />
            <p className="text-sm font-semibold">Acesso seguro</p>
            <p className="mt-1 text-xs text-indigo-100/80">Autenticacao JWT para administradores.</p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-background px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="w-full max-w-md space-y-6"
        >
          <div className="space-y-2 text-center lg:text-left">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-700 to-violet-500 text-sm font-bold text-white lg:mx-0">
              LD
            </div>
            <h2 className="text-2xl font-bold text-foreground">Entrar no painel</h2>
            <p className="text-sm text-muted">Use suas credenciais de administrador.</p>
          </div>

          <form className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-card" onSubmit={handleSubmit} noValidate>
            <Field label="Usuario" required>
              <Input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
              />
            </Field>

            <Field label="Senha" required>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>

            {error ? <Alert tone="danger">{error}</Alert> : null}

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </motion.div>
      </section>
    </div>
  );
}
