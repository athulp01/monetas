import {
  type Prisma,
  type PrismaClient,
  type TRANSACTION_TYPE,
} from "@prisma/client";

export const getCategories = (type: TRANSACTION_TYPE, client: PrismaClient) =>
  client.category.findMany({
    where: type ? { type } : undefined,
    orderBy: { name: "asc" },
  });

export const addCategory = (
  category: Prisma.CategoryCreateInput,
  client: PrismaClient,
) => client.category.create({ data: category });

export const deleteCategory = (id: string, client: PrismaClient) =>
  client.category.delete({ where: { id } });
