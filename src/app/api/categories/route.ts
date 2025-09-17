import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { randomUUID } from "crypto";
import { categoriesSchema } from "@/lib/schemas/categories";
import { CategoriesType } from "@/interface/categories";

const DB_NAME = "hub";
const COLLECTION = "categories";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = categoriesSchema.parse(body);

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<CategoriesType>(COLLECTION);

    // 1 - Criar categoria vazia
    const newCategory: CategoriesType = {
      id: randomUUID(),
      nome: parsed.nome,
      valorParaDistribuicao: parsed.valorParaDistribuicao,
      users: [], // ainda não populamos
    };

    await collection.insertOne(newCategory);

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
