import { getClient } from "./supabase";

// Passwords are passed only to Supabase Auth and never stored by Bloom.
export const auth = {
  async signUp(name, email, password) {
    const { data, error } = await getClient().auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data.session ? await auth.getUser() : null;
  },
  async signIn(email, password) {
    const { error } = await getClient().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error)
      throw new Error(
        "Unable to sign in. Check your details and email verification.",
      );
    return auth.getUser();
  },
  async getUser() {
    // Remove the old prototype's plaintext-password record. Never migrate it.
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("bloom_user");
      } catch {
        /* Browser storage may be disabled. */
      }
    }
    const {
      data: { session },
      error: sessionError,
    } = await getClient().auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) return null;
    const {
      data: { user },
      error,
    } = await getClient().auth.getUser();
    if (error) throw error;
    const { data: profile, error: profileError } = await getClient()
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profileError)
      throw new Error(
        "Unable to load your profile. Please retry; your records have not been changed.",
      );
    return { ...profile, email: user.email };
  },
  async updateUser(updates) {
    const user = await auth.getUser();
    if (!user) throw new Error("Please sign in again.");
    const { data, error } = await getClient()
      .from("profiles")
      .update({ name: updates.name?.trim() || user.name })
      .eq("id", user.id)
      .select()
      .single();
    if (error) throw new Error("Profile was not saved. Please try again.");
    return { ...data, email: user.email };
  },
  async recover(email) {
    const { error } = await getClient().auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/?recovery=1` },
    );
    if (error)
      throw new Error("Unable to request a reset right now. Please try again.");
  },
  async resetPassword(password) {
    const { error } = await getClient().auth.updateUser({ password });
    if (error)
      throw new Error(
        "This reset link may have expired. Request a new link and try again.",
      );
  },
  async signOut() {
    const { error } = await getClient().auth.signOut({ scope: "local" });
    if (error) throw new Error("Sign out failed. Please retry.");
  },
};
