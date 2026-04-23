import { redirect } from "next/navigation";

import type { Profile } from "@/lib/types/app";
import { createClient } from "@/lib/supabase/server";

function isMissingSessionError(error: { name?: string; message?: string } | null) {
  return (
    error?.name === "AuthSessionMissingError" ||
    error?.message === "Auth session missing!"
  );
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (isMissingSessionError(error)) {
      return null;
    }

    throw new Error(error.message);
  }

  return user;
}

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    if (isMissingSessionError(userError)) {
      return null;
    }

    throw new Error(userError.message);
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, full_name, email, role, phone")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Profile | null;
}

export async function requireUser() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireProfile() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return profile;
}

export async function requireAdmin() {
  const profile = await requireProfile();

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  return profile;
}
