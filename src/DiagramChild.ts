import { App, MarkdownRenderChild } from 'obsidian';
import { renderDiagram } from './render';
import { isDarkMode, showResult } from './svg';

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
		showResult(el, renderDiagram(this.source, { dark: this.dark }));
	}
}
