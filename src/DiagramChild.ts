import { App, MarkdownRenderChild, setIcon } from 'obsidian';
import { DiagramModal } from './DiagramModal';
import { renderDiagram } from './render';
import { isDarkMode, noteBackground, showResult } from './svg';

export class DiagramChild extends MarkdownRenderChild {
	private dark = false;
	private background = '';

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
				const el = this.containerEl;
				if (isDarkMode(el) !== this.dark || noteBackground(el) !== this.background) this.render();
			}),
		);
	}

	private render(): void {
		const el = this.containerEl;
		this.dark = isDarkMode(el);
		this.background = noteBackground(el);
		el.empty();
		el.addClass('rightof-diagram');
		const svg = showResult(el, renderDiagram(this.source, { dark: this.dark, background: this.background }));
		if (svg) this.addExpandButton(el);
	}

	private addExpandButton(el: HTMLElement): void {
		const actions = el.createDiv({ cls: 'rightof-actions' });
		const button = actions.createEl('button', {
			cls: 'clickable-icon rightof-expand',
			attr: { 'aria-label': 'Open diagram' },
		});
		setIcon(button, 'maximize-2');
		// In Live Preview, a mousedown that reaches the editor moves the cursor into the block.
		button.addEventListener('mousedown', (event) => {
			event.preventDefault();
			event.stopPropagation();
		});
		button.addEventListener('click', (event) => {
			event.preventDefault();
			event.stopPropagation();
			new DiagramModal(this.app, this.source).open();
		});
	}
}
