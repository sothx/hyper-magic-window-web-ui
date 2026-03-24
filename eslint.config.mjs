import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import tseslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";

export default [
	{
		ignores: ["dist/**", "node_modules/**", "public/**"]
	},
	{
		files: ["**/*.{js,mjs,cjs,ts,mts,jsx,tsx}"],
		...js.configs.recommended,
		languageOptions: {
			parser: tseslint.parser,
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		rules: {
			"no-console": "warn",
			"no-async-promise-executor": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-unused-expressions": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"prefer-const": "off"
		}
	},
	...tseslint.configs.recommended.map((config) => ({
		...config,
		files: ["**/*.{ts,mts,tsx}"]
	})),
	...pluginVue.configs["flat/recommended"].map((config) => ({
		...config,
		files: ["**/*.vue"]
	})),
	{
		files: ["**/*.vue"],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tseslint.parser,
				ecmaVersion: "latest",
				sourceType: "module",
				extraFileExtensions: [".vue"]
			},
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		rules: {
			"no-console": "warn",
			"no-async-promise-executor": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-unused-expressions": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"prefer-const": "off",
			"vue/multi-word-component-names": "off"
		}
	},
	{
		files: ["**/*.{ts,mts,tsx,vue}"],
		rules: {
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-unused-expressions": "off",
			"no-async-promise-executor": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"prefer-const": "off"
		}
	}
];
