import {
  parseDateToISO,
  toInt,
  toNumber,
  toPercentage,
  toDecimal,
} from "@/utils/contractsRegister";
import { z, ZodError } from "zod";

// Zod schema para validar os campos com nomes 'sujos'
export const rawContratoSchema = z.object({
  Status: z.preprocess(
    (v) => (v == null ? "" : String(v).trim()),
    z.string().min(1)
  ),
  "Valor bruto": z.preprocess((v) => toNumber(v), z.number().min(0)),
  "% comissão": z.preprocess((v) => toDecimal(v), z.number().min(0).max(100)),
  "Nome ponto de venda": z.preprocess(
    (v) => (v == null ? "" : String(v).trim()),
    z.string().min(1)
  ),
  Grupo: z.preprocess((v) => toInt(v), z.number().int()),
  Cota: z.preprocess((v) => toInt(v), z.number().int()),
  Segmento: z.preprocess(
    (v) => (v == null ? "" : String(v).trim()),
    z.string().min(1)
  ),
  Contrato: z.preprocess((v) => toInt(v), z.number().int()),
  "Crédito atualizado": z.preprocess(
    (v) => (v == null ? "" : String(v).trim()),
    z.string()
  ),
  Vendedor: z.preprocess((v) => toInt(v), z.number().int()),
  Equipe: z.preprocess((v) => toInt(v), z.number().int()),
  "Data da venda": z.preprocess((v) => parseDateToISO(v), z.string()),
  Parcela: z.preprocess((v) => toInt(v), z.number().int()),
  "Nome do Cliente": z.preprocess(
    (v) => (v == null ? "" : String(v).trim()),
    z.string().min(1)
  ),
  Categoria: z.preprocess(
    (v) => (v == null ? "" : String(v).trim()),
    z.string().min(1)
  ),
  aviso: z.string().optional(),
  doubleCheckValue: z.number(),
});

// Zod schema que faz o 'transform' para nomes limpos (camelCase)
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
  doubleCheckValue: data.doubleCheckValue,
}));
