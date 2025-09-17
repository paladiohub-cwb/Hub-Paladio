import { z } from "zod";

const CARGOS = [
  "CONSULTOR",
  "GESTOR",
  "SUPERVISOR",
  "AUTORIZADO",
  "LICENCIADO",
  "INDICADOR",
] as const;

function normalizeCargo(cargo: string): string {
  const upper = cargo.toUpperCase();
  if (upper === "SUPERVISOR" || upper === "AUTORIZADO") return "GESTOR";
  if (upper === "LICENCIADO") return "CONSULTOR"; // exemplo
  return upper;
}

export const registerSchema = z.object({
  id: z.string().uuid({ message: "ID deve ser um UUID válido." }).optional(),

  nome: z.preprocess((val) => {
    if (typeof val !== "string") return ""; // força string vazia se undefined
    return val.toLowerCase().trim(); // lowercase + remove espaços extras
  }, z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" })),

  email: z.preprocess((val) => {
    if (typeof val !== "string") return "";
    return val.toLowerCase().replace(/\s/g, ""); // lowercase + remove espaços
  }, z.string().email({ message: "E-mail inválido" })),

  cod: z.number({ message: "Apenas números." }),
  codSupervisor: z.number({ message: "Apenas números." }).optional(),

  password: z
    .string()
    .min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),

  cargo: z
    .preprocess(
      (val) => (typeof val === "string" ? normalizeCargo(val) : val),
      z.enum(CARGOS, { message: "Cargo inválido" })
    )
    .default("CONSULTOR"),

  ativo: z.boolean().default(true).optional(),
  comissao: z.number({ message: "Apenas números" }).default(0.02).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha inválida"),
});

export type LoginInput = z.infer<typeof loginSchema>;

const storeUserSchema = z.object({
  _id: z.string().optional(),
  idUser: z.string().optional(),
  idStore: z.string().optional(),
  cod: z.number({ message: "Apenas números." }),
  cargo: z
    .preprocess(
      (val) => (typeof val === "string" ? normalizeCargo(val) : val),
      z.enum(CARGOS, { message: "Cargo inválido" })
    )
    .default("CONSULTOR"),
  storeName: z.string(),
  userName: z.string(),
  codSupervisor: z.number({ message: "Apenas números" }).optional(),
});

export const registerInBulkSchema = z.object({
  id: z.string().uuid({ message: "ID deve ser um UUID válido." }).optional(),
  nome: z.preprocess((val) => {
    if (typeof val !== "string") return "";
    return val.toLowerCase().trim();
  }, z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" })),

  email: z.preprocess((val) => {
    if (typeof val !== "string") return "";
    return val.toLowerCase().replace(/\s/g, "");
  }, z.string().email({ message: "E-mail inválido" })),

  password: z
    .string()
    .min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  cargo: z
    .preprocess(
      (val) => (typeof val === "string" ? normalizeCargo(val) : val),
      z.enum(CARGOS, { message: "Cargo inválido" })
    )
    .default("CONSULTOR"),
  ativo: z.boolean().default(true).optional(),
  comissao: z.number().default(0.02).optional(),
  stores: z.array(storeUserSchema).nonempty({
    message: "É necessário pelo menos uma loja.",
  }),
});
