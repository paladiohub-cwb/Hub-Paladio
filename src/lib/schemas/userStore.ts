import { userStoreType } from "@/interface/userStore";
import { z } from "zod";

export const userStoreSchema = z.object({
  _id: z.string({ message: "Preencha todos os campos" }).optional(),
  storeId: z.string({ message: "Preencha todos os campos" }),
  userId: z.string({ message: "Preencha todos os campos" }),
  storeName: z.string({ message: "Preencha todos os campos" }),
  userName: z.string({ message: "Preencha todos os campos" }),
  cargo: z.string({ message: "Preencha todos os campos" }),
  dataEntrada: z.string({ message: "Preencha todos os campos" }),
});
