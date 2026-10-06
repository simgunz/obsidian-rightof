import { describe, expect, test } from 'vitest';
import { fit, MAX_SCALE, MIN_SCALE, panBy, zoomAt, type View } from './viewport';

function screen(view: View, x: number, y: number) {
	return { x: view.x + x * view.scale, y: view.y + y * view.scale };
}

describe('zoomAt', () => {
	test('keeps the point under the pointer in place', () => {
		const view = { scale: 1, x: 10, y: 20 };
		const point = { x: 110, y: 70 };
		const diagramPoint = { x: 100, y: 50 };

		const zoomed = zoomAt(view, 2, point);

		expect(zoomed.scale).toBe(2);
		expect(screen(zoomed, diagramPoint.x, diagramPoint.y)).toEqual(point);
	});

	test('stops at the largest zoom', () => {
		const zoomed = zoomAt({ scale: 8, x: 0, y: 0 }, 4, { x: 0, y: 0 });

		expect(zoomed.scale).toBe(MAX_SCALE);
	});

	test('stops at the smallest zoom', () => {
		const zoomed = zoomAt({ scale: 0.2, x: 0, y: 0 }, 0.1, { x: 0, y: 0 });

		expect(zoomed.scale).toBe(MIN_SCALE);
	});

	test('a clamped zoom still keeps the point in place', () => {
		const view = { scale: 8, x: 0, y: 0 };
		const point = { x: 80, y: 40 };

		const zoomed = zoomAt(view, 4, point);

		expect(screen(zoomed, 10, 5)).toEqual(point);
	});
});

describe('fit', () => {
	test('enlarges a small diagram until one side fills the area, and centres it', () => {
		const view = fit({ width: 100, height: 50 }, { width: 500, height: 500 }, 0);

		expect(view).toEqual({ scale: 5, x: 0, y: 125 });
	});

	test('shrinks a large diagram until it fits, and centres it', () => {
		const view = fit({ width: 2000, height: 400 }, { width: 1000, height: 600 }, 0);

		expect(view).toEqual({ scale: 0.5, x: 0, y: 200 });
	});

	test('keeps the padding free on the tight side', () => {
		const view = fit({ width: 100, height: 100 }, { width: 240, height: 440 }, 20);

		expect(view).toEqual({ scale: 2, x: 20, y: 120 });
	});

	test('never goes past the zoom limits', () => {
		expect(fit({ width: 1, height: 1 }, { width: 1000, height: 1000 }, 0).scale).toBe(MAX_SCALE);
	});
});

describe('panBy', () => {
	test('moves the diagram by the drag distance', () => {
		expect(panBy({ scale: 2, x: 10, y: 10 }, -100, 30)).toEqual({ scale: 2, x: -90, y: 40 });
	});
});
