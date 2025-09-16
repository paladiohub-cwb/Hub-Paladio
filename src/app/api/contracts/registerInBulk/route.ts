import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import type { Contrato } from "@/interface/contracts";
import { contratoSchema } from "@/lib/schemas/contracts";

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

    // conecta no banco
    const client = await clientPromise;
    const db = client.db("hub"); // nome do banco
    const collection = db.collection<Contrato>("contratos");

    // contratos já cadastrados
    const existingContratos = await collection.find().toArray();

    for (const [index, raw] of items.entries()) {
      const parsed = contratoSchema.safeParse(raw);

      if (parsed.success) {
        const isDuplicate = existingContratos.some(
          (existing) =>
            existing.contrato === parsed.data.contrato &&
            existing.parcela === parsed.data.parcela
        );

        if (isDuplicate) {
          failures.push({
            index,
            errors: ["Contrato e Parcela já cadastrados."],
            original: raw,
          });
          continue;
        }

        const parcelasExistentes = existingContratos
          .filter((c) => c.contrato === parsed.data.contrato)
          .map((c) => c.parcela);

        const ultimaParcela =
          parcelasExistentes.length > 0 ? Math.max(...parcelasExistentes) : 0;

        // exemplo: se quiser validar salto de parcela
        // if (parsed.data.parcela > ultimaParcela + 1) {
        //   parsed.data.aviso = `Última parcela deste contrato foi ${ultimaParcela}, você pulou para ${parsed.data.parcela}`;
        // }

        // parsed.data já vem pronto com creditoAtualizado como number
        newContratos.push(parsed.data);
      } else {
        const zErrors = parsed.error.issues.map((e) => {
          const path = e.path.length ? e.path.join(".") : "item";
          return `${path}: ${e.message}`;
        });
        failures.push({ index, errors: zErrors, original: raw });
      }
    }

    if (newContratos.length > 0) {
      await collection.insertMany(newContratos);
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
