<p align="center">
<h1 align="center">KalimahApps Eslint Tailwind Plugin</h1>
</p>


<p align="center">
<h3 align="center">Provide eslint rules for tailwindcss</h3>
<br>
<br>
</p>

<p align="center">
<a target="_blank" href="https://www.npmjs.com/package/@kalimahapps/eslint-plugin-tailwind">
  <img src="https://img.shields.io/npm/v/@kalimahapps/eslint-plugin-tailwind.svg">
</a>
<a target="_blank" href="https://www.npmjs.com/package/@kalimahapps/eslint-plugin-tailwind">
  <img src="https://img.shields.io/npm/dt/@kalimahapps/eslint-plugin-tailwind.svg">
</a>
<img src="https://img.shields.io/github/license/kalimahapps/eslint-plugin-tailwind">
</p>

<p align="center">
<a target=_blank href="https://twitter.com/KalimahApps">
  <img src="https://img.shields.io/twitter/follow/KalimahApps?style=for-the-badge">
</a>
</p>

<br>
<br>

## ✨ Rules
- `tailwind-sort`: Sort tailwind classes in alphabetical order in groups
- `tailwind-multiline`: Break tailwind classes into multiple lines if they exceed the max line length (default: 80)

<br>
<br>

## 💽 Installation
### PNPM
```bash
pnpm add eslint @kalimahapps/eslint-plugin-tailwind -D
```

### NPM
```bash
npm install eslint @kalimahapps/eslint-plugin-tailwind -D
```

<br>
<br>

## 🔧 Usage
Create eslint.config.js file (or eslint.config.mjs for esm, or eslint.config.cjs for commonjs) in the root of your project and add this

```js
import kalimahAppsTailwind from '@kalimahapps/eslint-plugin-tailwind';

export default [
	{
		plugins: {
			kalimahAppsTailwind,
		},
		rules: {
			'kalimahAppsTailwind/sort': 'warn',
			'kalimahAppsTailwind/multiline': 'warn',
		},
	},
]
```

The following options can be set to the mutiline rule:
- `maxLen`: break classes as soon as the line length is longer than this (and join if the line is smaller)
- `quotesOnNewLine`: put the quotes on different lines to the first and last class

> Please note that the indentation of for the classes in multiline rule will follow the indentation of the parent. i.e. spaces will be used if the parent is using spaces and tabs will be used if the parent is using tabs



```js
import kalimahAppsTailwind from '@kalimahapps/eslint-plugin-tailwind';

export default [
	{
		plugins: {
			kalimahAppsTailwind,
		},
		rules: {
			'kalimahAppsTailwind/sort': 'warn',
			'kalimahAppsTailwind/multiline': [
				'warn',
				{
					maxLen: 100,
					quotesOnNewLine: true,
				},
			],
		},
	},
]
```

### VSCode integration
Install [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension in VSCode and add this to your .vscode/settings.json file
```json
{
 	"prettier.enable": false,
  	"editor.formatOnSave": false,
	"eslint.codeAction.showDocumentation": {
		"enable": true
	},
	"editor.codeActionsOnSave": {
		"source.fixAll.eslint": true
	},
	"eslint.validate": [
		"javascript",
		"javascriptreact",
		"typescript",
		"typescriptreact",
		"json",
		"jsonc",
		"json5",
		"vue"
	],
}
```

You need to install ESLint extension in VSCode. You can find it [here](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

<br>
<br>


## Other projects
### [KalimahApps Eslint Config](https://www.npmjs.com/package/@kalimahapps/eslint-config)
Comprehensive eslint rules for vue projects with typescript

### [Vue Icons](https://www.npmjs.com/package/@kalimahapps/vue-icons)
60,000+ SVG icons from popular icon sets that you can add seamlessly to your vue projects

### [Vue Popper](https://www.npmjs.com/package/@kalimahapps/vue-popper)
A tooltip component for Vue 3 based on popper.js

### [Vite inherit attrs](https://www.npmjs.com/package/vite-plugin-vue-setup-inherit-attrs)
A vite plugin that adds support for inheritAttrs in vue-setup

<br>
<br>

## License
[MIT License](LICENSE)