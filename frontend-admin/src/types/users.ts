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
};

export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
  phone: string;
  userImage?: string;
  acervoId: number;
  status?: string;
};

export type UpdateUserStatusRequest = {
  status: string;
};

export type UpdateUserAcervoRequest = {
  acervoId: number;
};
