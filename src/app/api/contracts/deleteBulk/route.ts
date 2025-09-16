import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function DELETE() {
  try {
    const client = await clientPromise;
    const db = client.db("hub"); // nome do banco
    const collection = db.collection("contratos");

    // Deleta todos os documentos da coleção
    const result = await collection.deleteMany({});

    return NextResponse.json({
      message: `Foram deletados ${result.deletedCount} contratos.`,
    });
  } catch (err: any) {
    console.error("❌ Erro ao deletar contratos:", err);
    return NextResponse.json(
      { error: err?.message ?? "Erro interno" },
      { status: 500 }
    );
  }
}
