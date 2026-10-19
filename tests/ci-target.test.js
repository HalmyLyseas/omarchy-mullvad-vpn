const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = join(__dirname, "..");
const workflow = readFileSync(join(root, ".github/workflows/test.yml"), "utf8");
const ciLocal = readFileSync(join(root, "tests/ci-local"), "utf8");
const uiRunner = readFileSync(join(root, "tests/probe/run-ui"), "utf8");

test("CI validates the exact Omarchy 4.0.4 and 4.0.5 tags", () => {
    assert.match(workflow, /omarchy: \[v4\.0\.4, v4\.0\.5\]/);
    assert.match(workflow, /--branch "\$\{\{ matrix\.omarchy \}\}"/);
    assert.match(workflow, /describe --tags --exact-match[^\n]*" = "\$\{\{ matrix\.omarchy \}\}"/);
    assert.doesNotMatch(workflow, /v4\.0\.3/);
    assert.doesNotMatch(workflow, /pacman -Swdd --noconfirm omarchy/);
});

test("local gate and UI runner share overridable Omarchy sources", () => {
    assert.match(ciLocal, /OMARCHY_SHELL_DIR:-\/usr\/share\/omarchy\/shell/);
    assert.match(ciLocal, /\/usr\/lib\/qt6\/bin\/qmllint/);
    assert.match(ciLocal, /OMARCHY_PLUGIN_VALIDATOR/);
    assert.match(uiRunner, /OMARCHY_SHELL_DIR:-\/usr\/share\/omarchy\/shell/);
    assert.doesNotMatch(ciLocal, /-I \/usr\/share\/omarchy\/shell/);
    assert.doesNotMatch(uiRunner, /ln -s \/usr\/share\/omarchy\/shell/);
});
