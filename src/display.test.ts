import { afterEach, describe, expect, test } from 'vitest';
import { noteBackground, renderOptions, sameOptions } from './display';

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
