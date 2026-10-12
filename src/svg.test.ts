import { compile } from 'reladraw';
import { describe, expect, test } from 'vitest';
import { parseSvg, uniquifyIds } from './svg';

function parse(markup: string): SVGSVGElement {
	return new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement as unknown as SVGSVGElement;
}

const markup = compile('node a "A"\nnode b "B" right of a\nedge a -> b');

describe('uniquifyIds', () => {
	test('two copies of one diagram get different ids', () => {
		const first = parse(markup);
		const second = parse(markup);

		uniquifyIds(first);
		uniquifyIds(second);

		const ids = (svg: SVGSVGElement) => Array.from(svg.querySelectorAll('[id]'), (el) => el.id);
		expect(ids(first).length).toBeGreaterThan(0);
		expect(ids(first).filter((id) => ids(second).includes(id))).toEqual([]);
	});

	test('every reference points at an id of its own copy', () => {
		const svg = parse(markup);

		uniquifyIds(svg);

		const ids = new Set(Array.from(svg.querySelectorAll('[id]'), (el) => el.id));
		const references = Array.from(svg.querySelectorAll('*')).flatMap((el) =>
			Array.from(el.attributes).flatMap((attr) => Array.from(attr.value.matchAll(/url\(#([^)]+)\)/g), (m) => m[1]!)),
		);
		expect(references.length).toBeGreaterThan(0);
		expect(references.every((id) => ids.has(id))).toBe(true);
	});

	test('rewrites href references too', () => {
		const svg = parse('<svg xmlns="http://www.w3.org/2000/svg"><defs><path id="p"/></defs><use href="#p"/></svg>');

		uniquifyIds(svg);

		const id = svg.querySelector('path')!.id;
		expect(id).not.toBe('p');
		expect(svg.querySelector('use')!.getAttribute('href')).toBe(`#${id}`);
	});
});

describe('parseSvg', () => {
	test('returns the svg root for valid markup', () => {
		expect(parseSvg(document, markup)?.nodeName).toBe('svg');
	});

	test('returns null for markup that is not well formed', () => {
		expect(parseSvg(document, '<svg><g></svg>')).toBeNull();
	});

	test('returns null when the root is not an svg', () => {
		expect(parseSvg(document, '<div xmlns="http://www.w3.org/1999/xhtml"/>')).toBeNull();
	});
});
