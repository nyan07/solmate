import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * CONFIG
 */
const EN_FILE = path.resolve(__dirname, "../src/i18n/locales/en.ts");
const DE_FILE = path.resolve(__dirname, "../src/i18n/locales/de.ts");
const OUTPUT_FILE = path.resolve(__dirname, "../translations.md");

/**
 * Flatten nested objects/arrays into dot notation.
 * Example:
 * { a: { b: ["x"] } } -> { "a.b.0": "x" }
 */
function flatten(obj, prefix = "") {
    const result = {};

    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (Array.isArray(value)) {
            value.forEach((item, index) => {
                const arrayKey = `${newKey}.${index}`;

                if (item !== null && typeof item === "object") {
                    Object.assign(result, flatten(item, arrayKey));
                } else {
                    result[arrayKey] = item;
                }
            });
        } else if (value !== null && typeof value === "object") {
            Object.assign(result, flatten(value, newKey));
        } else {
            result[newKey] = value;
        }
    }

    return result;
}

/**
 * Escape a value for a Markdown table cell.
 */
function escapeMd(value) {
    if (value === undefined || value === null) return "";
    return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

/**
 * Parse an existing translations.md and return a Map of
 * key -> { en, de, needsReview } so we can preserve "Needs review?" state.
 * Returns an empty Map if the file doesn't exist.
 */
function parseExistingMd(filePath) {
    if (!fs.existsSync(filePath)) return new Map();

    const lines = fs.readFileSync(filePath, "utf8").split("\n");
    const result = new Map();

    for (const line of lines) {
        // Skip header and separator rows
        if (!line.startsWith("|") || line.startsWith("| key") || line.startsWith("| ---")) {
            continue;
        }

        // Split on | not preceded by \ (escaped pipes inside cells)
        const cells = line.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
        // Layout: ["", key, en, de, needsReview, ""]
        if (cells.length < 5) continue;

        const key = cells[1];
        if (key) result.set(key, { en: cells[2], de: cells[3], needsReview: cells[4] });
    }

    return result;
}

/**
 * Build Markdown table from two translation objects.
 * Compares against the existing file to mark new/changed keys as "Yes" in
 * the "Needs review?" column. Existing "Yes" values are preserved even when
 * the content hasn't changed (so a reviewer can clear them manually).
 */
function toMd(enObj, deObj, existing) {
    const flatEn = flatten(enObj);
    const flatDe = flatten(deObj);

    const allKeys = Array.from(new Set([...Object.keys(flatEn), ...Object.keys(flatDe)])).sort();

    const rows = [
        "| key | en | de | Needs review? |",
        "| --- | --- | --- | --- |",
        ...allKeys.map((key) => {
            const enVal = escapeMd(flatEn[key]);
            const deVal = escapeMd(flatDe[key]);

            let needsReview = "";
            const prev = existing.get(key);

            if (!prev) {
                // New key
                needsReview = "Yes";
            } else if (prev.en !== enVal || prev.de !== deVal) {
                // Value changed
                needsReview = "Yes";
            } else {
                // Unchanged — preserve whatever the reviewer left
                needsReview = prev.needsReview;
            }

            return `| ${escapeMd(key)} | ${enVal} | ${deVal} | ${needsReview} |`;
        }),
    ];

    return rows.join("\n");
}

/**
 * Converts a simple TS translation file into executable JS and returns the exported object.
 *
 * Assumptions:
 * - file looks like: const en = { ... } as const; export default en;
 * - no imports
 * - pure object literal
 */
function loadTsObject(filePath, varName) {
    let code = fs.readFileSync(filePath, "utf8");

    // Remove "as const"
    code = code.replace(/\s+as const\s*;/g, ";");

    // Remove export default line
    code = code.replace(new RegExp(`export\\s+default\\s+${varName}\\s*;?`), "");

    // Turn "const en =" into "module.exports ="
    code = code.replace(new RegExp(`const\\s+${varName}\\s*=\\s*`), "module.exports = ");

    const sandbox = {
        module: { exports: {} },
        exports: {},
    };

    vm.runInNewContext(code, sandbox, { filename: filePath });

    return sandbox.module.exports;
}

function main() {
    if (!fs.existsSync(EN_FILE)) {
        throw new Error(`EN file not found: ${EN_FILE}`);
    }

    if (!fs.existsSync(DE_FILE)) {
        throw new Error(`DE file not found: ${DE_FILE}`);
    }

    const en = loadTsObject(EN_FILE, "en");
    const de = loadTsObject(DE_FILE, "de");
    const existing = parseExistingMd(OUTPUT_FILE);

    const md = toMd(en, de, existing);

    fs.writeFileSync(OUTPUT_FILE, md, "utf8");

    const newCount = [...md.split("\n").slice(2)].filter((row) => row.endsWith("| Yes |")).length;

    console.log(`✅ Markdown exported successfully`);
    console.log(`📄 Output: ${OUTPUT_FILE}`);
    console.log(`📊 Rows: ${md.split("\n").length - 2}`);
    if (newCount > 0) console.log(`🔍 Needs review: ${newCount} key(s)`);
}

main();
