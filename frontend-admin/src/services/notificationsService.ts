import { apiRequest } from "../lib/api";
import type { CreateNotificationRequest, NotificationResponse } from "../types/notifications";

export function listNotifications(): Promise<NotificationResponse[]> {
  return apiRequest<NotificationResponse[]>("/api/v1/notifications");
}

export function getUnreadNotificationCount(): Promise<{ count: number }> {
  return apiRequest<{ count: number }>("/api/v1/notifications/unread-count");
}

export function markNotificationRead(id: number): Promise<void> {
  return apiRequest<void>(`/api/v1/notifications/${id}/read`, { method: "POST" });
}

export function markAllNotificationsRead(): Promise<void> {
  return apiRequest<void>("/api/v1/notifications/read-all", { method: "POST" });
}

export function createNotification(payload: CreateNotificationRequest): Promise<NotificationResponse> {
  return apiRequest<NotificationResponse>("/api/v1/notifications", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
