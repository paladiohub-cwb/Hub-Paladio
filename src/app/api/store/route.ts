import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { storeSchema } from "@/lib/schemas/store";

const DB_NAME = "hub";
const COLLECTION = "store";

// GET - listar todas as lojas
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collectionStore = db.collection(COLLECTION);

    const stores = await collectionStore.find({}).toArray();

    return NextResponse.json(stores);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - atualizar loja pelo id
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, nome } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });
    }

    // valida os dados (se houver nome novo)
    if (nome) {
      storeSchema.parse({ id, nome });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collectionStore = db.collection(COLLECTION);

    // verifica se já existe loja com esse nome
    if (nome) {
      const storeExisting = await collectionStore.findOne({ nome });
      if (storeExisting && storeExisting.id !== id) {
        return NextResponse.json(
          { error: "Nome da loja indisponível" },
          { status: 400 }
        );
      }
    }

    const result = await collectionStore.updateOne({ id }, { $set: { nome } });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Loja não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Loja atualizada com sucesso." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE - remover loja pelo id
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collectionStore = db.collection(COLLECTION);

    const result = await collectionStore.deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Loja não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Loja excluída com sucesso." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = storeSchema.parse(body);

    const client = await clientPromise;
    const db = client.db("hub");
    const collectionStore = db.collection("store");

    const storeExisting = await collectionStore.findOne({ nome: data.nome });

    console.log(storeExisting);
    if (storeExisting) {
      return NextResponse.json({ error: "Nome da loja indisponível" });
    }

    await collectionStore.insertOne({
      id: data.id ?? crypto.randomUUID(),
      nome: data.nome,
    });

    return NextResponse.json({
      message: "Loja cadastrada com sucesso.",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors.map((e: any) => e.message).join(", ") },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
