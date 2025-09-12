import { NextResponse } from "next/server";
import { addUser } from "@/lib/db";
import { registerSchema } from "@/lib/schemas/register";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    addUser(data);

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
