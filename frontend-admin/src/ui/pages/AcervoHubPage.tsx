import { ArrowLeft, BookOpen, Library, Pencil, Power, Trash2, Users } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { usePermission } from "../../features/auth/usePermission";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import { getQueryErrorMessage, useAcervoQuery } from "../../features/shared/api/queries";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { stripHtml } from "../../shared/lib/stripHtml";
import {
  Alert,
  Button,
  Card,
  ConfirmDialog,
  PageSkeleton,
  StatusBadge,
  TabPanel,
  Tabs,
  type BreadcrumbItem,
  type TabItem
} from "../../shared/ui";
import { AcervoBooksTab } from "../components/acervos/AcervoBooksTab";
import { AcervoFormModal } from "../components/acervos/AcervoFormModal";
import { AcervoReadersTab } from "../components/acervos/AcervoReadersTab";
import {
  ACERVO_HUB_DEFAULT_TAB,
  parseAcervoHubTab,
  parseAcervoIdParam,
  type AcervoHubTab
} from "../components/acervos/acervoRoutes";
import { useAcervoManager } from "../components/acervos/useAcervoManager";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";

const TABS_ID = "acervo-hub";

function buildHubBreadcrumbs(acervoName?: string): BreadcrumbItem[] {
  const base = buildBreadcrumbs("/acervos");
  const last = base[base.length - 1];
  return [
    ...base.slice(0, -1),
    { label: last.label, to: "/acervos" },
    { label: acervoName ?? "Acervo" }
  ];
}

function NotFoundState({ message }: { message: string }) {
  const navigate = useNavigate();
  return (
    <ListingPageShell
      breadcrumbs={buildHubBreadcrumbs()}
      hero={<PageHeroStrip icon={Library} title="Acervo nao encontrado" tone="warning" />}
    >
      <Card elevated padding="md">
        <Alert tone="warning">{message}</Alert>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate("/acervos")}>
            <ArrowLeft size={16} />
            Voltar para acervos
          </Button>
        </div>
      </Card>
    </ListingPageShell>
  );
}

export function AcervoHubPage() {
  const { acervoId: rawAcervoId } = useParams<{ acervoId: string }>();
  const acervoId = parseAcervoIdParam(rawAcervoId);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseAcervoHubTab(searchParams.get("tab"));

  const acervoQuery = useAcervoQuery(acervoId);
  const acervo = acervoQuery.data;
  const manager = useAcervoManager();

  const canUpdateAcervo = usePermission("acervos.update");
  const canDeleteAcervo = usePermission("acervos.delete");

  // Trocar de aba limpa busca/status da aba anterior (cada aba tem sua propria lista).
  function setTab(next: AcervoHubTab) {
    const params = new URLSearchParams();
    if (next !== ACERVO_HUB_DEFAULT_TAB) {
      params.set("tab", next);
    }
    setSearchParams(params, { replace: true });
  }

  const tabItems = useMemo<TabItem<AcervoHubTab>[]>(
    () => [
      { id: "livros", label: "Livros", icon: BookOpen, count: acervo?.bookCount },
      { id: "leitores", label: "Leitores", icon: Users, count: acervo?.userCount }
    ],
    [acervo?.bookCount, acervo?.userCount]
  );

  if (acervoId === null) {
    return <NotFoundState message="O endereco informado nao corresponde a um acervo valido." />;
  }

  if (acervoQuery.isLoading) {
    return (
      <ListingPageShell breadcrumbs={buildHubBreadcrumbs()} hero={<PageSkeleton />}>
        <PageSkeleton />
      </ListingPageShell>
    );
  }

  if (acervoQuery.isError || !acervo) {
    return (
      <NotFoundState
        message={getQueryErrorMessage(
          acervoQuery.error,
          "Acervo nao encontrado ou fora do seu contrato."
        )}
      />
    );
  }

  const name = decodeHtmlEntities(acervo.name);
  const description = stripHtml(acervo.description);
  const contractLabel = acervo.schoolName
    ? decodeHtmlEntities(acervo.schoolName)
    : acervo.schoolId
      ? `Contrato #${acervo.schoolId}`
      : "Sem contrato";
  const isActive = acervo.status === "1";

  const stats = [
    { label: "Livros", value: acervo.bookCount },
    { label: "Leitores", value: acervo.userCount },
    { label: "Contrato", value: contractLabel },
    { label: "Status", value: isActive ? "Ativo" : "Inativo", hint: `Acervo #${acervo.id}` }
  ];

  return (
    <ListingPageShell
      breadcrumbs={buildHubBreadcrumbs(name)}
      hero={
        <PageHeroStrip
          icon={Library}
          title={name}
          description={description || `Biblioteca digital do contrato ${contractLabel}.`}
          tone={isActive ? "success" : "warning"}
          actions={
            <>
              <StatusBadge active={isActive} />
              {canUpdateAcervo ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => manager.openEditForm(acervo)}
                  disabled={manager.saving}
                >
                  <Pencil size={14} />
                  Editar
                </Button>
              ) : null}
              {canUpdateAcervo && !isActive ? (
                <Button size="sm" onClick={() => manager.activate(acervo)} disabled={manager.saving}>
                  <Power size={14} />
                  Ativar
                </Button>
              ) : null}
              {canDeleteAcervo && isActive ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => manager.requestDeactivate(acervo.id)}
                  disabled={manager.saving}
                >
                  <Trash2 size={14} />
                  Desativar
                </Button>
              ) : null}
            </>
          }
        />
      }
      stats={<ListingMiniStats items={stats} />}
    >
      {manager.formError && !manager.formModalOpen ? (
        <Alert tone="danger" className="mb-3">
          {manager.formError}
        </Alert>
      ) : null}
      {!isActive ? (
        <Alert tone="warning" className="mb-3">
          Acervo inativo: os leitores vinculados nao veem o catalogo no app. Ative-o para liberar o acesso.
        </Alert>
      ) : null}

      <Tabs
        id={TABS_ID}
        items={tabItems}
        value={tab}
        onChange={setTab}
        ariaLabel="Secoes do acervo"
        className="mb-4"
      />

      <TabPanel id={TABS_ID} tabId={tab}>
        {tab === "livros" ? (
          <AcervoBooksTab key={`books-${acervo.id}`} acervo={acervo} />
        ) : (
          <AcervoReadersTab key={`readers-${acervo.id}`} acervo={acervo} />
        )}
      </TabPanel>

      <AcervoFormModal {...manager.formModalProps} />

      <ConfirmDialog
        open={manager.confirmDeactivateId !== null}
        title="Desativar acervo"
        description="Os leitores deste acervo deixarao de ver o catalogo no app ate que ele seja reativado. Deseja continuar?"
        confirmLabel="Desativar"
        loading={manager.saving}
        onConfirm={manager.confirmDeactivate}
        onCancel={manager.cancelDeactivate}
      />
    </ListingPageShell>
  );
}
