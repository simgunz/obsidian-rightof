export interface Block {
	startLine: number;
	endLine: number;
	source: string;
}

// Any indent opens a fence: inside list items Obsidian renders fences indented past three spaces.
const OPENING = /^( *)(`{3,}|~{3,})(.*)$/;
const CLOSING = /^( *)(`{3,}|~{3,})\s*$/;
const QUOTE = /^ {0,3}> ?/;

interface OpenFence {
	marker: string;
	indent: number;
	depth: number;
	startLine: number;
	reladraw: boolean;
	body: string[];
}

export function findBlocks(text: string): Block[] {
	const lines = text.split(/\r?\n/);
	const blocks: Block[] = [];
	let open: OpenFence | undefined;
	let inComment = false;
	const first = frontmatterEnd(lines);

	for (let index = first; index < lines.length; index++) {
		const { depth, rest } = unquote(lines[index]!);

		if (open) {
			if (depth < open.depth) {
				if (open.reladraw) blocks.push(toBlock(open, index - 1));
				open = undefined;
			} else {
				const content = stripQuotes(lines[index]!, open.depth);
				const closing = CLOSING.exec(content);
				if (
					closing &&
					closing[1]!.length <= open.indent + 3 &&
					closing[2]![0] === open.marker[0] &&
					closing[2]!.length >= open.marker.length
				) {
					if (open.reladraw) blocks.push(toBlock(open, index));
					open = undefined;
				} else {
					open.body.push(content.replace(new RegExp(`^ {0,${open.indent}}`), ''));
				}
				continue;
			}
		}

		if (inComment) {
			if (countComments(rest) % 2 === 1) inComment = false;
			continue;
		}
		const opening = OPENING.exec(rest);
		if (opening) {
			const marker = opening[2]!;
			const info = opening[3]!.trim();
			// A backtick fence's info string cannot contain a backtick.
			if (marker.startsWith('`') && info.includes('`')) continue;
			open = {
				marker,
				indent: opening[1]!.length,
				depth,
				startLine: index,
				reladraw: info.split(/\s+/)[0] === 'reladraw',
				body: [],
			};
			continue;
		}
		if (countComments(rest) % 2 === 1) inComment = true;
	}

	if (open?.reladraw) blocks.push(toBlock(open, lines.length - 1));
	return blocks;
}

export function blockAt(blocks: Block[], line: number): Block | undefined {
	return blocks.find((block) => block.startLine <= line && line <= block.endLine);
}

function toBlock(open: OpenFence, endLine: number): Block {
	return { startLine: open.startLine, endLine, source: open.body.join('\n') };
}

function frontmatterEnd(lines: string[]): number {
	if (lines[0] !== '---') return 0;
	const end = lines.findIndex((line, index) => index > 0 && (line === '---' || line === '...'));
	return end === -1 ? 0 : end + 1;
}

function unquote(line: string): { depth: number; rest: string } {
	let depth = 0;
	let rest = line;
	while (QUOTE.test(rest)) {
		rest = rest.replace(QUOTE, '');
		depth++;
	}
	return { depth, rest };
}

function stripQuotes(line: string, depth: number): string {
	let rest = line;
	for (let i = 0; i < depth; i++) rest = rest.replace(QUOTE, '');
	return rest;
}

function countComments(line: string): number {
	return line.split('%%').length - 1;
}
