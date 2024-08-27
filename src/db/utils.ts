import { sql, eq, SQL, asc, desc } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";

import type { SortOrder } from "@/types/misc";

export const getFreeInputQuery = (query: string, fields: PgColumn[]): SQL[] => {
  const fuzzy = `%${query}%`;
  let num;

  return fields.reduce<SQL[]>((conditions, field) => {
    if (field.columnType === "PgInteger") {
      num = Number(query);

      if (!isNaN(num)) {
        conditions.push(eq(field, num));
      }
    } else {
      conditions.push(sql`unaccent(${field}) ilike unaccent(${fuzzy})`);
    }

    return conditions;
  }, []);
};

export const getFieldQuery = (
  fields: Array<{ field: PgColumn; value: string | number | boolean | undefined }>,
) => {
  const conds = fields.reduce<SQL[]>((conditions, { field, value }) => {
    if (value) {
      conditions.push(eq(field, value));
    }

    return conditions;
  }, []);

  return conds.length ? conds : null;
};

export const getOrder = (sortOrder: SortOrder) => (sortOrder === "asc" ? asc : desc);
