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

export type UpsertAcervoRequest = {
  name: string;
  description?: string;
  status: string;
  /** Escola dona do acervo (obrigatoria na criacao se nao houver escola no topo). */
  schoolId?: number | null;
};
