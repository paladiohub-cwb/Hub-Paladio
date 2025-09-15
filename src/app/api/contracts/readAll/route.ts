import { NextResponse } from "next/server";
import { readDBCONTRATOS } from "@/lib/db";
import { Contrato } from "@/interface/contracts";

function agruparContratos(contratos: Contrato[]) {
  const grouped: Record<string, any> = {};

  for (const contrato of contratos) {
    const id = contrato.contrato.toString();

    if (!grouped[id]) {
      // Cria o objeto agrupado pela primeira vez, guardando os detalhes originais
      grouped[id] = {
        contrato: contrato.contrato,
        cliente: contrato.nomeDoCliente,
        vendedor: contrato.vendedor,
        parcela: contrato.parcela,
        credito: contrato.creditoAtualizado,
        total: 0,
        categorias: {} as Record<string, number>,
        // Adiciona uma nova propriedade com os dados originais
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
  const contratos: Contrato[] = readDBCONTRATOS();
  const agrupados = agruparContratos(contratos);
  return NextResponse.json(agrupados);
}
