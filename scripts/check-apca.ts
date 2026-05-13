#!/usr/bin/env node
/**
 * APCA contrast check CLI.
 *
 *   node --experimental-strip-types scripts/check-apca.ts \
 *     --bg "#ffffff" --fg "rgba(0,0,0,0.7)" --size 14 --weight 400 --usage descriptive
 *
 * Always emits a single JSON object to stdout. Exits 0 on pass, 1 on
 * insufficient contrast, 2 on input error (with `error` field in the JSON).
 */
import { alphaBlend, APCAcontrast, sRGBtoY } from 'apca-w3';
import { colorParsley } from 'colorparsley';

import { type ApcaUsage, minContrastForUsage } from '../src/lib/utility/apca-contrast.ts';

const USAGES: readonly ApcaUsage[] = [
	'body',
	'descriptive',
	'label',
	'subheading',
	'heading',
] as const;

function fail(error: string): never {
	process.stdout.write(JSON.stringify({ error }) + '\n');
	process.exit(2);
}

function parseArgs(argv: string[]): Record<string, string> {
	const out: Record<string, string> = {};
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i]!;
		if (!arg.startsWith('--')) fail(`unexpected positional argument: ${arg}`);
		const eq = arg.indexOf('=');
		if (eq >= 0) {
			out[arg.slice(2, eq)] = arg.slice(eq + 1);
		} else {
			const next = argv[i + 1];
			if (next === undefined || next.startsWith('--')) fail(`missing value for ${arg}`);
			out[arg.slice(2)] = next;
			i++;
		}
	}
	return out;
}

function parseColor(label: string, raw: string): [number, number, number, number] {
	const [r, g, b, a, valid] = colorParsley(raw);
	if (!valid) fail(`invalid ${label} color: ${raw}`);
	return [r, g, b, a];
}

const args = parseArgs(process.argv.slice(2));

for (const key of ['bg', 'fg', 'size', 'weight']) {
	if (!(key in args)) fail(`missing required flag: --${key}`);
}

const bgRaw = args.bg!;
const fgRaw = args.fg!;
const fontSizePx = Number(args.size);
const fontWeight = Number(args.weight);
const usageArg = args.usage ?? 'descriptive';

if (!Number.isFinite(fontSizePx) || fontSizePx <= 0) fail(`invalid --size: ${args.size}`);
if (!Number.isFinite(fontWeight) || fontWeight < 100 || fontWeight > 900) {
	fail(`invalid --weight (expected 100-900): ${args.weight}`);
}
if (!USAGES.includes(usageArg as ApcaUsage)) {
	fail(`invalid --usage (expected one of ${USAGES.join('|')}): ${usageArg}`);
}
const usage = usageArg as ApcaUsage;

const [bgR, bgG, bgB] = parseColor('--bg', bgRaw);
const [fgR, fgG, fgB, fgA] = parseColor('--fg', fgRaw);

const lcRaw = APCAcontrast(
	sRGBtoY(alphaBlend([fgR, fgG, fgB, fgA], [bgR, bgG, bgB])),
	sRGBtoY([bgR, bgG, bgB]),
);
const lc = typeof lcRaw === 'number' ? lcRaw : parseFloat(lcRaw);
const lcAbs = Math.abs(lc);
const minLc = minContrastForUsage(fontSizePx, fontWeight, usage);
const pass = lcAbs >= minLc;

process.stdout.write(
	JSON.stringify({
		bg: bgRaw,
		fg: fgRaw,
		fontSizePx,
		fontWeight,
		usage,
		lc: Number(lc.toFixed(2)),
		lcAbs: Number(lcAbs.toFixed(2)),
		minLc,
		pass,
	}) + '\n',
);
process.exit(pass ? 0 : 1);
