const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
    {
        ignores: ["node_modules/**"]
    },

    js.configs.recommended,

    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",

            globals: {
                ...globals.node
            }
        }
    },

    {
        files: ["tests/**/*.js"],

        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest
            }
        }
    }
];