export type AcervoOptionResponse = {
  id: number;
  name: string;
};

export type AcervoResponse = {
  id: number;
  name: string;
  description?: string | null;
  status: string;
  bookCount: number;
  userCount: number;
  schoolId?: number | null;
  schoolName?: string | null;
};

/** PUT /acervos/{id}/books — ids de livros a vincular/desvincular (sem sobreposicao). */
export type SyncAcervoBooksRequest = {
  add: number[];
  remove: number[];
};

export type UpsertAcervoRequest = {
  name: string;
  description?: string;
  status: string;
  /** Contrato dono do acervo (obrigatorio na criacao se nao houver contrato no topo). */
  schoolId?: number | null;
};
