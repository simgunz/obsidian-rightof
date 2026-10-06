import { errorTitle, type RenderFailure, type RenderResult } from './render';

export function showResult(el: HTMLElement, result: RenderResult): SVGSVGElement | null {
	if (!result.ok) {
		showError(el, result);
		return null;
	}
	const svg = parseSvg(el.ownerDocument, result.svg);
	if (svg) el.appendChild(svg);
	else showError(el, { ok: false, message: 'the diagram could not be displayed' });
	return svg;
}

export function isDarkMode(el: HTMLElement): boolean {
	return el.ownerDocument.body.hasClass('theme-dark');
}

function parseSvg(doc: Document, markup: string): SVGSVGElement | null {
	const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');
	const root = parsed.documentElement;
	if (root.nodeName !== 'svg' || parsed.querySelector('parsererror')) return null;
	return doc.importNode(root, true) as unknown as SVGSVGElement;
}

function showError(el: HTMLElement, failure: RenderFailure): void {
	const box = el.createDiv({ cls: 'rightof-error' });
	box.createDiv({ cls: 'rightof-error-title', text: errorTitle(failure) });
	box.createEl('pre', { cls: 'rightof-error-message', text: failure.message });
}
