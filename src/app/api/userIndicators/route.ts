import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { randomUUID } from "crypto";

const DB_NAME = "hub";
const COLLECTION = "userIndicators";

// CREATE - registrar indicação
export async function POST(req: Request) {
  try {
    const { idUser, nameIndicator, emailIndicator, storeId } = await req.json();

    if (!idUser || !nameIndicator || !storeId) {
      return NextResponse.json(
        {
          error:
            "Campos obrigatórios: idUser, nameUser, nameIndicator, storeId, nameStore",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);
    const collectionUsers = db.collection("users");
    const collectionStore = db.collection("store");

    const user = await collectionUsers.findOne({ id: idUser });
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const store = await collectionStore.findOne({ id: storeId });
    if (!store) {
      return NextResponse.json(
        { error: "Loja não encontrada" },
        { status: 404 }
      );
    }
    const indicator = {
      id: randomUUID(),
      idUser,
      nameUser: user.nome,
      nameIndicator,
      emailIndicator: emailIndicator ?? null,
      storeId,
      nameStore: store.name,
      createdAt: new Date(),
    };

    await collection.insertOne(indicator);

    return NextResponse.json({
      message: "Indicação criada com sucesso",
      indicator,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// READ - listar indicações (com filtro opcional por usuário ou loja)
export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);
    const indicators = await collection.find().toArray();

    return NextResponse.json(indicators);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE - atualizar indicação
export async function PUT(req: Request) {
  try {
    const { id, nameIndicator, emailIndicator, storeId, nameStore } =
      await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID da indicação é obrigatório" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);

    const updateFields: any = {};
    if (nameIndicator) updateFields.nameIndicator = nameIndicator;
    if (emailIndicator !== undefined)
      updateFields.emailIndicator = emailIndicator;
    if (storeId) updateFields.storeId = storeId;
    if (nameStore) updateFields.nameStore = nameStore;

    const result = await collection.updateOne({ id }, { $set: updateFields });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Indicação não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Indicação atualizada com sucesso" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - remover indicação
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID da indicação é obrigatório" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);

    const result = await collection.deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Indicação não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Indicação removida com sucesso" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
