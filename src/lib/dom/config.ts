let jsAttr = 'data-js';

export interface DomConfig {
	attr?: string;
}

export function setup(config: DomConfig): void {
	if (config.attr) jsAttr = config.attr;
}

export function getAttr(): string {
	return jsAttr;
}
