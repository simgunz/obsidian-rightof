import { expect, test, vi } from 'vitest';
import { renderDiagram } from './render';

vi.mock('reladraw', async (importOriginal) => ({
	...(await importOriginal<typeof import('reladraw')>()),
	compile: () => {
		throw new Error('boom');
	},
}));

test('an error that is not a source error has no line', () => {
	expect(renderDiagram('node a "A"', { dark: false })).toEqual({ ok: false, message: 'boom' });
});
