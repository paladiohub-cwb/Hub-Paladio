import { NextResponse } from "next/server";
import { getUser } from "@/lib/db";
import { cookies } from "next/headers";
import { loginSchema } from "@/lib/schemas/login";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const user = getUser(data.email, data.password);

    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    (await cookies()).set("user", user.name, { httpOnly: true });

    return NextResponse.json({ success: true });
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
