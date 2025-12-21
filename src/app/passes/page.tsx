"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { PassCard } from "@/components/pass-card";
import { useUser } from "@/lib/hooks/useUser";
import Link from "next/link";

type PassRecord = {
  id: string;
  name: string;
  mahe: boolean;
  eventId: string; 
};

type Profile = {
  full_name?: string | null;
  is_university_student?: boolean | null;
  email?: string | null;
};

export default function PassesPage() {
  const { user, loading: userLoading } = useUser();
  const [passes, setPasses] = useState<PassRecord[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user && !userLoading) {
      setLoading(false);
      return;
    }

    if (!user) return;

    async function loadData() {
      try {
        const supabase = createClient();
        
        const [profileResult, adminResult, passesResult] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
          supabase.from("admins").select("id").eq("id", user!.id).maybeSingle(),
          supabase.from("passes").select("id, name, mahe, eventId"),
        ]);

        // Handle Profile
        if (profileResult.error) throw profileResult.error;
        setProfile(profileResult.data as Profile | null);

        // Handle Admin
        if (adminResult.error && adminResult.error.code !== "PGRST116") {
          throw adminResult.error;
        }
        setIsAdmin(Boolean(adminResult.data));

        // Handle Passes
        console.log("PASSES : " , passesResult);
        
        if (passesResult.error) throw passesResult.error;
        setPasses((passesResult.data as PassRecord[]) || []);

      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load page data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, userLoading]);

  if (userLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-white" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
        <p className="text-lg text-gray-400">Please sign in to view passes.</p>
        <Link
          href="/login"
          className="rounded bg-white px-4 py-2 font-bold text-black hover:bg-gray-200"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <header className="sticky top-0 z-10 border-b border-gray-800 bg-black/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-500">Passes</h1>
          <form action="/api/auth/signout" method="post">
            <button className="text-sm font-medium text-gray-400 hover:text-white">
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <main className="px-6 py-8 mx-auto max-w-7xl">
        <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            Hello, {profile?.full_name ?? "Guest"}
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {profile?.is_university_student ? "🎓 Manipal Student" : "🌍 Guest User"}
          </p>
          <p className="mt-2 break-all text-xs text-gray-500">{user.email}</p>

          {isAdmin && (
            <Link
              href="/admin-dashboard"
              className="mt-4 inline-block rounded-lg border border-purple-600/50 bg-purple-600/20 px-4 py-2 text-sm font-bold text-purple-400 hover:bg-purple-600/30 transition"
            >
              Access Admin Panel →
            </Link>
          )}
        </div>

        <h3 className="mb-4 text-xl font-bold">Available Passes</h3>

        {error && (
          <div className="mb-8 rounded border border-red-500/50 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        {!error && passes.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center">
            <p className="text-gray-400">No passes found.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {passes.map((pass) => (
              <PassCard
                key={pass.id}
                name={pass.name}
                mahe={pass.mahe}
                eventId={pass.eventId}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}