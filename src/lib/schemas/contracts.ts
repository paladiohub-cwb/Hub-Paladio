import { z } from "zod";
import {
  parseDateToISO,
  toInt,
  toNumber,
  toDecimal,
} from "@/utils/contractsRegister";

import {
  numberPreprocess,
  parseBrazilianCurrencyToNumber,
} from "@/utils/contractsRegister";
import { convertStringInNumber } from "@/utils/convertStringInNumber";

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

  "% comissão": z.preprocess(
    numberPreprocess(toDecimal),
    z.number({ message: "Ultileze apenas números." })
  ),

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

  doubleCheck: z.number().optional(),
});

function areNumbersApproximatelyEqualByPrecision(
  value1: number,
  value2: number
) {
  const value1String = value1.toString();
  const decimalPart = value1String.split(".")[1];
  const precision = decimalPart ? decimalPart.length : 0;

  const scaledValue1 = value1 * 100;

  const roundedScaledValue1 = Number(scaledValue1.toFixed(precision));
  const roundedValue2 = Number(value2.toFixed(precision));

  return Math.abs(roundedScaledValue1 - roundedValue2) < 0.01;
}

export const contratoSchema = rawContratoSchema.transform((data) => {
  const creditoRaw = String(data["Crédito atualizado"]);
  const creditoAtualizadoNumber = parseBrazilianCurrencyToNumber(creditoRaw);
  const rawComissao = data["% comissão"];

  function matchDecimalPlaces(decimalNum: number, intNum: number): number {
    // Converte decimalNum para string
    const decimalStr = decimalNum.toString();

    // Conta quantas casas decimais existem
    const decimalPlaces = decimalStr.includes(".")
      ? decimalStr.split(".")[1].length
      : 0;

    // Se intNum tiver decimal, transforma em inteiro
    const intValue = Math.round(intNum);

    // Converte intValue para ter o mesmo número de casas decimais
    const converted = Number(intValue.toFixed(decimalPlaces));

    return converted;
  }

  const comissaoNormalized =
    typeof rawComissao === "number" && Number.isFinite(rawComissao)
      ? rawComissao > 1
        ? rawComissao / 100
        : rawComissao
      : 0;

  const doubleCheck = Number(
    (creditoAtualizadoNumber * comissaoNormalized).toFixed(2)
  );

  const double = matchDecimalPlaces(
    Number(data["Valor bruto"].toFixed(2)),
    doubleCheck
  );
  return {
    status: data.Status,
    valorBruto: Number(data["Valor bruto"].toFixed(2)),
    comissao: comissaoNormalized,
    nomePontoDeVenda: data["Nome ponto de venda"],
    grupo: data.Grupo,
    cota: data.Cota,
    segmento: data.Segmento,
    contrato: data.Contrato,
    creditoAtualizado: Number(creditoAtualizadoNumber.toFixed(2)),
    vendedor: data.Vendedor,
    equipe: data.Equipe,
    dataDaVenda: data["Data da venda"],
    parcela: data.Parcela,
    nomeDoCliente: data["Nome do Cliente"],
    categoria: data.Categoria,
    aviso: data.aviso,
    doubleCheck: double,
    alerta: areNumbersApproximatelyEqualByPrecision(
      Number(data["Valor bruto"]),
      double
    ),
  };
});
