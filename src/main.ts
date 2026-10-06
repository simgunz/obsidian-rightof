import { Plugin } from 'obsidian';
import { DiagramChild } from './DiagramChild';

export default class RightOfPlugin extends Plugin {
	async onload() {
		this.registerMarkdownCodeBlockProcessor('reladraw', (source, el, ctx) => {
			ctx.addChild(new DiagramChild(el, this.app, source));
		});
	}
}
