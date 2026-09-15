export type NotificationResponse = {
  id: number;
  title: string;
  body: string;
  read: boolean;
  onesignalId: string | null;
  createdAt: string | null;
};

export type CreateNotificationRequest = {
  title: string;
  body: string;
  sendPush: boolean;
};
