import { NextRequest, NextResponse } from "next/server";

import type { Contrato } from "@/interface/contracts";

import { contratoSchema } from "@/lib/schemas/contracts";

import { readDBCONTRATOS, writeCONTRATOS } from "@/lib/db";
import { convertStringInNumber } from "@/utils/convertStringInNumber";

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
    const newContratos: Contrato[] = [];
    const failures: { index: number; errors: string[]; original: unknown }[] =
      [];

    // Lê os contratos existentes uma única vez para checar duplicatas
    const existingContratos = readDBCONTRATOS();

    for (const [index, raw] of items.entries()) {
      const parsed = contratoSchema.safeParse(raw);

      if (parsed.success) {
        // --- INÍCIO DA NOVA TRATIVA ---
        const isDuplicate = existingContratos.some(
          (existing) =>
            existing.contrato === parsed.data.contrato &&
            existing.parcela === parsed.data.parcela
        );

        if (isDuplicate) {
          console.warn(
            `Tentativa de cadastrar duplicata: contrato ${parsed.data.contrato}, parcela ${parsed.data.parcela}.`
          );
          failures.push({
            index,
            errors: ["Contrato e Parcela já cadastrados."],
            original: raw,
          });
          continue; // Pula para a próxima iteração do loop
        }
        // --- FIM DA NOVA TRATIVA ---

        // Trativa existente para "Taxa Compartilhada"
        // if (
        //   parsed.data.status === "Taxa Compartilhada" &&
        //   parsed.data.comissao === 0
        // ) {
        //   console.warn(
        //     `Contrato de Taxa Compartilhada com comissão zero não será cadastrado ${parsed.data.contrato}.`
        //   );
        //   failures.push({
        //     index,
        //     errors: [
        //       "Contrato de Taxa Compartilhada com comissão zero não será cadastrado.",
        //     ],
        //     original: raw,
        //   });
        // }

        //PUXAAAAR DO BANCO COM UM FIND CONTRATO, E DEPOIS FAZER UM FILTER
        const parcelasExistentes = existingContratos
          .filter((c) => c.contrato === parsed.data.contrato)
          .map((c) => c.parcela);

        // Se não houver nenhuma parcela existente, consideramos a última como 0
        const ultimaParcela =
          parcelasExistentes.length > 0 ? Math.max(...parcelasExistentes) : 0;

        // Só gera aviso se houver pulo de parcela
        // if (parsed.data.parcela > ultimaParcela + 1) {
        //   parsed.data.aviso = `A última parcela deste contrato foi a parcela de número ${ultimaParcela}, pulando o cadastro neste lote para a parcela ${parsed.data.parcela}. Parcelas faltando.`;
        // }

        const creditoAtualizadoNumber = convertStringInNumber(
          parsed.data.creditoAtualizado
        );
        // const doubleCheckValue = creditoAtualizadoNumber * parsed.data.comissao;
        // parsed.data.doubleCheckValue = doubleCheckValue;
        newContratos.push(parsed.data);
        // FIM --- TRATATIVA TAXA COMPARTILHADA ---//
      } else {
        const zErrors = parsed.error.issues.map((e) => {
          const path = e.path.length ? e.path.join(".") : "item";
          return `${path}: ${e.message}`;
        });
        failures.push({ index, errors: zErrors, original: raw });
      }
    }

    if (newContratos.length > 0) {
      const updatedContratos: any = [...existingContratos, ...newContratos];
      writeCONTRATOS(updatedContratos);
    }

    if (failures.length === 0) {
      return NextResponse.json(
        { message: "Todos contratos salvos", savedCount: newContratos.length },
        { status: 201 }
      );
    } else if (newContratos.length > 0) {
      return NextResponse.json(
        {
          message: "Alguns contratos salvos, outros falharam",
          savedCount: newContratos.length,
          failures,
        },
        { status: 207 }
      );
    } else {
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
