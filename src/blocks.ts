export interface Block {
	startLine: number;
	endLine: number;
	source: string;
}

const OPENING = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const CLOSING = /^ {0,3}(`{3,}|~{3,})\s*$/;

interface OpenFence {
	marker: string;
	startLine: number;
	reladraw: boolean;
}

export function findBlocks(text: string): Block[] {
	const lines = text.split('\n');
	const blocks: Block[] = [];
	let open: OpenFence | undefined;

	lines.forEach((line, index) => {
		if (!open) {
			const match = OPENING.exec(line);
			if (!match) return;
			const marker = match[1]!;
			const info = match[2]!.trim();
			// A backtick fence's info string cannot contain a backtick.
			if (marker.startsWith('`') && info.includes('`')) return;
			open = { marker, startLine: index, reladraw: info.split(/\s+/)[0] === 'reladraw' };
			return;
		}
		const match = CLOSING.exec(line);
		if (match && match[1]![0] === open.marker[0] && match[1]!.length >= open.marker.length) {
			if (open.reladraw) blocks.push(toBlock(lines, open.startLine, index));
			open = undefined;
		}
	});

	if (open?.reladraw) blocks.push(toBlock(lines, open.startLine, lines.length - 1, true));
	return blocks;
}

export function blockAt(blocks: Block[], line: number): Block | undefined {
	return blocks.find((block) => block.startLine <= line && line <= block.endLine);
}

function toBlock(lines: string[], startLine: number, endLine: number, unclosed = false): Block {
	const body = lines.slice(startLine + 1, unclosed ? endLine + 1 : endLine);
	return { startLine, endLine, source: body.join('\n') };
}
