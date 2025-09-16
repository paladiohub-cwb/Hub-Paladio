import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { registerSchema } from "@/lib/schemas/register";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const client = await clientPromise;
    const db = client.db("hub");
    const collection = db.collection("users");

    // verifica se já existe usuário
    const existing = await collection.findOne({ email: data.email });
    if (existing) {
      return NextResponse.json({ error: "Usuário já existe" }, { status: 400 });
    }

    // gera hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await collection.insertOne({
      ...data,
      password: hashedPassword,
    });

    return NextResponse.json({
      success: true,
      userId: result.insertedId,
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
