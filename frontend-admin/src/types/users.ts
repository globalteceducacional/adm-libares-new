export type UserResponse = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  userType: string;
  userImage?: string | null;
  status: string;
  acervoId?: number | null;
  acervoName?: string | null;
  /** Derivados do acervo (ADR 0006); null quando o leitor nao tem acervo. */
  schoolId?: number | null;
  schoolName?: string | null;
};

export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
  phone: string;
  userImage?: string;
  /** Opcional — pode vincular acervo/contrato depois da criacao. */
  acervoId?: number | null;
  status?: string;
};

export type UpdateUserProfileRequest = {
  name: string;
  email: string;
  phone: string;
};

export type UpdateUserStatusRequest = {
  status: string;
};

export type UpdateUserAcervoRequest = {
  /** null desvincula o leitor do acervo atual. */
  acervoId: number | null;
};
