import { FormEvent, useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { useLocation } from "react-router-dom";
import { updateSettings } from "../../services/settingsService";
import { getQueryErrorMessage, useInvalidateAdminQueries, useSettingsQuery } from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import { usePermission } from "../../features/auth/usePermission";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import { BerryFormPanel } from "../components/layout/BerryFormPanel";
import { useAdminMutation } from "../../hooks/useAdminMutation";
import { Alert, Button, Field, Input } from "../../shared/ui";
import type { SettingsResponse, UpdateSettingsRequest } from "../../types/settings";

function toForm(data: SettingsResponse): UpdateSettingsRequest {
  return {
    appName: data.appName,
    appLogo: data.appLogo,
    appEmail: data.appEmail,
    appVersion: data.appVersion,
    appAuthor: data.appAuthor,
    appContact: data.appContact,
    appWebsite: data.appWebsite,
    appDescription: data.appDescription,
    apiLatestLimit: data.apiLatestLimit,
    apiCatOrderBy: data.apiCatOrderBy,
    apiCatPostOrderBy: data.apiCatPostOrderBy,
    apiAuthorOrderBy: data.apiAuthorOrderBy,
    apiAuthorPostOrderBy: data.apiAuthorPostOrderBy,
    appPrivacyPolicy: data.appPrivacyPolicy,
    publisherId: data.publisherId,
    onesignalAppId: data.onesignalAppId,
    onesignalRestKey: "",
    interstitalAdId: data.interstitalAdId,
    interstitalAdIdStatus: data.interstitalAdIdStatus,
    bannerAdId: data.bannerAdId,
    bannerAdIdStatus: data.bannerAdIdStatus
  };
}

export function SettingsPage() {
  const location = useLocation();
  const query = useSettingsQuery();
  const invalidate = useInvalidateAdminQueries();
  const canUpdate = usePermission("settings.update");
  const [form, setForm] = useState<UpdateSettingsRequest>({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (query.data) {
      setForm(toForm(query.data));
    }
  }, [query.data]);

  const saveMutation = useAdminMutation<SettingsResponse, UpdateSettingsRequest>({
    mutationFn: updateSettings,
    successMessage: "Definições salvas com sucesso.",
    errorFallback: "Falha ao salvar definições",
    toastError: false,
    invalidate: () => invalidate.settings(),
    onError: (error) => setFormError(error.message)
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    saveMutation.mutate(form);
  }

  const listingError = query.error
    ? getQueryErrorMessage(query.error, "Falha ao carregar definições")
    : undefined;

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={Settings}
          title="Definições do app"
          description="tbl_settings: nome, privacidade, OneSignal e anúncios do leitor."
        />
      }
    >
      {listingError ? <Alert>{listingError}</Alert> : null}
      <BerryFormPanel title="Aplicativo leitor" description="Campos usados em app_details e privacyPolicy.php.">
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          {formError ? <Alert className="md:col-span-2">{formError}</Alert> : null}
          <Field label="Nome do app">
            <Input value={form.appName ?? ""} onChange={(e) => setForm({ ...form, appName: e.target.value })} disabled={!canUpdate} />
          </Field>
          <Field label="E-mail">
            <Input value={form.appEmail ?? ""} onChange={(e) => setForm({ ...form, appEmail: e.target.value })} disabled={!canUpdate} />
          </Field>
          <Field label="Versão">
            <Input value={form.appVersion ?? ""} onChange={(e) => setForm({ ...form, appVersion: e.target.value })} disabled={!canUpdate} />
          </Field>
          <Field label="Autor">
            <Input value={form.appAuthor ?? ""} onChange={(e) => setForm({ ...form, appAuthor: e.target.value })} disabled={!canUpdate} />
          </Field>
          <Field label="Contato">
            <Input value={form.appContact ?? ""} onChange={(e) => setForm({ ...form, appContact: e.target.value })} disabled={!canUpdate} />
          </Field>
          <Field label="Website">
            <Input value={form.appWebsite ?? ""} onChange={(e) => setForm({ ...form, appWebsite: e.target.value })} disabled={!canUpdate} />
          </Field>
          <Field label="Limite latest API">
            <Input
              type="number"
              value={form.apiLatestLimit ?? 10}
              onChange={(e) => setForm({ ...form, apiLatestLimit: Number(e.target.value) })}
              disabled={!canUpdate}
            />
          </Field>
          <Field label="OneSignal App ID">
            <Input value={form.onesignalAppId ?? ""} onChange={(e) => setForm({ ...form, onesignalAppId: e.target.value })} disabled={!canUpdate} />
          </Field>
          <Field label="OneSignal REST key" hint={query.data?.hasOnesignalRestKey ? "Já cadastrada. Deixe vazio para manter." : "Ainda não cadastrada."}>
            <Input
              type="password"
              autoComplete="new-password"
              value={form.onesignalRestKey ?? ""}
              onChange={(e) => setForm({ ...form, onesignalRestKey: e.target.value })}
              disabled={!canUpdate}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Descrição">
            <textarea
              className="min-h-20 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
              value={form.appDescription ?? ""}
              onChange={(e) => setForm({ ...form, appDescription: e.target.value })}
              disabled={!canUpdate}
            />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Política de privacidade (HTML)">
            <textarea
              className="min-h-40 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
              value={form.appPrivacyPolicy ?? ""}
              onChange={(e) => setForm({ ...form, appPrivacyPolicy: e.target.value })}
              disabled={!canUpdate}
            />
            </Field>
          </div>
          {canUpdate ? (
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={saveMutation.isPending || query.isLoading}>
                {saveMutation.isPending ? "Salvando..." : "Salvar definições"}
              </Button>
            </div>
          ) : null}
        </form>
      </BerryFormPanel>
    </ListingPageShell>
  );
}
