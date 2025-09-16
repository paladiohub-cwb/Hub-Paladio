import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Contrato } from "@/interface/contracts";

function agruparContratos(contratos: Contrato[]) {
  const grouped: Record<string, any> = {};

  for (const contrato of contratos) {
    const id = contrato.contrato.toString();

    if (!grouped[id]) {
      grouped[id] = {
        contrato: contrato.contrato,
        cliente: contrato.nomeDoCliente,
        vendedor: contrato.vendedor,
        parcela: contrato.parcela,
        credito: contrato.creditoAtualizado,
        total: 0,
        categorias: {} as Record<string, number>,
        detalhes: contrato,
      };
    }

    grouped[id].total += contrato.valorBruto;
    grouped[id].categorias[contrato.categoria] =
      (grouped[id].categorias[contrato.categoria] || 0) + contrato.valorBruto;
  }

  return Object.values(grouped);
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("hub"); // nome do banco
    const collection = db.collection<Contrato>("contratos");

    const contratos = await collection.find().toArray();
    const agrupados = agruparContratos(contratos);

    return NextResponse.json(agrupados);
  } catch (err: any) {
    console.error("❌ Erro no GET contratos:", err);
    return NextResponse.json(
      { error: err?.message ?? "Erro interno" },
      { status: 500 }
    );
  }
}
