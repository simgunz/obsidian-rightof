import { THEMES } from 'reladraw';
import { describe, expect, test } from 'vitest';
import { errorTitle, renderDiagram } from './render';

function rectFills(svg: string): string[] {
	return Array.from(svg.matchAll(/<rect[^>]*fill="([^"]+)"/g), (m) => m[1]!);
}

function svgOf(source: string, dark: boolean, background = '#123456'): string {
	const result = renderDiagram(source, { dark, background });
	if (!result.ok) throw new Error(result.message);
	return result.svg;
}

const labelled = 'node a "A"\nnode b "B" right of a\nedge a -> b "HTTP"';

describe('theme', () => {
	test('dark mode uses the dark theme', () => {
		const svg = svgOf('node a "A"', true);

		expect(svg).toContain(THEMES.dark!.text);
		expect(svg).not.toContain(THEMES.light!.text);
	});

	test('light mode uses the light theme', () => {
		const svg = svgOf('node a "A"', false);

		expect(svg).toContain(THEMES.light!.text);
		expect(svg).not.toContain(THEMES.dark!.text);
	});

	test.each([true, false])('the page and the label boxes take the note background (dark: %s)', (dark) => {
		const fills = rectFills(svgOf(labelled, dark));

		expect(fills).toEqual(['#123456', '#123456']);
	});

	test('without a note background the theme keeps its own', () => {
		expect(rectFills(svgOf(labelled, false, ''))).toEqual([THEMES.light!.background, THEMES.light!.background]);
	});

	test('a block that sets its own background keeps it', () => {
		expect(rectFills(svgOf('diagram background: #ffeedd\nnode a "A"', false))[0]).toBe('#ffeedd');
	});

	test.each([true, false])('a named theme wins with its own background (dark: %s)', (dark) => {
		const fills = rectFills(svgOf('diagram theme: nord\n' + labelled, dark));

		expect(fills).toEqual([THEMES.nord!.background, THEMES.nord!.background]);
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
});

describe('errorTitle', () => {
	test('names the line when reladraw gives one', () => {
		expect(errorTitle({ ok: false, line: 3, message: 'x' })).toBe('reladraw: line 3');
	});

	test('stays generic without a line', () => {
		expect(errorTitle({ ok: false, message: 'x' })).toBe('reladraw:');
	});
});

describe('size limit', () => {
	test('a block over 64 KB is not compiled', () => {
		const source = `node a "${'x'.repeat(64_000)}"`;

		expect(renderDiagram(source, { dark: false })).toEqual({
			ok: false,
			message: 'the diagram is longer than 64 KB, the most this plugin draws',
		});
	});

	test('a block just under the limit is compiled', () => {
		expect(renderDiagram(`node a "${'x'.repeat(63_000)}"`, { dark: false }).ok).toBe(true);
	});
});
