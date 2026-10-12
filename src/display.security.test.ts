import { expect, test } from 'vitest';
import { showDiagram } from './display';

const hostile = [
	'icon evil """<svg viewBox="0 0 10 10">',
	'<foreignObject width="10" height="10"><div xmlns="http://www.w3.org/1999/xhtml">x</div></foreignObject>',
	'<style>*{display:none}</style>',
	'<image href="https://example.com/track.png" width="1" height="1"/>',
	'<a href="javascript:alert(1)"><rect width="5" height="5"/></a>',
	'</svg>"""',
	'node a "A" icon: evil',
	'node b "Run" right of a url: "javascript:alert(3)"',
	'node c "Docs" right of b url: "https://example.com/docs"',
].join('\n');

test('a hostile note reaches the page as drawing only', () => {
	const el = document.createElement('div');

	const svg = showDiagram(el, hostile, { dark: false });

	expect(svg).not.toBeNull();
	expect(el.querySelectorAll('foreignObject, style, image, script')).toHaveLength(0);
	const attributes = Array.from(el.querySelectorAll('*')).flatMap((node) => Array.from(node.attributes, (a) => a.name));
	expect(attributes.filter((name) => name.startsWith('on'))).toEqual([]);
	expect(Array.from(el.querySelectorAll('a'), (a) => a.getAttribute('href'))).toEqual(['https://example.com/docs']);
	expect(el.textContent).toContain('Run');
});
