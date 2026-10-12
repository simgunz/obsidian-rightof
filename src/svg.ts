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
	if (root.nodeName !== 'svg' || parsed.querySelector('parsererror')) return null;
	return doc.importNode(root, true) as unknown as SVGSVGElement;
}
