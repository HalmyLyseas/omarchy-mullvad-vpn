const { readFileSync, readdirSync } = require("node:fs");
const { join, relative } = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = join(__dirname, "..");

function qmlFiles(directory) {
    const files = [];
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        if (entry.name === ".git" || entry.name === "node_modules") continue;
        const path = join(directory, entry.name);
        if (entry.isDirectory()) files.push(...qmlFiles(path));
        else if (entry.isFile() && entry.name.endsWith(".qml")) files.push(path);
    }
    return files;
}

test("QML palette references use the Qt 6.12-safe Commons namespace", () => {
    const offenders = [];
    const missingImports = [];
    for (const file of qmlFiles(root)) {
        const source = readFileSync(file, "utf8");
        const name = relative(root, file);
        source.split(/\r?\n/).forEach((line, index) => {
            if (/(^|[^A-Za-z_.])Color\./.test(line))
                offenders.push(`${name}:${index + 1}: ${line.trim()}`);
        });
        if (source.includes("Commons.Color.") && !source.includes("import qs.Commons as Commons"))
            missingImports.push(name);
    }
    assert.deepEqual(offenders, [],
        "Qt 6.12 shadows the unqualified Color singleton; import qs.Commons as Commons and use Commons.Color");
    assert.deepEqual(missingImports, [],
        "files using Commons.Color must import qs.Commons as Commons");
});
