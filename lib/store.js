// Simple in-memory store for demo
let currentUser = null;
let users = {};

export const auth = {
  signUp: (name, email, password) => {
    if (users[email]) return { error: "Email already exists" };
    const user = {
      id: Date.now().toString(),
      name, email, password,
      clinic: "Emirates Fertility Centre",
      protocol: "Antagonist",
      phase: "stimulation",
      stimDay: 7,
      follicles: 11,
      e2: 1840,
      onboarded: false,
    };
    users[email] = user;
    currentUser = user;
    if (typeof window !== "undefined") {
      localStorage.setItem("bloom_user", JSON.stringify(user));
    }
    return { data: user, error: null };
  },
  signIn: (email, password) => {
    const user = users[email];
    if (!user) return { error: "No account found. Please sign up." };
    if (user.password !== password) return { error: "Wrong email or password." };
    currentUser = user;
    if (typeof window !== "undefined") {
      localStorage.setItem("bloom_user", JSON.stringify(user));
    }
    return { data: user, error: null };
  },
  getUser: () => {
    if (currentUser) return currentUser;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bloom_user");
      if (saved) {
        currentUser = JSON.parse(saved);
        return currentUser;
      }
    }
    return null;
  },
  updateUser: (updates) => {
    if (!currentUser) return null;
    currentUser = { ...currentUser, ...updates };
    if (typeof window !== "undefined") {
      localStorage.setItem("bloom_user", JSON.stringify(currentUser));
    }
    return currentUser;
  },
  signOut: () => {
    currentUser = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("bloom_user");
    }
  },
};
