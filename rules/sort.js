const orderBy = require('lodash.orderby');

const groups = [
	{
		main: ['bg-gradient'],
		related: ['from', 'via', 'to'],
	},
	{
		main: ['static', 'fixed', 'absolute', 'relative', 'sticky'],
		related: ['top', 'right', 'bottom', 'left', 'inset'],
	},
	{
		main: ['flex', 'inline-flex'],
		related: ['grow', 'shrink', 'justify', 'content', 'items'],
	},
	{
		main: ['grid', 'inline-grid'],
		related: [
			'grid-cols',
			'grid-rows',
			'grid-flow',
			'auto-cols',
			'auto-rows',
			'gap',
			'justify',
			'content',
			'col-span',
			'place-content',
			'place-items',
		],
	},
];

// Create rule class
class Tailwind {
	constructor(context, node) {
		this.context = context;
		this.node = node;
		this.space = ' ';
		this.classesList = [];
		this.sortedClasses = [];
		this.skipClasses = [];

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

		this.sortClasses(nodeValue);

		// If the classes have already been sorted then no need to do anything
		if (nodeValue.trim() === this.sortedClasses.trim()) {
			return;
		}
		const finalSortedClasses = this.sortedClasses;

		const { value: { loc, range } } = this.node;

		this.context.report({
			node: this.node,
			loc,
			message: 'Classes are not sorted',
			*fix(fixer) {
				yield fixer.replaceTextRange(range, `"${finalSortedClasses}"`);
			},
		});
	}

	/**
	 * Remove an element from an array
	 *
	 * @param {Array}          targetArray Array to modify
	 * @param {string | Array} item        Item to remove
	 */
	removeFromArray(targetArray, item) {
		const itemsToRemove = Array.isArray(item) ? item : [item];
		itemsToRemove.forEach((itemToRemove) => {
			const index = targetArray.indexOf(itemToRemove);
			if (index > -1) {
				targetArray.splice(index, 1);
			}
		});
	}

	/**
	 * Sort classes by breakpoint from smallest to largest
	 *
	 * @param  {Array} classes List of classes
	 * @return {Array}         Sorted list of classes
	 */
	sortResponsiveClasses(classes) {
		// Sort classes by breakpoint, smallest to largest
		// The order should be: sm, md, lg, xl, 2xl
		const breakpoints = ['sm', 'md', 'lg', 'xl', '2xl'];
		const sortedClasses = orderBy(classes, (item) => {
			const breakpoint = item.match(/^(|-)*[A-Za-z]+:/u);

			if (breakpoint === null) {
				return -1;
			}

			const matchedBreakpoint = breakpoint[0].replace(':', '');
			return breakpoints.indexOf(matchedBreakpoint);
		});

		return sortedClasses;
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
		const splitClasses = classes.split('\n');

		// Get the space before the second class
		const find = splitClasses[1].match(/^(?<space>\s+)/u);
		this.space = find === null ? '\n ' : `\n${find.groups.space}`;

		const cleanClasses = splitClasses.reduce((accumulator, item) => {
			const trimmedItem = item.trim();

			// Check if item includes whitespace
			const hasWhitespace = trimmedItem.match(/\s/u);
			if (hasWhitespace === null) {
				accumulator.push(trimmedItem);
				return accumulator;
			}

			// Split the item by whitespace
			const splitItem = trimmedItem.split(/\s+/u);
			accumulator.push(...splitItem);
			return accumulator;
		}, []);
		return cleanClasses;
	}

	findIfRelatedClass(className) {
		const classNameWithoutDash = className.split('-');

		const classesGroup = groups.find((group) => {
			return group.related.includes(classNameWithoutDash[0]);
		});

		if (classesGroup === undefined) {
			return false;
		}

		// Check if the main class is present
		const isInMain = this.classesList.some((className) => {
			return classesGroup.main.some((mainClass) => {
				return mainClass.startsWith(className);
			});
		});

		return isInMain;
	}

	/**
	 * Check if the class should be sorted.
	 *
	 * Class can be omitted from sorting if:
	 * - It is a related class and the main class exists
	 * - It is a class that has already been added to the new list
	 * - It is a class that has a modifier (e.g. dark:, md:, lg: .. etc)
	 * - It is an empty string
	 *
	 * @param  {string}  className Class name to check
	 * @return {boolean}           True if the class should be sorted
	 */
	shouldSortClass(className) {
		const trimmedClassName = className.trim().replaceAll(/^(?<prefix>!|-)/ug, '');

		// Check if the class is part of related class and that the main class also exist
		// If the main class does not exist, then we need to skip the related class
		const isRelatedClass = this.findIfRelatedClass(trimmedClassName);

		// Because we can not modify the array while looping through it
		// we need to skip classes that have already been added to the new list
		const shouldSkip = this.skipClasses.includes(trimmedClassName);

		// Check if the class has a modifier (e.g. dark:, md:, lg: .. etc)
		const hasModifier = trimmedClassName.match(/^(?<modifier>[A-Za-z]+:)+/u);

		return trimmedClassName !== '' && hasModifier === null && shouldSkip !== true && isRelatedClass !== true;
	}

	/**
	 * Sort classes.
	 * First get all classes without a modifier and sort alphabetically.
	 * Then for each class, find other classes with the same name
	 * that have modifiers.
	 *
	 * @param {Array} classes List of classes
	 */
	sortClasses(classes) {
		// Split the class value into an array and sort it
		this.classesList = this.groupClasses(classes).sort();

		const classListClone = [...this.classesList];

		// Loop through the classes and get classnames without any prefixes
		this.classesList.forEach((className) => {
			const canProceed = this.shouldSortClass(className);
			if (canProceed === false) {
				return;
			}

			this.sortedClasses.push(className);
			this.removeFromArray(classListClone, className);

			/*
			Find all the classes that have the same classname.
			Some tailwind classes have a dash like (text-sm, pr-2),
			so we need to check for the value of the class
			name without the dash
			*/
			const [classWithoutDash] = className.split('-');

			const classVariants = classListClone.filter((item) => {
				// Search by regex
				const regex = new RegExp(`^(|-)*([A-Za-z]+:)+${classWithoutDash}`, 'u');
				return item.match(regex) !== null;
			});

			if (classVariants.length > 0) {
				const sortedVariants = this.sortResponsiveClasses(classVariants.sort());

				// Add the variants to the list
				this.sortedClasses.push(...sortedVariants);

				// Remove from cloned list
				this.removeFromArray(classListClone, classVariants);
			}

			// Check if there are classes in the predfined group
			const relatedClasses = this.getRelatedClasses(className);

			if (relatedClasses === false) {
				return;
			}

			// Loop through predefined classes and check if they exist
			relatedClasses.forEach((relatedClass) => {
				const getRelatedClasses = classListClone.filter((className) => {
					const regex = new RegExp(`^(!|-)*([A-Za-z]+:)*${relatedClass}`, 'u');
					return className.match(regex) !== null;
				});

				if (getRelatedClasses.length === 0) {
					return;
				}

				// Sort classes by breakpoint, smallest to largest
				const sortedRelatedClasses = this.sortResponsiveClasses(getRelatedClasses.sort());

				this.sortedClasses.push(...sortedRelatedClasses);
				this.skipClasses.push(...sortedRelatedClasses);

				this.removeFromArray(classListClone, getRelatedClasses);
			});
		});

		if (classListClone.length === 0) {
			this.sortedClasses = this.sortedClasses.join(this.space);
			return;
		}

		// Sort and push the remaining classes
		const sortedClasses = this.sortResponsiveClasses(classListClone.sort());
		this.sortedClasses.push(...sortedClasses);

		this.sortedClasses = this.sortedClasses.join(this.space);
	}

	getRelatedClasses(className) {
		const relatedClasses = groups.find((group) => {
			return group.main.some((mainClass) => {
				const cleanClassName = className.replaceAll(/^(?<prefix>!|-)/ug, '');
				return cleanClassName.startsWith(mainClass);
			});
		});

		if (relatedClasses === undefined) {
			return false;
		}

		return relatedClasses.related;
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
			description: 'Sort tailwind classes',
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
					new Tailwind(context, node);
				},
			}
		);
	},
};