import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { registerSchema } from "@/lib/schemas/register";
import bcrypt from "bcryptjs";

const DB_NAME = "hub";
const COLLECTION = "users";

// CREATE - cadastrar usuário
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);

    const existing = await collection.findOne({ email: data.email });

    if (existing) {
      return NextResponse.json({ error: "Usuário já existe" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await collection.insertOne({
      id: data.id ?? crypto.randomUUID(),
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

// READ - listar todos os usuários
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);

    const users = await collection
      .find({}, { projection: { password: 0 } }) // não retorna senha
      .toArray();

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE - atualizar usuário pelo email (ou id, se preferir)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { email, password, ...rest } = body;

    if (!email) {
      return NextResponse.json(
        { error: "E-mail é obrigatório para atualização." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);

    const updateFields: any = { ...rest };

    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    const result = await collection.updateOne(
      { email },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Usuário atualizado com sucesso." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE - remover usuário pelo email
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "E-mail é obrigatório." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);

    const result = await collection.deleteOne({ email });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Usuário excluído com sucesso." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
