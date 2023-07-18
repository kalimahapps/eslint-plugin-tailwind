// Create rule class
class TailwindMultiLine {
	constructor(context, node) {
		this.context = context;
		this.node = node;
		this.errorType = 'multi-line';
		this.parseAttribute();
	}

	/**
	 * Get attribute name
	 *
	 * @param  {string} key Attribute name to check
	 * @return {string}     Attribute name based on AST
	 */
	getName(key) {
		return typeof key === 'string' ? key : key.name;
	}

	/**
	 * Entry point for the rule
	 *
	 * @return {void} Return void if the rule is not applicable
	 */
	parseAttribute() {
		const name = this.getName(this.node.key.name);
		if (name !== 'class') {
			return;
		}

		// Get node value
		const nodeValue = this.node.value.value;

		const classes = this.groupClasses(nodeValue);
		const joinedClasses = this.joinClasses(classes);

		// If the classes have already in the correct format then no need to do anything

		if (nodeValue === joinedClasses) {
			return;
		}

		const { value: { loc, range } } = this.node;

		let errorMessage = 'Classes should be in multiple lines';
		if (this.errorType !== 'multi-line') {
			errorMessage = 'Classes should be in a single line';
		}

		this.context.report({
			node: this.node,
			loc,
			message: errorMessage,
			*fix(fixer) {
				yield fixer.replaceTextRange(range, `"${joinedClasses}"`);
			},
		});
	}

	/**
	 * Join classes into a single line if they are
	 * within the max character limit, otherwise
	 * join them into multiple lines and indent with appropriate
	 * spacing.
	 *
	 * @param  {Array}  classes List of classes to join
	 * @return {string}         Joined classes
	 */
	/* eslint complexity: ["warn", 8] */
	joinClasses(classes) {
		const { options } = this.context;
		const { maxLen: maxLength = 80, quotesOnNewLine = false } = options[0] || {};
		const { loc: attributeLoc } = this.node;

		// Get start of the line
		const parentStart = this.node.parent.loc.start;
		const nodeStart = attributeLoc.start;
		const startLine = parentStart.line === nodeStart.line ? parentStart : nodeStart;

		// Get source code
		const sourceCode = this.context.getSourceCode();

		// Get line from source code
		const nodeLine = sourceCode.lines[nodeStart.line - 1];
		const parentLine = sourceCode.lines[parentStart.line - 1];
		const line = parentStart.line === nodeStart.line ? parentLine : nodeLine;

		// Slice the beginning of the line to the start of the attribute
		// to get the type of spacing used
		const spacing = line.slice(0, startLine.column);

		// Is it tabbed or spaced?
		const isTabbed = spacing.includes('\t');

		// Length of the classes combined as a text including quotes
		const classesLength = classes.join(' ').length + 2;

		// Get the start column of the attribute including the class attribute
		const classesColStart = this.node.value.loc.start.column;

		// Get the size of the spacing
		const spaceSize = isTabbed ? 4 : 1;

		// Calculate the length of the line
		const lineLength = classesLength + (spaceSize * spacing.length) + classesColStart;

		if (lineLength > maxLength) {
			this.errorType = 'multi-line';

			// Set the spacing character to tab or space
			const spacingCharacter = isTabbed ? '\t' : ' ';

			// Set the amount of spacing characters to indent to the class attribute
			const tabRepeat = isTabbed ? 1 : 4;

			// Repeat the spacing character to the length of the spacing
			const spacingString = spacingCharacter.repeat(spacing.length + tabRepeat);
			return quotesOnNewLine
				? `\n${spacingString}${classes.join(`\n${spacingString}`)}\n${spacingString}`
				: classes.join(`\n${spacingString}`);
		}

		this.errorType = 'single-line';
		return classes.join(' ');
	}

	/**
	 * Group classes into an array
	 *
	 * @param  {Array}  classes List of classes
	 * @return {string}         Grouped classes
	 */
	groupClasses(classes) {
		const isMultiline = classes.includes('\n');
		if (isMultiline === false) {
			return classes.trim().split(' ');
		}

		// Clean from tabs, spaces and newlines
		const cleanClasses = classes.split('\n').reduce((accumulator, item) => {
			const trimmedItem = item.trim();

			// Check if item includes whitespace
			const hasWhitespace = trimmedItem.match(/\s/u);
			if (hasWhitespace === null && trimmedItem.length > 0) {
				accumulator.push(trimmedItem);
				return accumulator;
			}

			// Split the item by whitespace
			const splitItem = trimmedItem.split(/\s+/u);
			if (splitItem.length > 0 && splitItem[0].length > 0) {
				accumulator.push(...splitItem);
			}
			return accumulator;
		}, []);
		return cleanClasses;
	}
}

/**
 *
 * @param context
 */
module.exports = {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Break classes into multiple lines or join classes into a single line',
			category: 'Stylistic',
			recommended: true,
		},
		fixable: 'code',
	},
	create: (context) => {
		if (context.parserServices.defineTemplateBodyVisitor === undefined) {
			return {};
		}

		return context.parserServices.defineTemplateBodyVisitor(

			// Event handlers for <template>.
			{
				VAttribute(node) {
					new TailwindMultiLine(context, node);
				},
			}
		);
	},
};