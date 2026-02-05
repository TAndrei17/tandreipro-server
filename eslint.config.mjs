import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
	{
		ignores: ['node_modules', 'dist'],
	},
	js.configs.recommended,
	{
		files: ['**/*.js', '**/*.ts'],
		plugins: {
			'@stylistic': stylistic,
			jest: jestPlugin,
			import: importPlugin,
			'@typescript-eslint': tsPlugin,
		},
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
			globals: {
				console: 'readonly',
				process: 'readonly',

				describe: 'readonly',
				it: 'readonly',
				test: 'readonly',
				expect: 'readonly',
			},
		},
		settings: {
			'import/resolver': {
				typescript: {
					project: './tsconfig.json', // Eslint смотрит в tsconfig
					alwaysTryTypes: true,
				},
				node: {
					extensions: ['.js', '.jsx', '.ts', '.tsx'],
				},
			},
		},
		rules: {
			// Main Rules
			'no-unused-vars': 'off', // JS правило
			'no-undef': 'off', // JS правило
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

			// Style
			'@stylistic/semi': ['error', 'always'],
			'@stylistic/quotes': ['error', 'single'],
			'@stylistic/brace-style': 'off',

			// Imports
			'import/no-unresolved': 'error',
			'import/no-duplicates': 'error',
			'import/first': 'error',
			'import/newline-after-import': 'error',
			'import/order': [
				'error',
				{
					groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
					'newlines-between': 'always',
					alphabetize: { order: 'asc', caseInsensitive: true },
				},
			],
		},
	},
];
