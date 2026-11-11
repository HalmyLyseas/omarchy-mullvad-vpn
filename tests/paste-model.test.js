const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync(require.resolve("../Model.js"), "utf8");
const context = { module: { exports: {} }, exports: {}, isFinite, Infinity };
vm.runInNewContext(source.replace(".pragma library", '"use strict";'), context);
const Model = context.module.exports;

test("pasteQuery inserts at the cursor and replaces a selection", () => {
    const a = Model.pasteQuery("abc", 1, 1, 1, "X", 100);
    assert.equal(a.text, "aXbc"); assert.equal(a.cursor, 2);
    const b = Model.pasteQuery("abcdef", 1, 4, 4, "Z", 100);
    assert.equal(b.text, "aZef"); assert.equal(b.cursor, 2);
});

test("pasteQuery bounds the field and neutralizes control characters", () => {
    const c = Model.pasteQuery("", 0, 0, 0, "a\nb\u0085c", 100);
    assert.equal(c.text, "a b c"); assert.equal(c.cursor, 5);
    const d = Model.pasteQuery("", 0, 0, 0, "abcdef", 3);
    assert.equal(d.text, "abc"); assert.equal(d.cursor, 3);
});

test("pasteQuery handles missing offsets and an empty paste without deleting a selection", () => {
    const e = Model.pasteQuery("abc", null, null, null, "X", 100);
    assert.equal(e.text, "abcX"); assert.equal(e.cursor, 4);
    const f = Model.pasteQuery("abcdef", 1, 4, 4, "", 100);
    assert.equal(f.text, "abcdef"); assert.equal(f.cursor, 1);
});
