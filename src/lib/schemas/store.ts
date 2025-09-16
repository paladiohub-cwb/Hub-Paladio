import { z } from "zod";

export const storeSchema = z.object({
  id: z.string().uuid({ message: "ID deve ser um UUID válido." }).optional(),
  nome: z.string().min(1, "Nome deve ser obrigatório."),
});
