import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { randomUUID } from "crypto";
import { categoriesSchema } from "@/lib/schemas/categories";
import { CategoriesType } from "@/interface/categories";

const DB_NAME = "hub";
const COLLECTION = "categories";

//===================LISTAR UMA CATERGORIA ======================//
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") as string;
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<CategoriesType>(COLLECTION);

    const category = await collection.findOne({ id });

    if (!category) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(category, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

//===================ATUALIZAR UMA CATEGORIA ======================//
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") as string;
    const body = await req.json();
    const parsed = categoriesSchema.partial().parse(body); // <- permite atualização parcial

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<CategoriesType>(COLLECTION);

    const result = await collection.findOneAndUpdate(
      { id: id },
      { $set: parsed },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

//===================EXCLUIR UMA CATERGORIA ======================//
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") as string;
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<CategoriesType>(COLLECTION);

    const result = await collection.deleteOne({ id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Categoria deletada com sucesso" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
