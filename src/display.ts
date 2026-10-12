import { errorTitle, renderDiagram, type RenderFailure, type RenderOptions } from './render';
import { parseSvg, uniquifyIds } from './svg';

const MAX_SIZE_PX = 100_000;

/** Renders a diagram into `el`. Returns the inserted SVG, or null when an error box was shown instead. */
export function showDiagram(el: HTMLElement, source: string, options: RenderOptions): SVGSVGElement | null {
	const result = renderDiagram(source, options);
	if (!result.ok) {
		showError(el, result);
		return null;
	}
	const svg = parseSvg(el.ownerDocument, result.svg);
	if (!svg) {
		showError(el, { ok: false, message: 'the diagram could not be displayed' });
		return null;
	}
	if (!fitsOnScreen(svg)) {
		showError(el, { ok: false, message: 'the diagram is too large to display' });
		return null;
	}
	uniquifyIds(svg);
	el.appendChild(svg);
	return svg;
}

export function renderOptions(el: HTMLElement): RenderOptions {
	return { dark: el.ownerDocument.body.classList.contains('theme-dark'), background: noteBackground(el) };
}

export function sameOptions(a: RenderOptions, b: RenderOptions): boolean {
	return a.dark === b.dark && a.background === b.background;
}

/** Read from body: a block can still be detached when it renders, and detached elements resolve no variables. */
export function noteBackground(el: HTMLElement): string {
	const body = el.ownerDocument.body;
	return body.ownerDocument.defaultView?.getComputedStyle(body).getPropertyValue('--background-primary').trim() ?? '';
}

function fitsOnScreen(svg: SVGSVGElement): boolean {
	return ['width', 'height'].every((name) => {
		const size = Number(svg.getAttribute(name));
		return size > 0 && size <= MAX_SIZE_PX;
	});
}

function showError(el: HTMLElement, failure: RenderFailure): void {
	const box = el.createDiv({ cls: 'rightof-error' });
	box.createDiv({ cls: 'rightof-error-title', text: errorTitle(failure) });
	box.createEl('pre', { cls: 'rightof-error-message', text: failure.message });
}
