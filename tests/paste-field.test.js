const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = join(__dirname, "..");
const read = name => readFileSync(join(root, name), "utf8");

test("every native text field is replaced by the bounded PasteField", () => {
    const panel = read("Panel.qml");
    const dropdown = read("OmaSearchableDropdown.qml");
    assert.equal((panel.match(/PasteField \{/g) || []).length, 3);
    assert.equal((dropdown.match(/PasteField \{/g) || []).length, 1);
    assert.doesNotMatch(panel, /(^|\s)(Ui\.)?TextField\s*\{/);
    assert.doesNotMatch(dropdown, /(^|\s)(Ui\.)?TextField\s*\{/);
});

test("PasteField intercepts every supported paste route", () => {
    const field = read("PasteField.qml");
    assert.match(field, /Keys\.priority: Keys\.BeforeItem/);
    assert.match(field, /Qt\.Key_V/);
    assert.match(field, /Qt\.Key_Insert/);
    assert.match(field, /Qt\.Key_Paste/);
    assert.match(field, /event\.accepted = true/);
    assert.match(field, /acceptedButtons: Qt\.MiddleButton/);
    assert.match(field, /positionAt\(mouse\.x, mouse\.y\)/);
    assert.match(field, /ContextMenu\.menu: Menu/);
    assert.match(field, /text: "Paste"[\s\S]{0,200}pasteJob\.paste\(false\)/);
    assert.match(field, /Model\.pasteQuery/);
    assert.match(field, /onVisibleChanged: if \(!visible\) pasteJob\.cancel\(\)/);
});

test("the clipboard job keeps its cap, deadline and descendant cleanup", () => {
    const job = read("PasteJob.qml");
    assert.match(job, /property int maxChars: 4096/);
    assert.match(job, /property int timeoutMs: 1500/);
    assert.match(job, /pkillPath/);
    assert.match(job, /"-P"/);
    assert.match(job, /signal\(15\)/);
    assert.match(job, /signal\(9\)/);
});
