"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import type { PlanType } from "@/types";

interface UserProfile {
  plan: PlanType;
  trialEndsAt: string | null;
  stripeCustomerId: string | null;
  nickname: string | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: UserProfile | null;
  isTrialExpired: boolean;
  signUp: (email: string, password: string, nickname?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/account");
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setUserProfile({
            plan: data.profile.plan ?? "free",
            trialEndsAt: data.profile.trial_ends_at ?? null,
            stripeCustomerId: data.profile.stripe_customer_id ?? null,
            nickname: data.profile.nickname ?? null,
          });
          return;
        }
      }
    } catch {
      // ignore
    }
    setUserProfile(null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // user が変わったら profile を取得
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setUserProfile(null);
    }
  }, [user, fetchProfile]);

  const isTrialExpired =
    userProfile?.plan === "free" &&
    userProfile.trialEndsAt !== null &&
    new Date(userProfile.trialEndsAt) < new Date();

  async function signUp(email: string, password: string, nickname?: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: nickname ? { data: { nickname } } : undefined,
    });
    return { error: error?.message ?? null };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUserProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        userProfile,
        isTrialExpired,
        signUp,
        signIn,
        signOut,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
