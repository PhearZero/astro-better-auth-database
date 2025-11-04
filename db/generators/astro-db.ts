import { type DBFieldAttribute, getAuthTables } from "better-auth/db";
import type { BetterAuthOptions } from "better-auth";
import { existsSync } from "fs";

export interface SchemaGenerator {
	<Options extends BetterAuthOptions>(opts: {
		file?: string;
		adapter: any;
		options: Options;
	}): Promise<{
		code?: string;
		fileName: string;
		overwrite?: boolean;
		append?: boolean;
	}>;
}

export function convertToSnakeCase(str: string, camelCase?: boolean) {
	if (camelCase) {
		return str;
	}
	// Handle consecutive capitals (like ID, URL, API) by treating them as a single word
	return str
		.replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2") // Handle AABb -> AA_Bb
		.replace(/([a-z\d])([A-Z])/g, "$1_$2") // Handle aBb -> a_Bb
		.toLowerCase();
}

export const generateAstroDBSchema: SchemaGenerator = async ({
	options,
	file,
	adapter,
}) => {
	const tables = getAuthTables(options);
	const filePath = file || "./db/auth-config.ts";

	const fileExist = existsSync(filePath);

	let code: string = generateImport();

	for (const tableKey in tables) {
		const table = tables[tableKey]!;
		const modelName = getModelName(table.modelName, adapter.options);
		const fields = table.fields;

		function getTypeString(
			field: DBFieldAttribute,
		): "text" | "number" | "boolean" | "date" | "json" {
			if (field.references?.field === "id") {
				return options.advanced?.database?.useNumberId ? "number" : "text";
			}
			const type = field.type;
			if (typeof type !== "string") {
				// Arrays and enums are stored as json or text in Astro DB; choose json for arrays
				if (Array.isArray(type) && type.every((x) => typeof x === "string")) {
					return "text"; // we'll store enum as text
				}
				throw new TypeError(`Invalid field type in model ${modelName}`);
			}
			switch (type) {
				case "string":
					return "text";
				case "boolean":
					return "boolean";
				case "number":
					return "number";
				case "date":
					return "date";
				case "number[]":
				case "string[]":
				case "json":
					return "json";
				default:
					return "text";
			}
		}

		function buildColumn(name: string, field: DBFieldAttribute) {
			const propName = name;
			const snake = convertToSnakeCase(name, adapter.options?.camelCase);
			const type = getTypeString(field);

			const opts: string[] = [];
			// primary key
			if (propName === "id") {
				opts.push("primaryKey: true");
			}
			// unique
			if ((field as any).unique) {
				opts.push("unique: true");
			}
			// optional flag if provided
			if ((field as any).required === true) {
				opts.push("optional: false");
			} else if ((field as any).required === false) {
				opts.push("optional: true");
			}
			// custom column name for snake_case
			if (snake !== propName) {
				opts.push(`name: "${snake}"`);
			}
			// defaults: special-case timestamps if not provided
			const hasDefault = (field as any).default !== undefined;
			if (hasDefault) {
				// naive default serialization; strings and numbers only
				const d = (field as any).default;
				if (typeof d === "string") {
					opts.push(`default: \"${d}\"`);
				} else if (typeof d === "number" || typeof d === "boolean") {
					opts.push(`default: ${String(d)}`);
				}
			} else if (propName === "createdAt" || propName === "updatedAt") {
				opts.push(
					"default: sql`(cast(unixepoch('subsecond') * 1000 as integer))`",
				);
			}
			// references
			if (field.references?.field) {
				const refModel = getModelName(
					field.references.model as any,
					adapter.options,
				);
				const refField = field.references.field;
				opts.push(`references: () => ${refModel}.columns.${refField}`);
			}

			const optsString = opts.length ? `{ ${opts.join(", ")} }` : "";
			return `column.${type}(${optsString})`;
		}

		const fieldEntries = Object.keys(fields).map((field) => {
			const attr = fields[field]!;
			const fieldName = attr.fieldName || field;
			const col = buildColumn(fieldName, attr);
			return `    ${fieldName}: ${col}`;
		});
		const hasId = Object.keys(fields).some((field) => {
			const attr = fields[field]!;
			const fieldName = attr.fieldName || field;
			return fieldName === "id";
		});
		// Only inject an id primary key if it's missing
		if (!hasId) {
			const idCol = options.advanced?.database?.useNumberId
				? "    id: column.number({ primaryKey: true })"
				: "    id: column.text({ primaryKey: true })";
			fieldEntries.unshift(idCol);
		}
		const schema =
			`export const ${modelName} = defineTable({\n` +
			`  columns: {\n` +
			fieldEntries.join(",\n") +
			"\n" +
			`  },\n` +
			`});`;

		code += `\n${schema}\n`;
	}
	return {
		code,
		fileName: filePath,
		overwrite: fileExist,
	};
};

function generateImport() {
	const rootImports: string[] = [];
	rootImports.push("defineTable");
	rootImports.push("column");
	rootImports.push("sql");
	return `import { ${rootImports.join(", ")} } from "astro:db";\n`;
}

function getModelName(
	modelName: string,
	options: Record<string, any> | undefined,
) {
	// lower-camel-case export name for astro:db table const
	const base = modelName.charAt(0).toLowerCase() + modelName.slice(1);
	return options?.usePlural ? `${base}s` : base;
}
