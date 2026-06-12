export type AuditModuleSummaryRow = {
  moduleName: string;
  totalRows: number;
  activeRows: number;
  softDeletedRows: number;
};

export type AuditSoftDeleteRow = {
  moduleName: string;
  entityId: string;
  entityLabel: string | null;
  deletedBy: number | null;
  deletedAt: string | null;
};

export type AuditActorActivityRow = {
  actorId: number;
  totalChanges: number;
};

export type AuditConsistencyRow = {
  checkName: string;
  invalidCount: number;
};

export type AuditOverviewResponse = {
  ok: boolean;
  reason?: string | null;
  moduleSummary: AuditModuleSummaryRow[];
  recentSoftDeletes: AuditSoftDeleteRow[];
  actorActivity: AuditActorActivityRow[];
  softDeleteConsistency: AuditConsistencyRow[];
};
