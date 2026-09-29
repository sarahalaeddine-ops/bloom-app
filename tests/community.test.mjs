// Founder decision (2026-09-29): seeded Community posts and member counts are demo content. A real
// account (and the native app) never sees them; the demo user on the web still does.
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { store } from "../lib/store.js";
import { roomPosts, saveRoomPosts, roomMembers, showSeeds, isSeed } from "../lib/community.js";
import { ROOMS, ROOM_MESSAGES, DEMO_USER } from "../lib/demo-data.js";
import { DICTS } from "../lib/i18n.js";

function asDemo() { store.set("user", { ...DEMO_USER }); }
function asReal() { store.set("user", { id: "u-1", name: "Lina", onboarded: true }); }

beforeEach(function () { localStorage.clear(); delete globalThis.Capacitor; });
afterEach(function () { delete globalThis.Capacitor; });

test("a real account never gets seeded posts or member counts", function () {
  asReal();
  assert.equal(showSeeds(), false);
  ROOMS.forEach(function (r) {
    assert.deepEqual(roomPosts(r.id), [], r.id);
    assert.equal(roomMembers(r), null, r.id);
  });
});

test("a real account never gets seeded posts even if an older save (or the demo) stored them", function () {
  asReal();
  var legacy = [
    { id: 1, flower: "Sunflower", text: "Day 8 here.", ago: "12m", likes: 9 },           // saved before the seed flag
    { id: 2, seed: true, flower: "Rose", agoMin: 34, likes: 14 },                        // flagged seed
    { id: 1727600000000, flower: "Lily", text: "My own post", likes: 0, mine: true },    // hers
  ];
  saveRoomPosts("stim", legacy);
  var posts = roomPosts("stim");
  assert.deepEqual(posts.map(function (m) { return m.id; }), [1727600000000]);
  assert.ok(posts.every(function (m) { return !isSeed("stim", m); }));
});

test("the demo user on the web sees the seeded posts and counts", function () {
  asDemo();
  assert.equal(showSeeds(), true);
  assert.equal(roomPosts("stim").length, ROOM_MESSAGES.stim.length);
  assert.equal(roomMembers(ROOMS[0]), ROOMS[0].members);
});

test("in the native app even the demo user gets no seeded posts", function () {
  asDemo();
  globalThis.Capacitor = { isNativePlatform: function () { return true; } };
  assert.equal(showSeeds(), false);
  assert.deepEqual(roomPosts("stim"), []);
  assert.equal(roomMembers(ROOMS[0]), null);
});

test("every room, seeded post, prompt and flower is translated", function () {
  ["en", "ar", "fr"].forEach(function (lang) {
    var d = DICTS[lang];
    ROOMS.forEach(function (r) {
      assert.ok(d["cm.room." + r.id] && d["cm.room." + r.id + ".d"], lang + " room " + r.id);
      (ROOM_MESSAGES[r.id] || []).forEach(function (m) {
        assert.ok(d["cm.p." + r.id + "." + m.id], lang + " post " + r.id + "." + m.id);
        assert.ok(d["flower." + m.flower], lang + " flower " + m.flower);
      });
    });
  });
});
