import { z } from "zod";

const usersCategoriesSchema = z.object({
  id: z.string(),
  nome: z.string(),
  part: z.number(),
  tipo: z.string(),
});

export const categoriesSchema = z.object({
  id: z.string().optional(),
  nome: z.string({ message: "Nome obrigatório" }),
  valorParaDistribuicao: z.number(),
  users: z.array(usersCategoriesSchema).optional(),
});
