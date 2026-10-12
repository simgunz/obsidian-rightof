let copies = 0;

/**
 * reladraw derives ids from the diagram, so two copies of one diagram share them.
 * `url(#id)` then resolves to the first copy in the document, and a marker in a
 * hidden view never paints.
 */
export function uniquifyIds(svg: SVGSVGElement): void {
	const suffix = `-rightof${++copies}`;
	const renamed = new Map<string, string>();
	for (const el of svg.querySelectorAll('[id]')) {
		renamed.set(el.id, el.id + suffix);
		el.id += suffix;
	}
	if (renamed.size === 0) return;
	for (const el of [svg, ...svg.querySelectorAll('*')]) {
		for (const attr of el.attributes) {
			let value = attr.value.replace(/url\((['"]?)#([^'")]+)\1\)/g, (match, quote: string, id: string) =>
				renamed.has(id) ? `url(${quote}#${renamed.get(id)}${quote})` : match,
			);
			if (attr.localName === 'href') {
				value = value.replace(/^#(.+)$/, (match, id: string) => (renamed.has(id) ? `#${renamed.get(id)}` : match));
			}
			if (value !== attr.value) el.setAttributeNS(attr.namespaceURI, attr.name, value);
		}
	}
}

export function parseSvg(doc: Document, markup: string): SVGSVGElement | null {
	const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');
	const root = parsed.documentElement;
	if (root.namespaceURI !== SVG_NS || root.localName !== 'svg' || parsed.querySelector('parsererror')) return null;
	// Clean while the tree is still inert: nothing in a DOMParser document runs before it is imported.
	sanitizeSvg(root as unknown as SVGSVGElement);
	return doc.importNode(root, true) as unknown as SVGSVGElement;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';
const XML_NS = 'http://www.w3.org/XML/1998/namespace';
const XMLNS_NS = 'http://www.w3.org/2000/xmlns/';

/** reladraw's own output uses the first eleven; the rest are safe shapes and paints a pasted icon may use. */
const ALLOWED_ELEMENTS = new Set([
	'svg', 'g', 'defs', 'path', 'rect', 'circle', 'text', 'tspan', 'marker', 'mask', 'a',
	'ellipse', 'line', 'polyline', 'polygon', 'clipPath', 'linearGradient', 'radialGradient', 'stop', 'title', 'desc',
]);

/**
 * Geometry and paint only. Obsidian opens its own links from `class` and `data-*`,
 * and a page can act on almost any other attribute, so nothing else is kept.
 */
const ALLOWED_ATTRIBUTES = new Set([
	'id', 'href', 'target', 'rel', 'role', 'aria-label', 'aria-hidden', 'version',
	'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'fx', 'fy', 'fr', 'dx', 'dy',
	'width', 'height', 'd', 'points', 'pathLength', 'viewBox', 'preserveAspectRatio', 'transform', 'transform-origin',
	'markerWidth', 'markerHeight', 'markerUnits', 'refX', 'refY', 'orient',
	'maskUnits', 'maskContentUnits', 'clipPathUnits', 'gradientUnits', 'gradientTransform', 'spreadMethod', 'offset',
	'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linecap',
	'stroke-linejoin', 'stroke-miterlimit', 'stroke-dasharray', 'stroke-dashoffset', 'opacity', 'color',
	'stop-color', 'stop-opacity', 'clip-path', 'clip-rule', 'mask', 'marker-start', 'marker-mid', 'marker-end',
	'visibility', 'display', 'overflow', 'paint-order', 'vector-effect', 'shape-rendering', 'text-rendering',
	'font-family', 'font-size', 'font-weight', 'font-style', 'font-variant', 'font-stretch', 'text-anchor',
	'dominant-baseline', 'alignment-baseline', 'baseline-shift', 'letter-spacing', 'word-spacing',
	'text-decoration', 'writing-mode', 'direction', 'unicode-bidi', 'white-space', 'textLength', 'lengthAdjust',
]);

/** Functions that only compute a colour or a transform, plus `url()`, which must point inside the document. */
const ALLOWED_FUNCTIONS = new Set(['url', 'rgb', 'rgba', 'hsl', 'hsla', 'matrix', 'translate', 'scale', 'rotate', 'skewX', 'skewY']);

/**
 * Note text is untrusted, and reladraw copies a pasted icon's SVG into its output almost as written.
 * Keep only drawing: no scripts, HTML, style sheets, handlers, outside references or non-web links.
 */
export function sanitizeSvg(svg: SVGSVGElement): void {
	removeNonElementMarkup(svg);
	for (const el of [...svg.querySelectorAll('*')]) {
		if (!svg.contains(el)) continue;
		if (el.namespaceURI !== SVG_NS || !ALLOWED_ELEMENTS.has(el.localName)) {
			el.remove();
			continue;
		}
		if (el.localName === 'a' && !isWebLinkOnly(el)) {
			el.replaceWith(...el.childNodes);
		}
	}
	for (const el of [svg, ...svg.querySelectorAll('*')]) {
		cleanAttributes(el);
		if (el.localName === 'a') {
			el.setAttribute('target', '_blank');
			el.setAttribute('rel', 'noopener noreferrer');
		}
	}
}

/** A comment or processing instruction is inert here, but turns into live HTML if the SVG is ever reparsed as HTML. */
function removeNonElementMarkup(svg: SVGSVGElement): void {
	const walker = svg.ownerDocument.createTreeWalker(svg, NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_PROCESSING_INSTRUCTION);
	const found: Node[] = [];
	while (walker.nextNode()) found.push(walker.currentNode);
	for (const node of found) node.parentNode?.removeChild(node);
}

function cleanAttributes(el: Element): void {
	for (const attr of [...el.attributes]) {
		const ns = attr.namespaceURI;
		const name = attr.localName;
		const isHref = name === 'href' && (ns === null || ns === XLINK_NS);
		const safe =
			ns === XMLNS_NS ||
			(ns === XML_NS && name === 'space') ||
			isHref ||
			(ns === null && ALLOWED_ATTRIBUTES.has(name) && isSafeValue(attr.value));
		// An <a> keeps its href only after isWebLinkOnly passed; elsewhere href may only point inside the document.
		if (!safe || (isHref && el.localName !== 'a' && !attr.value.startsWith('#'))) el.removeAttributeNode(attr);
	}
}

/**
 * CSS reads `\75 rl(` as `url(`, so a value with an escape is never safe,
 * and every other function name must be one that cannot load anything.
 */
function isSafeValue(value: string): boolean {
	if (value.includes('\\')) return false;
	const calls = [...value.matchAll(/([A-Za-z-]+)\(([^()]*)/g)];
	return (
		calls.length === value.split('(').length - 1 &&
		calls.every(([, name, args]) => ALLOWED_FUNCTIONS.has(name!) && (name !== 'url' || /^\s*['"]?#/.test(args!)))
	);
}

/** Both link attributes count: which one wins depends on the renderer. */
function isWebLinkOnly(el: Element): boolean {
	const links = [el.getAttribute('href'), el.getAttributeNS(XLINK_NS, 'href')].filter((href) => href !== null);
	return links.length > 0 && links.every(isWebLink);
}

function isWebLink(href: string): boolean {
	try {
		const url = new URL(href);
		return (url.protocol === 'http:' || url.protocol === 'https:') && href === href.trim();
	} catch {
		return false;
	}
}
