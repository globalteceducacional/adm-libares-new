import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, saveToken } from "../../lib/auth";
import { login } from "../../services/authService";
import { Alert, Button, Card, Field, Input } from "../../shared/ui";

export function LoginPage() {
  const navigate = useNavigate();
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
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="w-full max-w-md"
      >
        <Card elevated padding="lg" className="space-y-5">
          <div className="space-y-2 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white">
              AL
            </div>
            <h1 className="text-2xl font-bold text-foreground">Entrar no painel</h1>
            <p className="text-sm text-muted">Use suas credenciais de administrador.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
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
        </Card>
      </motion.div>
    </div>
  );
}
