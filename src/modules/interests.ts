import type { ParameterizedContext } from "koa";

const INTERESTS = ["photography", "books", "travelling", "video games", "sports"];

const getValidInt = (int?: string, fallback: number = 0): number => {
  try {
    const p = Number(int);

    if (!isNaN(p) && p >= 0) {
      return p;
    }
  } catch (err) {
  } finally {
    return fallback;
  }
};

export const getAll = async (ctx: ParameterizedContext) => {
  const page = getValidInt(ctx.request?.query.page as string | undefined);
  const pageSize = getValidInt(ctx.request?.query.pageSize as string | undefined, 25);

  ctx.body = INTERESTS.slice(page, page === 0 ? pageSize : page * pageSize);
};
