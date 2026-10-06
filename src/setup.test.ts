import { expect, test } from 'vitest';
import { Plugin } from 'obsidian';

test('the obsidian alias resolves to the mock', () => {
	expect(Plugin).toBeTypeOf('function');
});
