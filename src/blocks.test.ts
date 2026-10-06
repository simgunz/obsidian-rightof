import { describe, expect, test } from 'vitest';
import { blockAt, findBlocks } from './blocks';

function note(...lines: string[]): string {
	return lines.join('\n');
}

describe('findBlocks', () => {
	test('finds a backtick block with its fence lines and source', () => {
		const text = note('intro', '```reladraw', 'node a "A"', 'node b "B" right of a', '```', 'outro');

		expect(findBlocks(text)).toEqual([{ startLine: 1, endLine: 4, source: 'node a "A"\nnode b "B" right of a' }]);
	});

	test('finds a tilde block', () => {
		expect(findBlocks(note('~~~reladraw', 'node a', '~~~'))).toEqual([{ startLine: 0, endLine: 2, source: 'node a' }]);
	});

	test('a closing fence may be longer, but not shorter or of the other character', () => {
		const text = note('````reladraw', 'node a', '```', '~~~~', '`````', 'after');

		expect(findBlocks(text)).toEqual([{ startLine: 0, endLine: 4, source: 'node a\n```\n~~~~' }]);
	});

	test('an unclosed block runs to the end of the note', () => {
		expect(findBlocks(note('```reladraw', 'node a', 'node b below a'))).toEqual([
			{ startLine: 0, endLine: 2, source: 'node a\nnode b below a' },
		]);
	});

	test('ignores a reladraw fence written inside another code block', () => {
		const text = note('```js', '```reladraw', 'not a diagram', '```', '```reladraw', 'node real', '```');

		expect(findBlocks(text)).toEqual([{ startLine: 4, endLine: 6, source: 'node real' }]);
	});

	test('finds every block in order', () => {
		const text = note('```reladraw', 'node one', '```', 'text', '```reladraw', 'node two', '```');

		expect(findBlocks(text).map((block) => block.source)).toEqual(['node one', 'node two']);
	});

	test('accepts up to three spaces of indent and spaces around the language', () => {
		expect(findBlocks(note('   ``` reladraw ', 'node a', '   ```')).map((b) => b.source)).toEqual(['node a']);
		expect(findBlocks(note('    ```reladraw', 'node a', '    ```'))).toEqual([]);
	});

	test('a backtick line whose info string holds a backtick is not a fence', () => {
		expect(findBlocks(note('```reladraw `x`', 'node a', '```reladraw', 'node b', '```')).map((b) => b.source)).toEqual(['node b']);
	});

	test('ignores other languages and a language that only starts with reladraw', () => {
		expect(findBlocks(note('```mermaid', 'a --> b', '```', '```reladrawx', 'x', '```'))).toEqual([]);
	});
});

describe('blockAt', () => {
	const blocks = findBlocks(note('```reladraw', 'node one', '```', 'text', '```reladraw', 'node two', '```'));

	test('picks the block whose fences enclose the line', () => {
		expect(blockAt(blocks, 5)?.source).toBe('node two');
	});

	test('counts the fence lines as part of the block', () => {
		expect(blockAt(blocks, 0)?.source).toBe('node one');
		expect(blockAt(blocks, 6)?.source).toBe('node two');
	});

	test('finds nothing between blocks', () => {
		expect(blockAt(blocks, 3)).toBeUndefined();
	});
});
