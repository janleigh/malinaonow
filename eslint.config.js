// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const stylistic = require("@stylistic/eslint-plugin");
const eslint = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
	expoConfig,
	{
		ignores: ["dist/*"],
		plugins: {
			"@stylistic": stylistic,
		},
		rules: {
			"indent": ["error", "tab"],
			"no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"@stylistic/max-len": [
				"error",
				{
					code: 110,
					ignoreComments: true,
					ignoreUrls: true,
					ignoreStrings: true,
					ignoreTemplateLiterals: true,
					ignoreRegExpLiterals: true,
				},
			],
		},
	},
	eslint,
]);
