import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const DB_NAME = "hub";
const COLLECTION = "userStores";

// CREATE - vincular usuário a uma loja
export async function POST(req: Request) {
  try {
    const { usuarioId, storeId, cargo } = await req.json();

    if (!usuarioId || !storeId) {
      return NextResponse.json(
        { error: "usuarioId e storeId são obrigatórios" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const collectionUserStores = db.collection(COLLECTION);
    const collectionUsers = db.collection("users");
    const collectionStores = db.collection("store");

    // valida usuário
    const usuario = await collectionUsers.findOne({ id: usuarioId });
    if (!usuario) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // valida loja
    const store = await collectionStores.findOne({ id: storeId });
    if (!store) {
      return NextResponse.json(
        { error: "Loja não encontrada" },
        { status: 404 }
      );
    }

    // verifica se já existe o vínculo
    const existing = await collectionUserStores.findOne({ usuarioId, storeId });
    if (existing) {
      return NextResponse.json(
        { error: "Usuário já vinculado a esta loja" },
        { status: 400 }
      );
    }

    // cria vínculo
    await collectionUserStores.insertOne({
      usuarioId,
      storeId,
      userName: usuario.name,
      storeName: store.nome,
      cargo: cargo ?? "consultor",
      dataEntrada: new Date(),
    });

    return NextResponse.json({
      message: "Usuário vinculado à loja com sucesso",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// READ - listar vínculos (pode filtrar por usuarioId ou storeId)
export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);

    const result = await collection.find().toArray();

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - remover vínculo
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const usuarioId = searchParams.get("usuarioId");
    const storeId = searchParams.get("storeId");

    if (!usuarioId || !storeId) {
      return NextResponse.json(
        { error: "usuarioId e storeId são obrigatórios" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);

    const result = await collection.deleteOne({ usuarioId, storeId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Vínculo não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Vínculo removido com sucesso" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
