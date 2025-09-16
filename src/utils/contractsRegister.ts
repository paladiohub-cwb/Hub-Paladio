/**
 * Helpers para normalizar entradas vindas de fontes 'sujas' (ex: XLSX)
 */
export function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (value == null) return NaN;
  let s = String(value).trim();
  s = s.replace(/R\$|\$|\s/g, "");
  s = s.replace(/[^\d\-,.]/g, "");
  if (s === "") return NaN;
  if (s.includes(".") && s.includes(",")) {
    s = s.replace(/\./g, "").replace(/,/g, ".");
  } else if (s.includes(",") && !s.includes(".")) {
    s = s.replace(/,/g, ".");
  }
  const n = Number(s);
  return isNaN(n) ? NaN : n;
}
export function toDecimal(value: unknown): number {
  if (value == null) return NaN;
  let s = String(value).trim();

  // Remove símbolos monetários ou espaços
  s = s.replace(/[R\$€\s]/g, "");

  const hadPercent = s.includes("%");
  s = s.replace("%", "").replace(",", ".");

  const n = Number(s);
  if (isNaN(n)) return NaN;

  // Se tinha % no valor, divide por 100
  return hadPercent ? n / 100 : n;
}

export function toInt(value: unknown): number {
  const n = toNumber(value);
  return isNaN(n) ? NaN : Math.trunc(n);
}

export function toPercentage(value: unknown): number {
  if (value == null) return NaN;
  const raw = String(value).trim();
  const hadPercent = raw.includes("%");
  const cleaned = raw.replace("%", "");
  let n = toNumber(cleaned);
  if (isNaN(n)) return NaN;
  if (!hadPercent && n > 0 && n <= 1) {
    n = n * 100;
  }
  if (hadPercent && n <= 1) n = n * 100;
  return n;
}

export function excelSerialToDate(serial: number): Date {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return new Date(
    date_info.getFullYear(),
    date_info.getMonth(),
    date_info.getDate()
  );
}

export function parseDateToISO(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "number") {
    try {
      const d = excelSerialToDate(value);
      return d.toISOString().slice(0, 10);
    } catch {
      return null;
    }
  }
  const s = String(value).trim();
  const ddmmyyyy = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/;
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (iso.test(s)) return s;
  const m = s.match(ddmmyyyy);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  }
  const parsed = Date.parse(s);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10);
  }
  return null;
}

/**
 * Helper: prepara um número usando sua função utilitária (toInt/toNumber/etc).
 * Se o util retornar algo não-numérico, devolve NaN — assim conseguimos detectar
 * depois com .refine(...) e devolver mensagem amigável.
 */

export const numberPreprocess =
  (fn: (v: unknown) => number) => (v: unknown) => {
    if (v === null || v === undefined || v === "") return undefined;
    try {
      const n = fn(v);
      return Number.isFinite(n) ? n : undefined;
    } catch {
      return undefined;
    }
  };

export function parseBrazilianCurrencyToNumber(input: unknown): number {
  if (typeof input === "number") return input;
  const s = String(input ?? "").trim();
  if (!s) return NaN;

  // Remove tudo que não seja dígito, vírgula, ponto ou sinal negativo
  // Em seguida remove os pontos (milhares) e converte a vírgula decimal para ponto
  const cleaned = s
    .replace(/[^\d,\-\.]/g, "") // tira "R$ ", espaços, letras, etc
    .replace(/\./g, "") // remove separador de milhar
    .replace(/,/g, "."); // vírgula decimal -> ponto

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}
