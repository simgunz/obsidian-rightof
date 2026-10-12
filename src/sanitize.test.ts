import { compile } from 'reladraw';
import { describe, expect, test } from 'vitest';
import { sanitizeSvg } from './svg';

const SVG_NS = 'http://www.w3.org/2000/svg';

function parse(markup: string): SVGSVGElement {
	return new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement as unknown as SVGSVGElement;
}

function clean(inner: string): SVGSVGElement {
	const svg = parse(`<svg xmlns="${SVG_NS}" xmlns:xlink="http://www.w3.org/1999/xlink">${inner}</svg>`);
	sanitizeSvg(svg);
	return svg;
}

function markupOf(svg: SVGSVGElement): string {
	return new XMLSerializer().serializeToString(svg);
}

describe('sanitizeSvg removes what could run or reach out', () => {
	test.each([
		['script', '<script>alert(1)</script>'],
		['foreignObject', '<foreignObject><div xmlns="http://www.w3.org/1999/xhtml">x</div></foreignObject>'],
		['style', '<style>*{display:none}</style>'],
		['image', '<image href="https://example.com/t.png"/>'],
		['namespaced script', '<h:script xmlns:h="http://www.w3.org/1999/xhtml">alert(1)</h:script>'],
		['animation', '<set attributeName="fill" to="red"/>'],
		['use to an outside file', '<use href="https://example.com/x.svg#a"/>'],
	])('%s', (_name, inner) => {
		const svg = clean(`${inner}<rect width="1" height="1"/>`);

		expect(Array.from(svg.querySelectorAll('*'), (el) => el.localName)).toEqual(['rect']);
	});

	test('event handlers and style attributes', () => {
		const svg = clean('<rect onclick="alert(1)" onload="x()" style="fill:url(https://e.com/p)" fill="red"/>');

		expect(markupOf(svg)).not.toMatch(/onclick|onload|style=/);
		expect(svg.querySelector('rect')!.getAttribute('fill')).toBe('red');
	});

	test('url() references to outside resources', () => {
		const svg = clean('<rect fill="url(https://example.com/p.svg#g)" mask="url(#m)"/>');

		const rect = svg.querySelector('rect')!;
		expect(rect.hasAttribute('fill')).toBe(false);
		expect(rect.getAttribute('mask')).toBe('url(#m)');
	});

	test('comments and processing instructions', () => {
		const svg = clean('<!-- note --><?x <img src=x onerror=alert(1)>?><rect/>');

		expect(Array.from(svg.childNodes, (node) => node.nodeName)).toEqual(['rect']);
	});

	test('a non-link href keeps only same-document references', () => {
		const svg = clean('<linearGradient id="g" href="#base"/><linearGradient id="h" xlink:href="https://e.com/x.svg#a"/>');

		const [first, second] = Array.from(svg.querySelectorAll('linearGradient'));
		expect(first!.getAttribute('href')).toBe('#base');
		expect(second!.hasAttribute('xlink:href')).toBe(false);
	});
});

describe('sanitizeSvg links', () => {
	test.each(['javascript:alert(1)', 'file:///etc/passwd', 'obsidian://open?vault=x', 'data:text/html,x', ' JavaScript:alert(1)'])(
		'%s loses its link but keeps its drawing',
		(href) => {
			const svg = clean(`<a href="${href}"><rect width="1" height="1"/></a>`);

			expect(svg.querySelector('a')).toBeNull();
			expect(svg.querySelector('rect')).not.toBeNull();
		},
	);

	test('a web href does not cover a non-web xlink:href on the same link', () => {
		const svg = clean('<a href="https://example.com" xlink:href="javascript:alert(1)"><rect/></a>');

		expect(svg.querySelector('a')).toBeNull();
		expect(svg.querySelector('rect')).not.toBeNull();
	});

	test('a web link stays and opens in a new window without an opener', () => {
		const svg = clean('<a href="https://example.com/x"><rect/></a>');

		const a = svg.querySelector('a')!;
		expect(a.getAttribute('href')).toBe('https://example.com/x');
		expect(a.getAttribute('target')).toBe('_blank');
		expect(a.getAttribute('rel')).toBe('noopener noreferrer');
	});
});

describe('sanitizeSvg keeps reladraw output intact', () => {
	test.each([
		['markers and labels', 'node a "A"\nnode b "B" right of a\nedge a -> b "HTTP"\nedge b -> a "back" from: bottom  to: bottom'],
		['styles, badges and icons', 'style s fill: theme-primary-subtle border: theme-primary badge: database\nnode a "A" style: s\nnode b icon: cube right of a\nnode c "Docs" shape: document below a'],
		['containers and decks', 'node box "Box"\nnode box.x "X"\nnode box.y "Y"\nnode d "Drive" deck: "Two" "Three" right of box'],
		['masks and dashed lines', 'node a "A"\nnode b "B" right of a\nnode c "C" below a\nedge a -> b line: (pattern: dashed)\nedge c -> b line: (crossing: arc)'],
		['web links', 'node a "A" url: "https://example.com"\nnode b "B" right of a\nedge a -> b'],
	])('%s', (_name, source) => {
		const svg = parse(compile(source));
		const before = markupOf(svg);

		sanitizeSvg(svg);

		expect(markupOf(svg).replace(' rel="noopener noreferrer"', ' rel="noopener"')).toBe(before);
	});
});
