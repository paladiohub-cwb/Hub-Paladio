import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import {
  CategoriesType,
  userDistributionCategorie,
} from "@/interface/categories";

const DB_NAME = "hub";
const COLLECTION_CATEGORIES = "categories";
const COLLECTION_USERS = "users";
const COLLECTION_STORES = "store";

export async function POST(req: Request) {
  try {
    const { userId, storeId, part } = await req.json();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") as string;

    if (!userId && !storeId) {
      return NextResponse.json(
        { error: "É necessário enviar userId ou storeId" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const collectionCategories = db.collection<CategoriesType>(
      COLLECTION_CATEGORIES
    );

    // Verifica se a categoria existe
    const category = await collectionCategories.findOne({ id: id });
    if (!category) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    let record: any = null;
    let tipo: "user" | "store";

    if (userId) {
      record = await db
        .collection(COLLECTION_USERS)
        .findOne({ _id: new ObjectId(userId) });
      tipo = "user";
    } else {
      record = await db
        .collection(COLLECTION_STORES)
        .findOne({ _id: new ObjectId(storeId) });
      tipo = "store";
    }

    if (!record) {
      return NextResponse.json(
        { error: "Registro não encontrado" },
        { status: 404 }
      );
    }

    const newUser: userDistributionCategorie = {
      id: String(record._id),
      nome: record.nome ?? record.name ?? "Sem nome",
      part: part,
      tipo,
    };

    // Atualiza categoria adicionando o novo usuário/loja
    await collectionCategories.updateOne(
      { id: id },
      { $push: { users: newUser } }
    );

    return NextResponse.json({ id: id, user: newUser }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
