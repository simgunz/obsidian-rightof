import { MarkdownView, Plugin } from 'obsidian';
import { blockAt, findBlocks } from './blocks';
import { DiagramChild } from './DiagramChild';
import { DiagramModal } from './DiagramModal';

export default class RightOfPlugin extends Plugin {
	async onload() {
		this.registerMarkdownCodeBlockProcessor('reladraw', (source, el, ctx) => {
			ctx.addChild(new DiagramChild(el, this.app, source));
		});

		this.addCommand({
			id: 'open-diagram',
			name: 'Open reladraw diagram',
			checkCallback: (checking) => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (!view) return false;
				const blocks = findBlocks(view.getViewData());
				const first = blocks[0];
				if (!first) return false;
				if (!checking) {
					const atCursor = view.getMode() === 'source' ? blockAt(blocks, view.editor.getCursor().line) : undefined;
					new DiagramModal(this.app, (atCursor ?? first).source).open();
				}
				return true;
			},
		});
	}
}
