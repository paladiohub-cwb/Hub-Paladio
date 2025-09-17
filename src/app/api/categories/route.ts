import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { randomUUID } from "crypto";
import { categoriesSchema } from "@/lib/schemas/categories";
import { CategoriesType } from "@/interface/categories";

const DB_NAME = "hub";
const COLLECTION = "categories";

//===================CRIAR UMA CATERGORIA ======================//

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = categoriesSchema.parse(body);

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<CategoriesType>(COLLECTION);

    const newCategory: CategoriesType = {
      id: randomUUID(),
      nome: parsed.nome,
      valorParaDistribuicao: parsed.valorParaDistribuicao,
      users: [],
    };

    await collection.insertOne(newCategory);

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

//===================LISTAR TODAS CATERGORIA ======================//
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<CategoriesType>(COLLECTION);

    const categories = await collection.find().toArray();

    return NextResponse.json(categories, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
