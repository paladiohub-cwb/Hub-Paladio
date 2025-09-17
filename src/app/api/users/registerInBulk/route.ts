import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { registerInBulkSchema, registerSchema } from "@/lib/schemas/register";
import { storeSchema } from "@/lib/schemas/store";
import { userStoreSchema } from "@/lib/schemas/userStore";
import { v4 as uuidv4 } from "uuid";
import { StoreType } from "@/interface/store";

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
    const storeCollection = db.collection<StoreType>("store");
    const userStoreCollection = db.collection("userStore");

    const results: any[] = [];
    const failures: any[] = [];

    for (const [index, raw] of data.entries()) {
      try {
        // --- 1. Criar ou validar store ---

        const parsedStore = storeSchema.parse({ nome: raw.loja });

        let store = await storeCollection.findOne({ nome: parsedStore.nome });
        let storeId: string;

        if (store) {
          storeId = store.id || store._id.toString();
        } else {
          storeId = uuidv4();
          await storeCollection.insertOne({ ...parsedStore, id: storeId });
        }

        // --- 2. Preparar objeto stores para o bulk schema ---
        const userStoreData = {
          storeName: parsedStore.nome,
          idStore: storeId,
          userId: "",
          userName: "",
          cargo: raw.cargo,
          cod: raw.cod || 0,
          codSupervisor: raw.codSupervisor,
        };

        // --- 3. Criar ou validar usuário ---
        const tempUser = {
          nome: raw.nome,
          email: raw.email,
          ativo: raw.ativo === "Sim",
          password: "123456",
          cargo: raw.cargo,
          comissao: raw.comissao,
          stores: [userStoreData],
        };

        // Valida tudo junto usando registerInBulkSchema
        const parsedUser = registerInBulkSchema.parse(tempUser);

        // Preencher IDs
        const existingUser = await usersCollection.findOne({
          email: parsedUser.email,
        });
        const userId = existingUser?._id?.toString() || uuidv4();

        // Atualiza userStore com IDs corretos
        const parsedUserStore: any = {
          ...parsedUser.stores[0],
          userId,
          userName: parsedUser.nome,
        };

        // --- 4. Salvar usuário ---
        if (!existingUser) {
          await usersCollection.insertOne({ ...parsedUser, id: userId });
        }

        // --- 5. Criar userStore ---
        await userStoreCollection.insertOne(parsedUserStore);

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
