const sort = require('./rules/sort.js');
const multiline = require('./rules/multiline.js');
const package = require('./package.json');

module.exports = {
	 meta: {
		name: '@kalimahapps/eslint-plugin-tailwind',
		version: package.version,
	},
	rules: {
		sort,
		multiline,
	},
};