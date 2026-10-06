import { THEMES } from 'reladraw';
import { describe, expect, test } from 'vitest';
import { renderDiagram } from './render';

function background(svg: string): string | undefined {
	return /<rect[^>]*fill="([^"]+)"/.exec(svg)?.[1];
}

function svgOf(source: string, dark: boolean): string {
	const result = renderDiagram(source, { dark });
	if (!result.ok) throw new Error(result.message);
	return result.svg;
}

describe('theme', () => {
	test('dark mode uses the dark theme on a transparent background', () => {
		const svg = svgOf('node a "A"', true);

		expect(background(svg)).toBe('transparent');
		expect(svg).toContain(THEMES.dark!.text);
		expect(svg).not.toContain(THEMES.light!.text);
	});

	test('light mode uses the light theme on a transparent background', () => {
		const svg = svgOf('node a "A"', false);

		expect(background(svg)).toBe('transparent');
		expect(svg).toContain(THEMES.light!.text);
		expect(svg).not.toContain(THEMES.dark!.text);
	});

	test.each([true, false])('a named theme wins with its own background (dark: %s)', (dark) => {
		const svg = svgOf('diagram theme: nord\nnode a "A"', dark);

		expect(background(svg)).toBe(THEMES.nord!.background);
	});
});

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
