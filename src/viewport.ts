export const MIN_SCALE = 0.1;
export const MAX_SCALE = 10;

export interface View {
	scale: number;
	x: number;
	y: number;
}

export interface Point {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}

export function zoomAt(view: View, factor: number, point: Point): View {
	const scale = clampScale(view.scale * factor);
	const ratio = scale / view.scale;
	return {
		scale,
		x: point.x - (point.x - view.x) * ratio,
		y: point.y - (point.y - view.y) * ratio,
	};
}

export function fit(content: Size, area: Size, padding: number): View {
	const scale = clampScale(
		Math.min((area.width - 2 * padding) / content.width, (area.height - 2 * padding) / content.height),
	);
	return {
		scale,
		x: (area.width - content.width * scale) / 2,
		y: (area.height - content.height * scale) / 2,
	};
}

export function panBy(view: View, dx: number, dy: number): View {
	return { scale: view.scale, x: view.x + dx, y: view.y + dy };
}

function clampScale(scale: number): number {
	return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}
