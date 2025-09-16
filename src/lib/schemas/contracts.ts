import { z } from "zod";
import {
  parseDateToISO,
  toInt,
  toNumber,
  toDecimal,
} from "@/utils/contractsRegister";

import { numberPreprocess } from "@/utils/contractsRegister";

export const rawContratoSchema = z.object({
  Status: z.preprocess(
    (v) => String(v ?? "").trim(),
    z.string().min(1, {
      message: "Status é obrigatório",
    })
  ),

  "Valor bruto": z.preprocess(
    numberPreprocess(toNumber),
    z.number().refine((n) => !Number.isNaN(n), {
      message: "Valor bruto deve ser um número válido",
    })
  ),

  "% comissão": z.preprocess(numberPreprocess(toDecimal), z.number()),

  "Nome ponto de venda": z.preprocess(
    (v) => String(v ?? "").trim(),
    z.string().min(1, { message: "Nome do ponto de venda é obrigatório" })
  ),

  Grupo: z.preprocess(
    numberPreprocess(toInt),
    z.number().refine((n) => !Number.isNaN(n) && Number.isInteger(n), {
      message: "Grupo deve ser um número inteiro",
    })
  ),

  Cota: z.preprocess(
    numberPreprocess(toInt),
    z.number().refine((n) => !Number.isNaN(n) && Number.isInteger(n), {
      message: "Cota deve ser um número inteiro",
    })
  ),

  Segmento: z.preprocess(
    (v) => String(v ?? "").trim(),
    z.string().min(1, { message: "Segmento é obrigatório" })
  ),

  Contrato: z.preprocess(
    numberPreprocess(toInt),
    z
      .number({
        error: "Deve ser apenas numeros inteiros",
      })
      .int()
  ),

  "Crédito atualizado": z.preprocess(
    (v) => String(v ?? "").trim(),
    z.string().min(1, { message: "Crédito atualizado é obrigatório" })
  ),

  Vendedor: z.preprocess(
    (v) => toInt(v),
    z
      .number({ error: "Deve ser apenas numeros inteiros" })
      .refine((n) => !Number.isNaN(n) && Number.isInteger(n), {
        message: "O campo 'Vendedor' deve conter apenas números inteiros",
      })
  ),

  Equipe: z.preprocess(
    (v) => toInt(v),
    z
      .number({ error: "Deve ser apenas numeros inteiros" })
      .refine((n) => !Number.isNaN(n) && Number.isInteger(n), {
        message: "O campo 'Equipe' deve conter apenas números inteiros",
      })
  ),

  "Data da venda": z.preprocess(
    (v) => parseDateToISO(v),
    z.string().refine((s) => !!s, { message: "Data da venda inválida" })
  ),

  Parcela: z.preprocess(
    numberPreprocess(toInt),
    z
      .number()
      .refine((n) => !Number.isNaN(n) && Number.isInteger(n) && n >= 0, {
        message: "Parcela deve ser um número inteiro não-negativo",
      })
  ),

  "Nome do Cliente": z.preprocess(
    (v) => String(v ?? "").trim(),
    z.string().min(1, { message: "Nome do Cliente é obrigatório" })
  ),

  Categoria: z.preprocess(
    (v) => String(v ?? "").trim(),
    z.string().min(1, { message: "Categoria é obrigatória" })
  ),

  aviso: z.string().optional(),
});

export const contratoSchema = rawContratoSchema.transform((data) => ({
  status: data.Status,
  valorBruto: data["Valor bruto"],
  comissao: data["% comissão"],
  nomePontoDeVenda: data["Nome ponto de venda"],
  grupo: data.Grupo,
  cota: data.Cota,
  segmento: data.Segmento,
  contrato: data.Contrato,
  creditoAtualizado: data["Crédito atualizado"],
  vendedor: data.Vendedor,
  equipe: data.Equipe,
  dataDaVenda: data["Data da venda"],
  parcela: data.Parcela,
  nomeDoCliente: data["Nome do Cliente"],
  categoria: data.Categoria,
  aviso: data.aviso,
}));
