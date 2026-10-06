import { compile as reladrawCompile, SourceError } from 'reladraw';

export type RenderResult =
	| { ok: true; svg: string }
	| { ok: false; line?: number; message: string };

export interface RenderOptions {
	dark: boolean;
	compile?: typeof reladrawCompile;
}

export function renderDiagram(source: string, options: RenderOptions): RenderResult {
	const compile = options.compile ?? reladrawCompile;
	try {
		return { ok: true, svg: compile(source) };
	} catch (error) {
		if (error instanceof SourceError) return { ok: false, line: error.line, message: error.message };
		return { ok: false, message: error instanceof Error ? error.message : String(error) };
	}
}
