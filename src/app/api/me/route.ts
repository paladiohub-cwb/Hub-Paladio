import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const user = (await cookies()).get("user");

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: user.value });
}
