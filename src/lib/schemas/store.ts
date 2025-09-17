import { z } from "zod";

export const storeSchema = z.object({
  id: z.string().uuid({ message: "ID deve ser um UUID válido." }).optional(),
  nome: z.string().min(1, "Nome deve ser obrigatório."),
  storeId: z.string().optional(),
  cnpj: z.string().optional(),
  codEquipe: z.number({ message: "Deve conter apenas números." }),
});
