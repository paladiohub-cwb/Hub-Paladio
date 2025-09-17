import { string, z } from "zod";

const usersCategoriesSchema = z.object({
  id: z.string(),
  nome: z.string(),
  part: z.number(),
});

export const categoriesSchema = z.object({
  id: z.string().optional,
  nome: z.string({ message: "Nome obrigatório" }),
  valorParaDistribuicao: z.number(),
  users: usersCategoriesSchema,
});
