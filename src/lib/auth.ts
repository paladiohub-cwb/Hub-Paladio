"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getUserFromCookies() {
  const cookie = (await cookies()).get("user");

  if (!cookie) {
    redirect("/login");
  }

  // se você salvar só o nome no cookie:
  return cookie.value;

  // se quiser salvar JSON no cookie (ex.: { name, email, cargo })
  // return JSON.parse(cookie.value);
}

export async function logout() {
  (await cookies()).delete("user");
  redirect("/login");
}
