import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({
  client: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));
vi.mock("../lib/supabase", () => ({ getClient: () => mock.client }));
import { auth } from "../lib/store";
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});
describe("Supabase authentication adapter", () => {
  it("restores a verified user and database profile, removing legacy plaintext data", async () => {
    localStorage.setItem(
      "bloom_user",
      JSON.stringify({ password: "synthetic-old-password" }),
    );
    mock.client.auth.getSession.mockResolvedValue({
      data: { session: { access_token: "synthetic-token" } },
    });
    mock.client.auth.getUser.mockResolvedValue({
      data: { user: { id: "a", email: "a@example.invalid" } },
    });
    const single = vi
      .fn()
      .mockResolvedValue({ data: { id: "a", name: "Synthetic A" } });
    const eq = vi.fn(() => ({ single }));
    mock.client.from.mockReturnValue({ select: () => ({ eq }) });
    expect(await auth.getUser()).toEqual({
      id: "a",
      name: "Synthetic A",
      email: "a@example.invalid",
    });
    expect(eq).toHaveBeenCalledWith("id", "a");
    expect(localStorage.getItem("bloom_user")).toBeNull();
  });
  it("does not authenticate a signup until email verification produces a session", async () => {
    mock.client.auth.signUp.mockResolvedValue({ data: { session: null } });
    expect(
      await auth.signUp("Test", " A@EXAMPLE.INVALID ", "synthetic-password"),
    ).toBeNull();
    expect(mock.client.auth.signUp.mock.calls[0][0].email).toBe(
      "a@example.invalid",
    );
    expect(localStorage.length).toBe(0);
  });
  it("rejects expired or invalid auth sessions instead of trusting saved profile data", async () => {
    mock.client.auth.getSession.mockResolvedValue({ data: { session: {} } });
    mock.client.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error("Invalid token"),
    });
    await expect(auth.getUser()).rejects.toThrow("Invalid token");
    expect(mock.client.from).not.toHaveBeenCalled();
  });
  it("does not report successful password reset or signout on provider errors", async () => {
    mock.client.auth.updateUser.mockResolvedValue({
      error: new Error("Expired"),
    });
    await expect(auth.resetPassword("synthetic-password")).rejects.toThrow(
      "expired",
    );
    mock.client.auth.signOut.mockResolvedValue({ error: new Error("Offline") });
    await expect(auth.signOut()).rejects.toThrow("Sign out failed");
  });
});
