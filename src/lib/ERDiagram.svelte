<script lang="ts">
	import type { ITabla } from '../Interfaces/IGeneradorSQL';
	import type { IERTable, IERRelation } from './types';
	import { parseRelations } from './parseFK';

	let { tablas }: { tablas: ITabla[] } = $props();

	const { enriched, relations } = $derived(parseRelations(tablas));

	const TABLE_WIDTH = 220;
	const HEADER_HEIGHT = 36;
	const ROW_HEIGHT = 28;
	const GAP_X = 80;
	const GAP_Y = 60;
	const COLS_PER_ROW = 3;

	const erTables: IERTable[] = $derived.by(() => {
		const result: IERTable[] = [];
		let idx = 0;
		for (const tabla of tablas) {
			const cols = enriched.get(tabla.nombre) ?? [];
			const height = HEADER_HEIGHT + cols.length * ROW_HEIGHT;
			const row = Math.floor(idx / COLS_PER_ROW);
			const col = idx % COLS_PER_ROW;
			result.push({
				nombre: tabla.nombre,
				columnas: cols,
				x: col * (TABLE_WIDTH + GAP_X) + 40,
				y: row * (height + GAP_Y) + 40,
				width: TABLE_WIDTH,
				height
			});
			idx++;
		}
		return result;
	});

	const tableMap = $derived.by(
		() => new Map(erTables.map((t) => [t.nombre, t]))
	);

	const svgWidth = $derived(
		erTables.length > 0
			? Math.max(...erTables.map((t) => t.x + t.width)) + 40
			: 800
	);
	const svgHeight = $derived(
		erTables.length > 0
			? Math.max(...erTables.map((t) => t.y + t.height)) + 40
			: 400
	);

	function getAnchor(
		rel: IERRelation,
		side: 'from' | 'to'
	): { x: number; y: number } | null {
		const tblName = side === 'from' ? rel.fromTable : rel.toTable;
		const colName = side === 'from' ? rel.fromColumn : rel.toColumn;
		const tbl = tableMap.get(tblName);
		if (!tbl) return null;
		const ci = tbl.columnas.findIndex((c) => c.nombre === colName);
		if (ci < 0) return null;
		const y = tbl.y + HEADER_HEIGHT + ci * ROW_HEIGHT + ROW_HEIGHT / 2;
		if (side === 'from') {
			return { x: tbl.x + tbl.width, y };
		}
		return { x: tbl.x, y };
	}
</script>

<div class="h-full w-full overflow-auto bg-gray-50/50 p-4">
	{#if tablas.length > 0}
		<svg
			viewBox="0 0 {svgWidth} {svgHeight}"
			width={svgWidth}
			height={svgHeight}
			class="w-full h-auto"
			xmlns="http://www.w3.org/2000/svg"
		>
			<defs>
				<marker
					id="arrowhead"
					markerWidth="10"
					markerHeight="7"
					refX="10"
					refY="3.5"
					orient="auto"
				>
					<polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
				</marker>
			</defs>

			<!-- Relationship lines -->
			{#each relations as rel (
				rel.fromTable +
				rel.fromColumn +
				rel.toTable +
				rel.toColumn
			)}
				{@const from = getAnchor(rel, 'from')}
				{@const to = getAnchor(rel, 'to')}
				{#if from && to}
					<path
						d="M{from.x},{from.y} C{from.x + 40},{from.y} {to.x - 40},{to.y} {to.x},{to.y}"
						fill="none"
						stroke="#6366f1"
						stroke-width="1.5"
						stroke-dasharray="6 3"
						marker-end="url(#arrowhead)"
					/>
				{/if}
			{/each}

			<!-- Tables -->
			{#each erTables as table (table.nombre)}
				{@const r = 8}
				<g class="er-table">
					<!-- Shadow -->
					<rect
						x={table.x + 2}
						y={table.y + 2}
						width={table.width}
						height={table.height}
						rx={r}
						fill="#0000000d"
					/>

					<!-- Header -->
					<rect
						x={table.x}
						y={table.y}
						width={table.width}
						height={HEADER_HEIGHT}
						rx={r}
						fill="#1e293b"
					/>
					<rect
						x={table.x}
						y={table.y + HEADER_HEIGHT - r}
						width={table.width}
						height={r}
						fill="#1e293b"
					/>

					<!-- Table name -->
					<text
						x={table.x + table.width / 2}
						y={table.y + HEADER_HEIGHT / 2}
						text-anchor="middle"
						dominant-baseline="central"
						fill="white"
						font-size="13"
						font-weight="600"
						font-family="ui-monospace, monospace"
					>
						{table.nombre}
					</text>

					<!-- Body background -->
					<rect
						x={table.x}
						y={table.y + HEADER_HEIGHT}
						width={table.width}
						height={table.height - HEADER_HEIGHT - r}
						fill="white"
						stroke="#e2e8f0"
						stroke-width="1"
					/>
					<rect
						x={table.x}
						y={table.y + table.height - r}
						width={table.width}
						height={r}
						rx={r}
						fill="white"
						stroke="#e2e8f0"
						stroke-width="1"
					/>
					<rect
						x={table.x + 1}
						y={table.y + HEADER_HEIGHT}
						width={table.width - 2}
						height={table.height - HEADER_HEIGHT - r}
						fill="white"
					/>

					<!-- Rows -->
					{#each table.columnas as col, ci}
						{@const rowY = table.y + HEADER_HEIGHT + ci * ROW_HEIGHT}
						{#if ci > 0}
							<line
								x1={table.x + 8}
								y1={rowY}
								x2={table.x + table.width - 8}
								y2={rowY}
								stroke="#f1f5f9"
								stroke-width="1"
							/>
						{/if}
						{#if col.isPK}
							<text
								x={table.x + 14}
								y={rowY + ROW_HEIGHT / 2}
								dominant-baseline="central"
								fill="#f59e0b"
								font-size="9"
								font-weight="700"
								font-family="ui-monospace, monospace"
							>
								PK
							</text>
						{:else if col.isFK}
							<text
								x={table.x + 14}
								y={rowY + ROW_HEIGHT / 2}
								dominant-baseline="central"
								fill="#6366f1"
								font-size="9"
								font-weight="700"
								font-family="ui-monospace, monospace"
							>
								FK
							</text>
						{/if}
						<text
							x={table.x + (col.isPK || col.isFK ? 36 : 14)}
							y={rowY + ROW_HEIGHT / 2}
							dominant-baseline="central"
							fill="#334155"
							font-size="11"
							font-family="ui-monospace, monospace"
						>
							{col.nombre}
						</text>
						<text
							x={table.x + table.width - 10}
							y={rowY + ROW_HEIGHT / 2}
							text-anchor="end"
							dominant-baseline="central"
							fill="#94a3b8"
							font-size="10"
							font-family="ui-monospace, monospace"
						>
							{col.tipo}
						</text>
					{/each}
				</g>
			{/each}
		</svg>
	{:else}
		<div
			class="flex h-full flex-col items-center justify-center gap-2 text-center"
		>
			<p class="text-sm text-gray-400">No hay tablas para mostrar.</p>
		</div>
	{/if}
</div>
