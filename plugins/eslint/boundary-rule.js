import { readFileSync } from 'fs';
import path from 'path';

const packageCache = new Map();

function getPackageInfo(filePath) {
	const libDir = filePath.match(/src\/lib\/([^/]+)\//);
	if (!libDir) return null;
	const pkgName = libDir[1];
	if (packageCache.has(pkgName)) return packageCache.get(pkgName);

	const janusJsonPath = path.resolve('src/lib', pkgName, 'janus.json');
	try {
		const data = JSON.parse(readFileSync(janusJsonPath, 'utf-8'));
		packageCache.set(pkgName, data);
		return data;
	} catch {
		packageCache.set(pkgName, null);
		return null;
	}
}

function getImportedPackage(importSource) {
	const match = importSource.match(/~\/lib\/([^/]+)/);
	return match ? match[1] : null;
}

const boundaryRule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Enforce cross-package dependency boundaries via janus.json',
		},
		messages: {
			forbidden:
				'Package "{{from}}" cannot import from "{{to}}". Allowed dependencies: {{allowed}}',
		},
	},
	create(context) {
		const filename = context.filename || context.getFilename();
		const currentPkg = getPackageInfo(filename);
		if (!currentPkg) return {};

		return {
			ImportDeclaration(node) {
				const source = node.source.value;
				const importedPkg = getImportedPackage(source);
				if (!importedPkg || importedPkg === currentPkg.name) return;

				const allowed = currentPkg.depends || [];
				if (!allowed.includes(importedPkg)) {
					context.report({
						node,
						messageId: 'forbidden',
						data: {
							from: currentPkg.name,
							to: importedPkg,
							allowed: allowed.join(', ') || '(none)',
						},
					});
				}
			},
		};
	},
};

const plugin = {
	rules: {
		'no-cross-package': boundaryRule,
	},
};

export default plugin;
