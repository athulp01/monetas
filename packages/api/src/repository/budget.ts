import { type Prisma, type PrismaClient } from "@prisma/client";
import moment from "moment";

export const getBudget = (month: Date, client: PrismaClient) => {
  const momentDate = moment(month);
  return client.budget.findMany({
    include: { category: true },
    where: { monthAndYear: momentDate.startOf("month").toISOString() },
  });
};

export const getBudgetByCategoryId = (
  month: Date,
  categoryId: string,
  client: PrismaClient,
) => {
  const momentDate = moment(month);
  return client.budget.findFirst({
    include: { category: true },
    where: {
      categoryId,
      monthAndYear: momentDate.startOf("month").toISOString(),
    },
  });
};

export const addBudget = (
  budget: Prisma.BudgetCreateInput,
  client: PrismaClient,
) => client.budget.create({ data: budget });

export const deleteBudget = (id: string, client: PrismaClient) =>
  client.budget.delete({ where: { id } });

export const updateBudget = (
  id: string,
  budget: Prisma.BudgetUpdateInput,
  client: PrismaClient,
) => client.budget.update({ data: budget, where: { id } });

export const updateBudgetSpent = (
  budgetId: string,
  spent: Prisma.BudgetUpdateInput["spent"],
  client: PrismaClient,
) => {
  return client.budget.update({
    data: { spent },
    where: {
      id: budgetId,
    },
  });
};
