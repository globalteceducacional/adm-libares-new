export type UserResponse = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  userType: string;
  userImage?: string | null;
  status: string;
};

export type UpdateUserStatusRequest = {
  status: string;
};
