import { type Prisma, type PrismaClient } from "@prisma/client";

export const updatePayee = (
  id: string,
  payee: Prisma.PayeeUpdateInput,
  client: PrismaClient,
) => {
  return client.payee.update({ data: payee, where: { id } });
};

export const deletePayee = (id: string, client: PrismaClient) =>
  client.payee.delete({ where: { id } });

export const getPayees = (
  categoryId: string | undefined,
  client: PrismaClient,
) =>
  client.payee.findMany({
    include: { categories: true },
    where: categoryId
      ? { categories: { some: { id: categoryId } } }
      : undefined,
    orderBy: { name: "asc" },
  });

export const addPayee = (
  payee: Prisma.PayeeCreateInput,
  client: PrismaClient,
) => client.payee.create({ data: payee });

export const getMatchingPayee = (name: string, client: PrismaClient) => {
  return client.payee.findFirst({
    where: { name: { search: name.replaceAll(" ", "|") } },
    include: { categories: true },
  });
};

export const addPayeeAlias = (
  payeeId: string,
  alias: string,
  client: PrismaClient,
) =>
  client.payeeAlias.upsert({
    where: { alias },
    create: { payee: { connect: { id: payeeId } }, alias },
    update: { alias },
  });
