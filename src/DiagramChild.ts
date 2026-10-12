import { App, MarkdownRenderChild, setIcon } from 'obsidian';
import { DiagramModal } from './DiagramModal';
import { renderOptions, sameOptions, showDiagram } from './display';
import type { RenderOptions } from './render';

export class DiagramChild extends MarkdownRenderChild {
	private options: RenderOptions = { dark: false };

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
				if (!sameOptions(renderOptions(this.containerEl), this.options)) this.render();
			}),
		);
	}

	private render(): void {
		const el = this.containerEl;
		this.options = renderOptions(el);
		el.empty();
		el.addClass('rightof-diagram');
		const svg = showDiagram(el, this.source, this.options);
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
