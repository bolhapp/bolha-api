export type ActivityDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert"
  | "professional";

export interface BaseActivity {
  name: string;
  description: string;
  createdAt: Date;
  online: boolean;
  address: string;
  activityTypes: string[];
  participants: string[];
  maxParticipants: number;
  difficulty: ActivityDifficulty;
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
