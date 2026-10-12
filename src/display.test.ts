import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { noteBackground, renderOptions, sameOptions, showDiagram } from './display';

afterEach(() => {
	document.body.className = '';
	document.body.style.removeProperty('--background-primary');
});

describe('noteBackground', () => {
	test('reads the variable from body, even for a detached element', () => {
		document.body.style.setProperty('--background-primary', '#1c1c1c');

		expect(noteBackground(document.createElement('div'))).toBe('#1c1c1c');
	});

	test('is empty when the variable is not set', () => {
		expect(noteBackground(document.createElement('div'))).toBe('');
	});
});

describe('renderOptions', () => {
	test('follows the theme-dark class on body', () => {
		const el = document.createElement('div');
		expect(renderOptions(el).dark).toBe(false);

		document.body.classList.add('theme-dark');

		expect(renderOptions(el).dark).toBe(true);
	});

	test('two readings of an unchanged page are the same', () => {
		const el = document.createElement('div');

		expect(sameOptions(renderOptions(el), renderOptions(el))).toBe(true);
		expect(sameOptions({ dark: false, background: '#fff' }, { dark: false, background: '#000' })).toBe(false);
	});
});

describe('showDiagram', () => {
	beforeAll(() => {
		// Obsidian adds these helpers to every element; jsdom has none.
		Object.assign(HTMLElement.prototype, {
			createEl(this: HTMLElement, tag: string, o: { cls?: string; text?: string } = {}) {
				const child = this.appendChild(document.createElement(tag));
				child.className = o.cls ?? '';
				child.textContent = o.text ?? '';
				return child;
			},
			createDiv(this: HTMLElement, o?: { cls?: string; text?: string }) {
				return this.createEl('div', o);
			},
		});
	});

	test.each([
		['an infinite size', `1${'0'.repeat(400)}`],
		['a size no screen can hold', '99999999999999999999999'],
	])('shows an error for %s', (_name, size) => {
		const el = document.createElement('div');

		expect(showDiagram(el, `node a "A" (size: ${size})`, { dark: false })).toBeNull();
		expect(el.querySelector('svg')).toBeNull();
		expect(el.querySelector('.rightof-error')).not.toBeNull();
	});
});
