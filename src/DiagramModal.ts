import { App, Modal, setIcon } from 'obsidian';
import { renderDiagram } from './render';
import { isDarkMode, showResult } from './svg';
import { fit, panBy, zoomAt, type Point, type Size, type View } from './viewport';

const BUTTON_STEP = 1.25;
const WHEEL_SPEED = 0.0015;
const LINE_HEIGHT_PX = 16;
const DRAG_THRESHOLD_PX = 3;
const FIT_PADDING_PX = 24;

export class DiagramModal extends Modal {
	private view: View = { scale: 1, x: 0, y: 0 };
	private natural: Size = { width: 0, height: 0 };
	private stage!: HTMLElement;
	private content!: HTMLElement;
	private zoomLevel!: HTMLButtonElement;

	constructor(
		app: App,
		private readonly source: string,
	) {
		super(app);
	}

	onOpen(): void {
		this.modalEl.addClass('rightof-modal');
		const toolbar = this.contentEl.createDiv({ cls: 'rightof-toolbar' });
		this.stage = this.contentEl.createDiv({ cls: 'rightof-stage' });
		this.content = this.stage.createDiv({ cls: 'rightof-stage-content' });

		const svg = showResult(this.content, renderDiagram(this.source, { dark: isDarkMode(this.contentEl) }));
		if (!svg) {
			toolbar.remove();
			this.stage.addClass('is-error');
			return;
		}
		this.natural = { width: Number(svg.getAttribute('width')), height: Number(svg.getAttribute('height')) };

		iconButton(toolbar, 'zoom-out', 'Zoom out', () => this.zoomAtCentre(1 / BUTTON_STEP));
		this.zoomLevel = toolbar.createEl('button', { cls: 'rightof-zoom-level', attr: { 'aria-label': 'Zoom to 100%' } });
		this.zoomLevel.addEventListener('click', () => this.zoomAtCentre(1 / this.view.scale));
		iconButton(toolbar, 'zoom-in', 'Zoom in', () => this.zoomAtCentre(BUTTON_STEP));
		iconButton(toolbar, 'scan', 'Fit to window', () => this.fitToStage());

		this.listen();
		window.requestAnimationFrame(() => this.fitToStage());
	}

	onClose(): void {
		this.contentEl.empty();
	}

	private listen(): void {
		this.stage.addEventListener(
			'wheel',
			(event) => {
				event.preventDefault();
				const delta = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? event.deltaY * LINE_HEIGHT_PX : event.deltaY;
				this.apply(zoomAt(this.view, Math.exp(-delta * WHEEL_SPEED), this.stagePoint(event)));
			},
			{ passive: false },
		);

		let last: Point | null = null;
		let travelled = 0;
		let swallowClick = false;
		this.stage.addEventListener('pointerdown', (event) => {
			if (event.button !== 0) return;
			this.stage.setPointerCapture(event.pointerId);
			last = { x: event.clientX, y: event.clientY };
			travelled = 0;
			swallowClick = false;
		});
		this.stage.addEventListener('pointermove', (event) => {
			if (!last) return;
			const dx = event.clientX - last.x;
			const dy = event.clientY - last.y;
			last = { x: event.clientX, y: event.clientY };
			travelled += Math.abs(dx) + Math.abs(dy);
			if (travelled > DRAG_THRESHOLD_PX) {
				swallowClick = true;
				this.stage.addClass('is-dragging');
			}
			this.apply(panBy(this.view, dx, dy));
		});
		const endDrag = (event: PointerEvent) => {
			if (!last) return;
			last = null;
			this.stage.removeClass('is-dragging');
			if (this.stage.hasPointerCapture(event.pointerId)) this.stage.releasePointerCapture(event.pointerId);
		};
		this.stage.addEventListener('pointerup', endDrag);
		this.stage.addEventListener('pointercancel', endDrag);
		// A drag that ends on a link must not follow it.
		this.stage.addEventListener(
			'click',
			(event) => {
				if (!swallowClick) return;
				swallowClick = false;
				event.preventDefault();
				event.stopPropagation();
			},
			{ capture: true },
		);
		this.stage.addEventListener('dblclick', () => this.fitToStage());
	}

	private stagePoint(event: MouseEvent): Point {
		const rect = this.stage.getBoundingClientRect();
		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	}

	private stageSize(): Size {
		return { width: this.stage.clientWidth, height: this.stage.clientHeight };
	}

	private zoomAtCentre(factor: number): void {
		const size = this.stageSize();
		this.apply(zoomAt(this.view, factor, { x: size.width / 2, y: size.height / 2 }));
	}

	private fitToStage(): void {
		this.apply(fit(this.natural, this.stageSize(), FIT_PADDING_PX));
	}

	private apply(view: View): void {
		this.view = view;
		this.content.setCssProps({
			'--rightof-x': `${view.x}px`,
			'--rightof-y': `${view.y}px`,
			'--rightof-scale': String(view.scale),
		});
		this.zoomLevel.setText(`${Math.round(view.scale * 100)}%`);
	}
}

function iconButton(parent: HTMLElement, icon: string, label: string, onClick: () => void): void {
	const button = parent.createEl('button', { cls: 'clickable-icon', attr: { 'aria-label': label } });
	setIcon(button, icon);
	button.addEventListener('click', onClick);
}
