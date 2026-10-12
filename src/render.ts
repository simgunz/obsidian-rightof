import { compile as reladrawCompile, parse, SourceError, THEMES, type Theme } from 'reladraw';

export type RenderResult =
	| { ok: true; svg: string }
	| { ok: false; line?: number; message: string };

export type RenderFailure = Extract<RenderResult, { ok: false }>;

export interface RenderOptions {
	dark: boolean;
	/** The note's background colour. reladraw also fills the box behind each edge label with it. */
	background?: string;
	compile?: typeof reladrawCompile;
}

export function renderDiagram(source: string, options: RenderOptions): RenderResult {
	const compile = options.compile ?? reladrawCompile;
	try {
		// A theme passed to compile overrides the file's own `diagram theme:`.
		const theme = namesOwnTheme(source) ? undefined : modeTheme(options.dark, options.background);
		return { ok: true, svg: compile(source, theme ? { theme } : {}) };
	} catch (error) {
		if (error instanceof SourceError) return { ok: false, line: error.line, message: error.message };
		return { ok: false, message: error instanceof Error ? error.message : String(error) };
	}
}

export function errorTitle(failure: RenderFailure): string {
	return failure.line === undefined ? 'reladraw:' : `reladraw: line ${failure.line}`;
}

function modeTheme(dark: boolean, background: string | undefined): Theme {
	const base = (dark ? THEMES.dark : THEMES.light)!;
	return { ...base, background: background || base.background };
}

function namesOwnTheme(source: string): boolean {
	try {
		return parse(source).statements.some(
			(statement) => statement.kind === 'diagram' && statement.attrs.theme !== undefined,
		);
	} catch {
		// compile reports the same error with a more precise line.
		return false;
	}
}
