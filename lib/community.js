// Community rooms: whose posts she sees.
//
// Founder decision (2026-09-29): the seeded posts and member counts in lib/demo-data.js
// (ROOM_MESSAGES, ROOMS[].members) are demo content. Only the demo user on the web sees them. Real
// accounts, and anyone in the native app build, see only real posts (today: the ones she wrote
// herself; later: posts from the community backend) and an empty state until there are some.
import { store } from "./store";
import { isDemoUser } from "./cycle";
import { IS_APP_BUILD } from "./config";
import { isNative } from "./native";
import { ROOM_MESSAGES } from "./demo-data";

export function showSeeds() {
  return isDemoUser() && !IS_APP_BUILD && !isNative();
}

function seedFor(roomId, id) {
  return (ROOM_MESSAGES[roomId] || []).find(function (m) { return m.id === id; }) || null;
}

// A seeded post: flagged, or (saved before the flag existed) someone else's post with a small
// numeric seed id. Her own posts use Date.now() ids.
export function isSeed(roomId, m) {
  if (!m || m.mine) return false;
  if (m.seed) return true;
  return typeof m.id === "number" && m.id < 1000 && !!seedFor(roomId, m.id);
}

// Minutes since a seeded post was written (older saves kept "12m" / "1h" strings instead).
export function seedAgoMin(roomId, m) {
  if (typeof m.agoMin === "number") return m.agoMin;
  var s = seedFor(roomId, m.id);
  return s ? s.agoMin : 0;
}

export function roomPosts(roomId) {
  var saved = store.get("room_" + roomId, null);
  var list = Array.isArray(saved) ? saved : null;
  if (showSeeds()) return list || (ROOM_MESSAGES[roomId] || []).map(function (m) { return { ...m }; });
  return (list || []).filter(function (m) { return !isSeed(roomId, m); });
}

export function saveRoomPosts(roomId, list) {
  store.set("room_" + roomId, list);
}

// Seeded member counts are demo numbers too: real accounts see none until there is real data.
export function roomMembers(room) {
  return showSeeds() ? room.members : null;
}
