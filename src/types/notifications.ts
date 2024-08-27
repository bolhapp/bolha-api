export type NotificationType = "newRequest" | "requestRejected" | "requestAccepted";

export interface BaseNotification {
  userId: string;
  type: NotificationType;
  payload: Record<string, any>;
}

export interface Notification extends BaseNotification {
  id: string;
  read: boolean;
  createdAt: Date;
}

export interface UpdateNotificationPayload {
  id: string;
  read: boolean;
}
