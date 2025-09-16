import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { registerSchema } from "@/lib/schemas/register";
import { storeSchema } from "@/lib/schemas/store";
import { userStoreSchema } from "@/lib/schemas/userStore";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body) {
      return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
    }

    // garante que sempre seja um array
    const data = Array.isArray(body) ? body : [body];

    const client = await clientPromise;
    const db = client.db("hub");

    const usersCollection = db.collection("users");
    const storeCollection = db.collection("store");
    const userStoreCollection = db.collection("userStore");

    const results: any[] = [];
    const failures: any[] = [];

    for (const [index, raw] of data.entries()) {
      try {
        // --- 1. Criar ou validar usuário ---
        const parsedUser = registerSchema.parse({
          nome: raw.nome,
          email: raw.email,
          cod: Number(raw.cod),
          codSupervisor: raw.cod_supervisor?.id,
          cargo: raw.cargo?.toUpperCase(),
          ativo: raw.ativo === "Sim",
          password: "123456", // senha default
        });

        const existingUser = await usersCollection.findOne({
          cod: parsedUser.cod,
        });

        let userId = existingUser?._id?.toString() || uuidv4();

        if (!existingUser) {
          await usersCollection.insertOne({ ...parsedUser, id: userId });
        }

        // --- 2. Criar ou validar store ---
        const parsedStore = storeSchema.parse({
          nome: raw.loja,
        });

        let store = await storeCollection.findOne({ nome: parsedStore.nome });
        let storeId = store?._id?.toString() || uuidv4();

        if (!store) {
          await storeCollection.insertOne({ ...parsedStore, id: storeId });
        }

        // --- 3. Criar relação userStore ---
        const parsedUserStore: any = userStoreSchema.parse({
          storeId,
          storeName: parsedStore.nome,
          userId,
          userName: parsedUser.nome,
          cargo: parsedUser.cargo,
          dataEntrada: new Date().toISOString(),
        });

        // verifica se já existe a relação usuário + loja
        const existingRelation = await userStoreCollection.findOne({
          userId,
          storeId,
        });

        if (!existingRelation) {
          await userStoreCollection.insertOne(parsedUserStore);
          results.push({ userId, storeId, created: true });
        } else {
          results.push({ userId, storeId, created: false });
        }

        results.push({ userId, storeId });
      } catch (err: any) {
        failures.push({ index, error: err.message, raw });
      }
    }

    return NextResponse.json({ results, failures });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
