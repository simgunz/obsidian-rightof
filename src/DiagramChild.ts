import { App, MarkdownRenderChild } from 'obsidian';
import { errorTitle, renderDiagram, type RenderFailure } from './render';

export class DiagramChild extends MarkdownRenderChild {
	private dark = false;

	constructor(
		containerEl: HTMLElement,
		private readonly app: App,
		private readonly source: string,
	) {
		super(containerEl);
	}

	onload(): void {
		this.render();
		this.registerEvent(
			this.app.workspace.on('css-change', () => {
				if (isDarkMode(this.containerEl) !== this.dark) this.render();
			}),
		);
	}

	private render(): void {
		this.dark = isDarkMode(this.containerEl);
		const el = this.containerEl;
		el.empty();
		el.addClass('rightof-diagram');
		const result = renderDiagram(this.source, { dark: this.dark });
		if (!result.ok) {
			showError(el, result);
			return;
		}
		const svg = parseSvg(el.ownerDocument, result.svg);
		if (svg) el.appendChild(svg);
		else showError(el, { ok: false, message: 'the diagram could not be displayed' });
	}
}

function isDarkMode(el: HTMLElement): boolean {
	return el.ownerDocument.body.hasClass('theme-dark');
}

function parseSvg(doc: Document, markup: string): Element | null {
	const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');
	const root = parsed.documentElement;
	if (root.nodeName !== 'svg' || parsed.querySelector('parsererror')) return null;
	return doc.importNode(root, true);
}

function showError(el: HTMLElement, failure: RenderFailure): void {
	const box = el.createDiv({ cls: 'rightof-error' });
	box.createDiv({ cls: 'rightof-error-title', text: errorTitle(failure) });
	box.createEl('pre', { cls: 'rightof-error-message', text: failure.message });
}
