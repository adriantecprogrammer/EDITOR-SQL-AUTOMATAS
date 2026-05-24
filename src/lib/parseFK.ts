import type { ITabla } from '../Interfaces/IGeneradorSQL';
import type { IERColumn, IERRelation } from './types';

export function parseRelations(tablas: ITabla[]): {
	enriched: Map<string, IERColumn[]>;
	relations: IERRelation[];
} {
	const enriched = new Map<string, IERColumn[]>();
	const relations: IERRelation[] = [];

	const clean = (s: string) => s.trim().replace(/[`"]/g, '');

	for (const tabla of tablas) {
		const sql = tabla.sql;
		const columns: IERColumn[] = [];

		const pkMatch = sql.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
		const pkColumns = pkMatch
			? pkMatch[1].split(',').map(clean)
			: [];

		for (const attr of tabla.atributos) {
			const col: IERColumn = {
				nombre: attr.nombre,
				tipo: attr.tipo,
				isPK: pkColumns.includes(attr.nombre),
				isFK: false,
			};

			const inlineFK = new RegExp(
				`${attr.nombre}\\s+\\w+[^,]*REFERENCES\\s+(\\w+)\\s*\\(([^)]+)\\)`,
				'i'
			);
			const fkMatch = sql.match(inlineFK);
			if (fkMatch) {
				col.isFK = true;
				col.referencesTable = fkMatch[1];
				col.referencesColumn = clean(fkMatch[2]);
				relations.push({
					fromTable: tabla.nombre,
					fromColumn: attr.nombre,
					toTable: fkMatch[1],
					toColumn: col.referencesColumn,
				});
			}

			columns.push(col);
		}

		const fkBlockRe =
			/FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+(\w+)\s*\(([^)]+)\)/gi;
		let m;
		while ((m = fkBlockRe.exec(sql)) !== null) {
			const fkCols = m[1].split(',').map(clean);
			const refTable = m[2];
			const refCols = m[3].split(',').map(clean);
			for (let i = 0; i < fkCols.length; i++) {
				const existing = columns.find((c) => c.nombre === fkCols[i]);
				if (existing && !existing.isFK) {
					existing.isFK = true;
					existing.referencesTable = refTable;
					existing.referencesColumn = refCols[i];
					relations.push({
						fromTable: tabla.nombre,
						fromColumn: fkCols[i],
						toTable: refTable,
						toColumn: refCols[i],
					});
				}
			}
		}

		enriched.set(tabla.nombre, columns);
	}

	return { enriched, relations };
}
