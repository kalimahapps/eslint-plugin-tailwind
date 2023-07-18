import { it, expect } from 'vitest';
const { RuleTester } = require('eslint');
const multlineRule = require('../rules/multiline');
const sortRule = require('../rules/sort');
const ruleTester = new RuleTester({
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
	},
	parser: require.resolve('vue-eslint-parser'),
});

ruleTester.run('multiline', multlineRule, {
	valid: [
		{
			code: '<template><div class="text-red-500 text-blue-500" attr="test"></div></template>',
		},
		{
			code: '<template><div class="text-red-500 text-blue-500"></div></template>',
		},
		{
			code: '<template><div class="text-red-500 text-blue-500 text-green-500"></div></template>',
		},
		{
			code: `<template>
					<div class="text-red-500
						text-blue-500
						text-green-500
						text-yellow-500"
					></div>
				`,
		},
		{
			code: `<template>
					<div class="
						text-red-500
						text-blue-500
						text-green-500
						text-yellow-500
						"
					></div>
				`,
			options: [{ quotesOnNewLine: true }],
		},
	],
	invalid: [
		{
			code: `<template>
                <div class="text-red-500 text-blue-500 text-green-500 text-yellow-500 text-purple-500"></div>
                </template>`,
			output: `<template>
                <div class="text-red-500
                    text-blue-500
                    text-green-500
                    text-yellow-500
                    text-purple-500"></div>
                </template>`,
			errors: [{ message: 'Classes should be in multiple lines' }],
		},
		{
			code: `<template><div
					class="text-red-500 text-blue-500 text-green-500 text-yellow-500 text-purple-500"
					></div>
				</template>`,
			output: `<template><div
					class="text-red-500
						text-blue-500
						text-green-500
						text-yellow-500
						text-purple-500"
					></div>
				</template>`,
			errors: [{ message: 'Classes should be in multiple lines' }],
		},
		{
			code: `<template><div class="text-red-500
											text-purple-500"></div></template>`,
			output: '<template><div class="text-red-500 text-purple-500"></div></template>',
			errors: [{ message: 'Classes should be in a single line' }],
		},
		{
			code: `<template>
				<div class="text-red-500
						text-purple-500
						grid-cols-2 bg-gray-200
						grid"
				></div></template>`,
			output: `<template>
				<div class="text-red-500
					text-purple-500
					grid-cols-2
					bg-gray-200
					grid"
				></div></template>`,
			errors: [{ message: 'Classes should be in multiple lines' }],
		},
		{
			code: `<template>
				<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
				</template>`,
			output: `<template>
				<div class="w-11
					h-6
					bg-gray-200
					peer-focus:outline-none
					peer-focus:ring-4
					peer-focus:ring-blue-300
					dark:peer-focus:ring-blue-800
					rounded-full
					peer
					dark:bg-gray-700
					peer-checked:after:translate-x-full
					peer-checked:after:border-white
					after:content-['']
					after:absolute
					after:top-[2px]
					after:left-[2px]
					after:bg-white
					after:border-gray-300
					after:border
					after:rounded-full
					after:h-5
					after:w-5
					after:transition-all
					dark:border-gray-600
					peer-checked:bg-blue-600"></div>
				</template>`,
			errors: [{ message: 'Classes should be in multiple lines' }],
		},
		{
			code: `<template>
					<div class="
						text-red-500
						text-blue-500
						text-green-500
						text-yellow-500
						"
					></div>
				`,
			output: `<template>
					<div class="text-red-500
						text-blue-500
						text-green-500
						text-yellow-500"
					></div>
				`,
			errors: [{message: 'Classes should be in multiple lines'}],
		},
		{
			code: `<template>
					<div class="text-red-500
						text-blue-500
						text-green-500
						text-yellow-500"
					></div>
				`,
			output: `<template>
					<div class="
						text-red-500
						text-blue-500
						text-green-500
						text-yellow-500
						"
					></div>
				`,
			options: [{quotesOnNewLine: true}],
			errors: [{message: 'Classes should be in multiple lines'}],
		},
	],
});

ruleTester.run('sort', sortRule, {
	valid: [
		{
			code: '<template><div class="text-blue-500 text-red-500" anohter="test"></div></template>',
		},
		{
			code: '<template><div class="grid grid-cols-2"></div></template>',
		},
	],
	invalid: [
		{
			code: '<template><div class="text-red-500 text-blue-500"></div></template>',
			output: '<template><div class="text-blue-500 text-red-500"></div></template>',
			errors: [{ message: 'Classes are not sorted' }],
		},
		{
			code: '<template><div class="grid-cols-2 grid"></div></template>',
			output: '<template><div class="grid grid-cols-2"></div></template>',
			errors: [{ message: 'Classes are not sorted' }],
		},
		{
			code: '<template><div class="grid-cols-2 md:grid-cols-3 sm:grid-cols-1"></div></template>',
			output: '<template><div class="grid-cols-2 sm:grid-cols-1 md:grid-cols-3"></div></template>',
			errors: [{ message: 'Classes are not sorted' }],
		},
		{
			code: '<template><div class="via-30% from-indigo-500 from-10% bg-gradient-to-r via-sky-500 to-emerald-500 to-90%"></div></template>',
			output: '<template><div class="bg-gradient-to-r from-10% from-indigo-500 via-30% via-sky-500 to-90% to-emerald-500"></div></template>',
			errors: [{ message: 'Classes are not sorted' }],
		},
		{
			code: `<template>
			<div class="w-11
					h-6
					bg-gray-200
					peer-focus:outline-none
					peer-focus:ring-4
					peer-focus:ring-blue-300
					dark:peer-focus:ring-blue-800
					rounded-full
					peer
					dark:bg-gray-700
					peer-checked:after:translate-x-full
					peer-checked:after:border-white
					after:content-['']
					after:absolute
					after:top-[2px]
					after:left-[2px]
					after:bg-white
					after:border-gray-300
					after:border
					after:rounded-full
					after:h-5
					after:w-5
					after:transition-all
					dark:border-gray-600
					peer-checked:bg-blue-600"
					/>
			</template>`,
			output: `<template>
			<div class="bg-gray-200
					after:bg-white
					dark:bg-gray-700
					h-6
					after:h-5
					peer
					dark:peer-focus:ring-blue-800
					peer-checked:after:border-white
					peer-checked:after:translate-x-full
					peer-checked:bg-blue-600
					peer-focus:outline-none
					peer-focus:ring-4
					peer-focus:ring-blue-300
					rounded-full
					after:rounded-full
					w-11
					after:w-5
					after:absolute
					after:border
					after:border-gray-300
					after:content-['']
					after:left-[2px]
					after:top-[2px]
					after:transition-all
					dark:border-gray-600"
					/>
			</template>`,
			errors: [{ message: 'Classes are not sorted' }],
		},
		{
			code: `<template>
<div class="w-11
h-6
bg-gray-200
peer-focus:outline-none
peer-focus:ring-4 peer-focus:ring-blue-300
dark:peer-focus:ring-blue-800
rounded-full
peer
dark:bg-gray-700
peer-checked:after:translate-x-full
peer-checked:after:border-white
after:content-['']
after:absolute
after:top-[2px]
after:left-[2px]
after:bg-white
after:border-gray-300
after:border
after:rounded-full
after:h-5
after:w-5
after:transition-all
dark:border-gray-600
peer-checked:bg-blue-600"
/>
</template>`,
			output: `<template>
<div class="bg-gray-200
 after:bg-white
 dark:bg-gray-700
 h-6
 after:h-5
 peer
 dark:peer-focus:ring-blue-800
 peer-checked:after:border-white
 peer-checked:after:translate-x-full
 peer-checked:bg-blue-600
 peer-focus:outline-none
 peer-focus:ring-4
 peer-focus:ring-blue-300
 rounded-full
 after:rounded-full
 w-11
 after:w-5
 after:absolute
 after:border
 after:border-gray-300
 after:content-['']
 after:left-[2px]
 after:top-[2px]
 after:transition-all
 dark:border-gray-600"
/>
</template>`,
			errors: [{ message: 'Classes are not sorted' }],
		},
	],
});

/**
 * This is a test to stop vitest from complaining
 * about no tests being found. The tests are run
 * using RuleTester from eslint.
 */
it('test', () => {
	expect(1).toBe(1);
});