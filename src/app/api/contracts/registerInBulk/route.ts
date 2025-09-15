import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { createCONTRACTS } from "@/lib/db";

type SafeParseReturn<T> =
  | { success: true; data: T }
  | { success: false; error: ZodError<T> };

/**
 * Helpers para normalizar entradas vindas do XLSX:
 * - numeros no formato BR: "1.234,56", "1234.56", "R$ 1.234,56"
 * - porcentagens: "5%", "0.05", "5,00%"
 * - datas: "dd/MM/yyyy", "yyyy-mm-dd", número serial do Excel
 */

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (value == null) return NaN;
  let s = String(value).trim();
  // remove R$, spaces, any letters
  s = s.replace(/R\$|\$|\s/g, "");
  // keep digits, dots, commas, minus
  s = s.replace(/[^\d\-,.]/g, "");
  if (s === "") return NaN;

  // If both '.' and ',' present: assume '.' thousands, ',' decimals => remove dots, replace comma -> dot
  if (s.includes(".") && s.includes(",")) {
    s = s.replace(/\./g, "").replace(/,/g, ".");
  } else if (s.includes(",") && !s.includes(".")) {
    // only comma -> decimal separator
    s = s.replace(/,/g, ".");
  }
  const n = Number(s);
  return isNaN(n) ? NaN : n;
}

function toInt(value: unknown): number {
  const n = toNumber(value);
  return isNaN(n) ? NaN : Math.trunc(n);
}

function toPercentage(value: unknown): number {
  if (value == null) return NaN;
  const raw = String(value).trim();
  const hadPercent = raw.includes("%");
  // remove % then parse
  const cleaned = raw.replace("%", "");
  let n = toNumber(cleaned);
  if (isNaN(n)) return NaN;
  // heurística: se <= 1 pode ser fração (0.05 => 5%)
  if (!hadPercent && n > 0 && n <= 1) {
    n = n * 100;
  }
  // if had percent and value is like "0,05%" -> parsed 0.05 => treat as 0.05*100=5
  if (hadPercent && n <= 1) n = n * 100;
  return n;
}

function excelSerialToDate(serial: number): Date {
  // Excel serial to JS date; accounts for Excel's 1900 leap-year bug approximately
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return new Date(
    date_info.getFullYear(),
    date_info.getMonth(),
    date_info.getDate()
  );
}

function parseDateToISO(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "number") {
    // Excel serial?
    try {
      const d = excelSerialToDate(value);
      return d.toISOString().slice(0, 10);
    } catch {
      return null;
    }
  }
  const s = String(value).trim();
  // dd/MM/yyyy
  const ddmmyyyy = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/;
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (iso.test(s)) return s;
  const m = s.match(ddmmyyyy);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  }
  // try Date.parse (handles some formats)
  const parsed = Date.parse(s);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10);
  }
  return null;
}

/**
 * Zod schema com preprocess para aceitar entradas 'sujas' e converter
 */
const contratoSchema = z.object({
  Status: z.preprocess(
    (v) => (v == null ? "" : String(v).trim()),
    z.string().min(1, "Status é obrigatório")
  ),
  "Valor bruto": z.preprocess(
    (v) => toNumber(v),
    z.number().min(0, "Valor bruto deve ser >= 0")
  ),
  "% comissão": z.preprocess(
    (v) => toPercentage(v),
    z.number().min(0).max(100, "Comissão deve ser entre 0 e 100")
  ),
  "Nome ponto de venda": z.preprocess(
    (v) => (v == null ? "" : String(v).trim()),
    z.string().min(1, "Ponto de venda é obrigatório")
  ),
  Grupo: z.preprocess((v) => toInt(v), z.number().int()),
  Cota: z.preprocess((v) => toInt(v), z.number().int()),
  Segmento: z.preprocess(
    (v) => (v == null ? "" : String(v).trim()),
    z.string().min(1, "Segmento é obrigatório")
  ),
  Contrato: z.preprocess((v) => toInt(v), z.number().int()),
  "Crédito atualizado": z.preprocess(
    (v) => (v == null ? "" : String(v).trim()),
    z.string()
  ),
  Vendedor: z.preprocess((v) => toInt(v), z.number().int()),
  Equipe: z.preprocess((v) => toInt(v), z.number().int()),
  "Data da venda": z.preprocess(
    (v) => parseDateToISO(v),
    z.string().refine((s) => !isNaN(Date.parse(s)), {
      message: "Data da venda inválida",
    })
  ),
  Parcela: z.preprocess((v) => toInt(v), z.number().int()),
  "Nome do Cliente": z.preprocess(
    (v) => (v == null ? "" : String(v).trim()),
    z.string().min(1, "Nome do cliente é obrigatório")
  ),
  Categoria: z.preprocess(
    (v) => (v == null ? "" : String(v).trim()),
    z.string().min(1, "Categoria é obrigatória")
  ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body) {
      return NextResponse.json(
        { error: "Nenhum corpo enviado" },
        { status: 400 }
      );
    }

    const items = Array.isArray(body) ? body : [body];

    const failures: { index: number; errors: string[]; original: unknown }[] =
      [];
    let savedCount = 0;

    for (let i = 0; i < items.length; i++) {
      const raw = items[i];
      const parsed = contratoSchema.safeParse(raw);
      for (let i = 0; i < items.length; i++) {
        const raw = items[i];
        const parsed = contratoSchema.safeParse(raw);

        if (parsed.success) {
          // parsed.data já vem tipado e validado
          createCONTRACTS(parsed.data);
          savedCount++;
        } else {
          // formatar erros corretamente
          const zErrors = parsed.error.issues.map((e) => {
            const path = e.path.length ? e.path.join(".") : "item";
            return `${path}: ${e.message}`;
          });

          failures.push({ index: i, errors: zErrors, original: raw });
        }
      }
    }

    if (failures.length === 0) {
      return NextResponse.json(
        { message: "Todos contratos salvos", savedCount },
        { status: 201 }
      );
    } else if (savedCount > 0) {
      // Salvou alguns, mas houve falhas
      return NextResponse.json(
        {
          message: "Alguns contratos salvos, outros falharam",
          savedCount,
          failures,
        },
        { status: 207 }
      );
    } else {
      // Nenhum salvo
      return NextResponse.json(
        { message: "Nenhum contrato salvo", failures },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Erro interno" },
      { status: 500 }
    );
  }
}
