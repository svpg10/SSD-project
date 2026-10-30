import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import standalone from "ajv/dist/standalone/index.js";
import fs from "node:fs";
const schema = JSON.parse(
  fs.readFileSync("specs/cvd-studio/schemas/cvd-studio.schema.json", "utf8"),
);
const ajv = new Ajv2020({
  strict: false,
  code: { source: true, esm: true },
  allErrors: false,
});
addFormats(ajv);
ajv.addSchema(schema, "cvd");
ajv.addSchema({ $id: "project", $ref: "cvd#/$defs/ProjectExport" });
const code = standalone(ajv, { validateProject: "project" })
  .replaceAll('require("ajv/dist/runtime/ucs2length").default', "unicodeLength")
  .replaceAll('require("ajv-formats/dist/formats")', "formatModule");
if (code.includes("require("))
  throw new Error("Unhandled CommonJS dependency in standalone validator.");
fs.mkdirSync("apps/web/src/lib/generated", { recursive: true });
fs.writeFileSync(
  "apps/web/src/lib/generated/project-validator.js",
  "// Generated at build time; no runtime schema compilation or eval.\nimport lengthModule from 'ajv/dist/runtime/ucs2length';\nimport * as formatModule from 'ajv-formats/dist/formats';\nconst unicodeLength=lengthModule.default ?? lengthModule;\n" +
    code +
    "\n",
);
console.log("Generated standalone project validator.");
