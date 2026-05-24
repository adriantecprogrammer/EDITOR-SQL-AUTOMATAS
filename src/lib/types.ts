export interface IERColumn {
	nombre: string;
	tipo: string;
	isPK: boolean;
	isFK: boolean;
	referencesTable?: string;
	referencesColumn?: string;
}

export interface IERTable {
	nombre: string;
	columnas: IERColumn[];
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface IERRelation {
	fromTable: string;
	fromColumn: string;
	toTable: string;
	toColumn: string;
}
