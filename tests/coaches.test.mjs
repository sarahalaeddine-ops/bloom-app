// Coaching & support lists real professionals only, described with the facts they publish
// themselves. These tests guard the founder's rules (2026-09-29): a coach is never presented as a
// doctor, therapist or psychologist, and Bloom never invents prices, free sessions or bookings.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { COACHES } from "../lib/demo-data.js";
import * as demo from "../lib/demo-data.js";
import { DICTS } from "../lib/i18n.js";

var root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
var LANGS = ["en", "ar", "fr"];

test("the fictional therapists are gone", function () {
  assert.equal(demo.THERAPISTS, undefined);
  assert.ok(COACHES.length >= 1);
});

test("each coach has every profile string in en, ar and fr", function () {
  COACHES.forEach(function (c) {
    var keys = ["title", "speaker", "city", "bio", "tagline", "methods"].concat(c.topics, c.formats, c.background);
    keys.forEach(function (k) {
      LANGS.forEach(function (lang) {
        assert.ok(("coach." + c.key + "." + k) in DICTS[lang], lang + " is missing coach." + c.key + "." + k);
      });
    });
  });
});

test("a coach is never called Dr., doctor, therapist or psychologist, and nothing is free or priced", function () {
  // The degree line (e.g. "minor in Psychology") is a fact about her studies, not a title.
  var banned = /\bDr\b|doctor|therap|psycholog|psychiat|free|\$|€|thérap|médecin|gratuit|offert|طبيب|معالج|نفسي|مجان/i;
  COACHES.forEach(function (c) {
    assert.doesNotMatch(c.name, /\bDr\b/);
    LANGS.forEach(function (lang) {
      Object.keys(DICTS[lang]).filter(function (k) { return k.indexOf("coach." + c.key + ".") === 0 && !/\.edu\d$/.test(k); }).forEach(function (k) {
        assert.doesNotMatch(DICTS[lang][k], banned, lang + " " + k);
      });
    });
  });
});

test("contact links are the coach's own https website, Instagram, phone and WhatsApp", function () {
  COACHES.forEach(function (c) {
    assert.match(c.website, /^https:\/\/[^\s]+$/);
    assert.match(c.instagram, /^https:\/\/(www\.)?instagram\.com\//);
    assert.match(c.tel, /^\+\d{8,15}$/);
    assert.equal(c.whatsapp, "https://wa.me/" + c.tel.slice(1));
    assert.ok(c.sources.length > 0 && c.verified);
    ["price", "next", "slots", "rating", "reviews", "years", "free"].forEach(function (f) { assert.equal(c[f], undefined, f); });
  });
});

test("a coach photo, when set, is a file under public/ so it ships in the web and app builds", function () {
  COACHES.forEach(function (c) {
    if (!c.photo) return;
    assert.match(c.photo, /^\/coaches\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/);
    assert.ok(existsSync(path.join(root, "public", c.photo)), c.photo + " is missing");
  });
});
