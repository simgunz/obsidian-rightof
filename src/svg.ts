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

/** reladraw's own output uses the first eleven; the rest are safe shapes and paints a pasted icon may use. */
const ALLOWED_ELEMENTS = new Set([
	'svg', 'g', 'defs', 'path', 'rect', 'circle', 'text', 'tspan', 'marker', 'mask', 'a',
	'ellipse', 'line', 'polyline', 'polygon', 'clipPath', 'linearGradient', 'radialGradient', 'stop', 'title', 'desc',
]);

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
		if (el.localName === 'a' && !isWebLink(linkOf(el))) {
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
		const known = ns === null || ns === XLINK_NS || ns === XML_NS || ns === 'http://www.w3.org/2000/xmlns/';
		const isHref = name === 'href' && (ns === null || ns === XLINK_NS);
		const unsafe =
			!known ||
			name.toLowerCase().startsWith('on') ||
			name === 'style' ||
			(isHref && el.localName !== 'a' && !attr.value.startsWith('#')) ||
			(!isHref && ns === XLINK_NS) ||
			/url\(\s*(?!['"]?#)/i.test(attr.value);
		if (unsafe) el.removeAttributeNode(attr);
	}
}

function linkOf(el: Element): string {
	return el.getAttribute('href') ?? el.getAttributeNS(XLINK_NS, 'href') ?? '';
}

function isWebLink(href: string): boolean {
	try {
		const url = new URL(href);
		return (url.protocol === 'http:' || url.protocol === 'https:') && href === href.trim();
	} catch {
		return false;
	}
}
