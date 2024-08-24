export enum ActivityDifficulty {
  first_time,
  beginner,
  intermediate,
  advanced,
  professional,
  expert,
}

export interface BaseActivity {
  name: string;
  description: string;
  createdAt: Date;
  online: boolean;
  address: string;
  activityTypes: string[];
  participants: string[];
  maxParticipants: number;
  difficulty: number;
  date: Date;
  restrictions?: string;
  extraDetails?: string;
}

export interface Activity extends BaseActivity {
  id: string;
  updatedAt?: Date;
  pics?: string[];
}

export type ActivityRequestState = "pending" | "rejected" | "accepted";
