import { db } from ".";
import { activityTypes, type SelectActivityType } from "./schemas/activityTypes.schema";

export const getActivityTypes = async (
  page: number,
  pageSize: number,
): Promise<SelectActivityType[]> => {
  return await db
    .select({ id: activityTypes.id })
    .from(activityTypes)
    .offset(page * pageSize)
    .limit(pageSize);
};
