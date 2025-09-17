import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { StoreType } from "@/interface/store";

const DB_NAME = "hub";
const COLLECTION = "store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collectionStore = db.collection<StoreType>(COLLECTION);

    const store = await collectionStore.findOne({ id: id });

    if (!store) {
      return NextResponse.json(
        { error: "Loja não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(store);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
