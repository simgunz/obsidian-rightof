import { describe, expect, test } from 'vitest';
import { renderDiagram } from './render';

describe('renderDiagram', () => {
	test('a valid block becomes an svg', () => {
		const result = renderDiagram('node a "A"', { dark: false });

		expect(result.ok).toBe(true);
		if (result.ok) expect(result.svg).toMatch(/^<svg[\s>]/);
	});

	test('a source error reports its line and message', () => {
		const result = renderDiagram('node a "A"\nnode b "B"\nnod c', { dark: false });

		expect(result).toEqual({ ok: false, line: 3, message: 'unknown statement "nod"' });
	});

	test('an empty block is an error', () => {
		const result = renderDiagram('', { dark: false });

		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.message).not.toBe('');
	});

	test('an error that is not a source error has no line', () => {
		const result = renderDiagram('node a "A"', { dark: false, compile: () => { throw new Error('boom'); } });

		expect(result).toEqual({ ok: false, message: 'boom' });
	});
});
