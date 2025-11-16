// eslint.config.mjs
import tsparser from "@typescript-eslint/parser";
import obsidianmd from "eslint-plugin-obsidianmd";
import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig([
    // global ignores
    {
        ignores: ["node_modules/", "main.js", "dist/"]
    },
    ...obsidianmd.configs.recommended,
    {
        files: ["**/*.ts"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parser: tsparser,
            parserOptions: { project: "./tsconfig.json" },
        },

        // you can add your own configuration to override or add rules
        rules: {
            // example: turn off a rule from the recommended set
            "obsidianmd/sample-names": "off",
            // example: add a rule not in the recommended set and set its severity
            // this rule enforces using the obsidian filemanager to trash files
            "obsidianmd/prefer-file-manager-trash-file": "error",
        },
    },
]);
