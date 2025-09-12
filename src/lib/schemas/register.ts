import { z } from "zod";

const CARGOS = ["CONSULTOR", "SUPERVISOR", "GESTOR"] as const;
type Cargo = (typeof CARGOS)[number];

export const registerSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "E-mail inválido" }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  cargo: z.enum(CARGOS, { message: "Cargo inválido" }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha inválida"),
});

export type LoginInput = z.infer<typeof loginSchema>;
