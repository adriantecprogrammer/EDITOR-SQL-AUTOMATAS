<script lang="ts">
	import { sqlApi } from '../Services/sqlApi';
	import type { IGeneradorSQL } from '../Interfaces/IGeneradorSQL';
	import ERDiagram from '../lib/ERDiagram.svelte';

	let inputText = $state('');
	let outputText = $state('');
	let generado = $state<IGeneradorSQL | null>(null);
	let view = $state<'visual' | 'sql' | 'er'>('visual');
	let copiedKey = $state<string | null>(null);
	let loading = $state<null | 'sql' | 'bd' | 'crud'>(null);
	let errorMsg = $state('');
	let inputEl: HTMLTextAreaElement | null = $state(null);
	let gutterEl: HTMLDivElement | null = $state(null);
	let inputVisible = $state(true);


	const EJEMPLO = `vamos a crear Tienda
comenzar a usar Tienda

vamos a guardar información sobre Productos
    vamos a recordar nombre_producto que es texto
    vamos a recordar cantidad que es número
terminamos esta tabla

mostrar lo aprendido`;

	const lineCount = $derived(Math.max(inputText.split('\n').length, 1));
	const lineNumbers = $derived(Array.from({ length: lineCount }, (_, i) => i + 1));

	function onInputScroll() {
		if (gutterEl && inputEl) gutterEl.scrollTop = inputEl.scrollTop;
	}

	function cargarEjemplo() {
		inputText = EJEMPLO;
	}

	function limpiarEntrada() {
		inputText = '';
		inputEl?.focus();
	}

	function buildSqlScript(data: IGeneradorSQL): string {
		const partes: string[] = [];
		if (data.sqlCreateDatabase) partes.push(data.sqlCreateDatabase);
		if (data.sqlUseDatabase) partes.push(data.sqlUseDatabase);
		for (const tabla of data.tablas ?? []) {
			if (tabla.sql) partes.push(tabla.sql);
		}
		return partes.join('\n\n');
	}

	function copy(text: string, key: string) {
		if (!text) return;
		navigator.clipboard.writeText(text);
		copiedKey = key;
		setTimeout(() => {
			if (copiedKey === key) copiedKey = null;
		}, 1500);
	}

	function tipoColor(tipo: string): string {
		const t = (tipo || '').toLowerCase();
		if (/(int|number|decimal|float|double|numeric)/.test(t))
			return 'bg-cyan-50 text-cyan-700 ring-cyan-200';
		if (/(char|text|string|varchar)/.test(t))
			return 'bg-violet-50 text-violet-700 ring-violet-200';
		if (/(date|time)/.test(t)) return 'bg-amber-50 text-amber-700 ring-amber-200';
		if (/(bool)/.test(t)) return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
		return 'bg-gray-100 text-gray-600 ring-gray-200';
	}

	async function createSql() {
		errorMsg = '';
		loading = 'sql';
		try {
			const response = await sqlApi.createSql(inputText);
			generado = response;
			outputText = buildSqlScript(response);
			view = 'visual';
		} catch (error) {
			console.error('Error in UI:', error);
			errorMsg = 'No se pudo generar el SQL. Revisa la entrada.';
		} finally {
			loading = null;
		}
	}

	async function createBD() {
		errorMsg = '';
		loading = 'bd';
		try {
			const response = await sqlApi.createBD(inputText);
			outputText = typeof response === 'string' ? response : JSON.stringify(response, null, 2);
			generado = null;
			view = 'sql';
		} catch (error) {
			console.error('Error in UI:', error);
			errorMsg = 'No se pudo crear la base de datos.';
		} finally {
			loading = null;
		}
	}

	async function generarCRUD(tabla?: string) {
		errorMsg = '';
		loading = 'crud';
		try {
			const response = await sqlApi.createCRUD(inputText, tabla);
			outputText = typeof response === 'string' ? response : JSON.stringify(response, null, 2);
			generado = null;
			view = 'sql';
		} catch (error) {
			console.error('Error in UI:', error);
			errorMsg = 'No se pudo generar el CRUD.';
		} finally {
			loading = null;
		}
	}

	function exportToTxt() {
		if (!outputText) return;
		const blob = new Blob([outputText], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = (generado?.database ?? 'salida') + '.sql';
		a.click();
		URL.revokeObjectURL(url);
	}

	const totalAtributos = $derived(
		(generado?.tablas ?? []).reduce((acc, t) => acc + (t.atributos?.length ?? 0), 0)
	);
</script>

<div class="relative flex min-h-screen flex-col bg-gray-50 text-gray-800">
	<!-- Background glow effects -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		<div class="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl"></div>
		<div
			class="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-violet-400/15 blur-3xl"
		></div>
	</div>

	<!-- Header -->
	<header
		class="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200/80 bg-white/70 px-6 py-4 backdrop-blur-sm"
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-cyan-400 to-violet-500 shadow-md shadow-cyan-500/20"
			>
				<span class="text-sm font-bold text-white">&gt;_</span>
			</div>
			<div>
				<h1 class="text-lg font-semibold tracking-tight text-gray-900">SQL Editor</h1>
				<p class="text-xs text-gray-400">Automatas</p>
			</div>
		</div>
		<div class="flex flex-wrap gap-3">
			<button
				onclick={createSql}
				disabled={!inputText || loading !== null}
				class="rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{loading === 'sql' ? 'Generando...' : 'Crear SQL'}
			</button>
			<button
				onclick={() => generarCRUD()}
				disabled={!inputText || loading !== null}
				class="rounded-lg bg-linear-to-r from-violet-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{loading === 'crud' ? 'Generando...' : 'Generar CRUD'}
			</button>
			<button
				onclick={exportToTxt}
				disabled={!outputText}
				class="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
			>
				Exportar
			</button>
			<button
				onclick={createBD}
				disabled={!outputText || loading !== null}
				class="rounded-lg border border-gray-200 bg-linear-to-r from-cyan-500 to-blue-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{loading === 'bd' ? 'Creando...' : 'Crear BD'}
			</button>
			<button
				onclick={() => (inputVisible = !inputVisible)}
				class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95"
				aria-label={inputVisible ? 'Ocultar entrada' : 'Mostrar entrada'}
			>
				{#if inputVisible}
					<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.72 3.97a.75.75 0 011.06 0l8.25 8.25a.75.75 0 010 1.06l-8.25 8.25a.75.75 0 01-1.06-1.06L12.19 12 4.72 4.53a.75.75 0 010-1.06z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M4.72 16.03a.75.75 0 010-1.06l8.25-8.25a.75.75 0 011.06 1.06L5.81 16.03a.75.75 0 01-1.06 0z" clip-rule="evenodd"/></svg>
				{:else}
					<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M15.28 3.97a.75.75 0 010 1.06L7.81 12l7.47 7.47a.75.75 0 01-1.06 1.06l-8.25-8.25a.75.75 0 010-1.06l8.25-8.25a.75.75 0 011.06 0z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M15.28 16.03a.75.75 0 01-1.06 0l-8.25-8.25a.75.75 0 010-1.06l8.25-8.25a.75.75 0 011.06 1.06L7.81 12l7.47 7.47a.75.75 0 010 1.06z" clip-rule="evenodd"/></svg>
				{/if}
			</button>
		</div>
	</header>

	<!-- Main content -->
	<main class="relative z-10 flex flex-1 gap-4 p-4">
		{#if inputVisible}
		<!-- Input panel -->
		<div
			class="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white/80 shadow-sm backdrop-blur-sm"
		>
			<div class="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-2.5">
				<div class="flex items-center gap-2">
					<div class="h-2 w-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></div>
					<span class="text-xs font-semibold tracking-widest text-gray-400 uppercase">Entrada</span>
					<span class="font-mono text-[10px] text-gray-400">
						{lineCount} ln &middot; {inputText.length} ch
					</span>
				</div>
				<div class="flex items-center gap-1.5">
					<button
						type="button"
						onclick={cargarEjemplo}
						class="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-500 transition-all hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 active:scale-95"
					>
						Cargar ejemplo
					</button>
					<button
						type="button"
						onclick={limpiarEntrada}
						disabled={!inputText}
						class="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-500 transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
					>
						Limpiar
					</button>
				</div>
			</div>

			<div class="relative flex flex-1 overflow-hidden">
				<div
					bind:this={gutterEl}
					aria-hidden="true"
					class="pointer-events-none w-10 shrink-0 overflow-hidden border-r border-gray-100 bg-gray-50/60 py-3 text-right font-mono text-xs leading-6 text-gray-300 select-none"
				>
					{#each lineNumbers as n (n)}
						<div class="px-2">{n}</div>
					{/each}
				</div>
				<textarea
					bind:this={inputEl}
					bind:value={inputText}
					onscroll={onInputScroll}
					placeholder="vamos a crear MiEscuela&#10;comenzar a usar MiEscuela&#10;&#10;vamos a guardar informacion sobre estudiantes&#10;    vamos a recordar nombre que es texto&#10;    ...&#10;terminamos esta tabla"
					spellcheck="false"
					class="flex-1 resize-none bg-transparent px-3 py-3 font-mono text-sm leading-6 text-gray-800 placeholder-gray-300 caret-cyan-500 outline-none"
				></textarea>
			</div>
		</div>

		<!-- Divider -->
		<div class="flex items-center">
			<div class="h-16 w-px bg-linear-to-b from-transparent via-cyan-400/40 to-transparent"></div>
		</div>
		{/if}

		<!-- Output panel -->
		<div
			class="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white/80 shadow-sm backdrop-blur-sm"
		>
			<div class="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-2.5">
				<div class="flex items-center gap-2">
					<div class="h-2 w-2 rounded-full bg-violet-400 shadow-sm shadow-violet-400/50"></div>
					<span class="text-xs font-semibold tracking-widest text-gray-400 uppercase">Salida</span>
				</div>

				<div class="flex items-center gap-2">
					{#if generado}
						<div class="inline-flex rounded-md border border-gray-200 bg-white p-0.5 text-xs">
							<button
								type="button"
								onclick={() => (view = 'visual')}
								class="rounded px-2.5 py-1 font-medium transition-colors {view === 'visual'
									? 'bg-gray-100 text-gray-900'
									: 'text-gray-500 hover:text-gray-700'}"
							>
								Visual
							</button>
							<button
								type="button"
								onclick={() => (view = 'sql')}
								class="rounded px-2.5 py-1 font-medium transition-colors {view === 'sql'
									? 'bg-gray-100 text-gray-900'
									: 'text-gray-500 hover:text-gray-700'}"
							>
								SQL
							</button>
							<button
								type="button"
								onclick={() => (view = 'er')}
								class="rounded px-2.5 py-1 font-medium transition-colors {view === 'er'
									? 'bg-gray-100 text-gray-900'
									: 'text-gray-500 hover:text-gray-700'}"
							>
								ER
							</button>
						</div>
					{/if}
					<button
						onclick={() => copy(outputText, 'all')}
						disabled={!outputText}
						class="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-500 transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
					>
						{copiedKey === 'all' ? 'Copiado!' : 'Copiar todo'}
					</button>
				</div>
			</div>

			{#if errorMsg}
				<div
					role="alert"
					class="border-b border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-700"
				>
					{errorMsg}
				</div>
			{/if}

			<div class="flex-1 overflow-auto">
				{#if generado && view === 'visual'}
					<div class="space-y-4 p-4">
						<!-- Database summary -->
						<div
							class="rounded-lg border border-gray-200/80 bg-linear-to-br from-white to-gray-50 p-4"
						>
							<div class="flex flex-wrap items-center justify-between gap-2">
								<div class="flex items-center gap-2">
									<span class="text-xs font-semibold tracking-widest text-gray-400 uppercase"
										>Base de datos</span
									>
									<span
										class="rounded-md bg-cyan-50 px-2 py-0.5 font-mono text-sm font-semibold text-cyan-700 ring-1 ring-cyan-200"
									>
										{generado.database || '—'}
									</span>
								</div>
								<div class="flex gap-2 text-xs text-gray-500">
									<span class="rounded-md bg-gray-100 px-2 py-0.5">
										{generado.tablas?.length ?? 0} tablas
									</span>
									<span class="rounded-md bg-gray-100 px-2 py-0.5">
										{totalAtributos} atributos
									</span>
								</div>
							</div>

							{#if generado.sqlCreateDatabase || generado.sqlUseDatabase}
								<div class="mt-3 space-y-2">
									{#each [generado.sqlCreateDatabase, generado.sqlUseDatabase].filter(Boolean) as stmt, i (i)}
										<div class="group relative">
											<pre
												class="overflow-x-auto rounded-md bg-gray-900 px-3 py-2 font-mono text-xs text-gray-100">{stmt}</pre>
											<button
												onclick={() => copy(stmt, `db-${i}`)}
												class="absolute top-1.5 right-1.5 rounded bg-gray-800/80 px-2 py-0.5 text-[10px] font-medium text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-700"
											>
												{copiedKey === `db-${i}` ? 'Copiado' : 'Copiar'}
											</button>
										</div>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Tables -->
						{#each generado.tablas ?? [] as tabla, i (tabla.nombre + i)}
							<details
								open={i === 0}
								class="group rounded-lg border border-gray-200/80 bg-white shadow-sm transition-shadow hover:shadow"
							>
								<summary
									class="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden"
								>
									<div class="flex min-w-0 items-center gap-2">
										<svg
											class="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-90"
											viewBox="0 0 20 20"
											fill="currentColor"
											aria-hidden="true"
										>
											<path
												fill-rule="evenodd"
												d="M7.21 14.77a.75.75 0 010-1.06L10.94 10 7.21 6.29a.75.75 0 111.08-1.04l4.25 4.25a.75.75 0 010 1.08l-4.25 4.25a.75.75 0 01-1.08-.06z"
												clip-rule="evenodd"
											/>
										</svg>
										<span class="truncate font-mono text-sm font-semibold text-gray-900"
											>{tabla.nombre}</span
										>
										<span
											class="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
										>
											{tabla.atributos?.length ?? 0} cols
										</span>
									<button
										onclick={(e) => { e.stopPropagation(); generarCRUD(tabla.nombre); }}
										disabled={!inputText || loading !== null}
										class="ml-auto shrink-0 rounded-md bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-600 ring-1 ring-violet-200 transition-all hover:bg-violet-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
									>
										CRUD
									</button>
									</div>
								</summary>

								<div class="space-y-3 border-t border-gray-100 px-4 py-3">
									<!-- Attributes -->
									{#if tabla.atributos?.length}
										<ul class="divide-y divide-gray-100 rounded-md border border-gray-100">
											{#each tabla.atributos as attr (attr.nombre)}
												<li class="flex items-center justify-between gap-3 px-3 py-2">
													<span class="truncate font-mono text-sm text-gray-800">{attr.nombre}</span>
													<div class="flex shrink-0 items-center gap-2">
														<span
															class="rounded px-1.5 py-0.5 font-mono text-[10px] font-medium ring-1 ring-inset {tipoColor(
																attr.tipo
															)}"
														>
															{attr.tipo}
														</span>
														{#if attr.tipoOriginal && attr.tipoOriginal !== attr.tipo}
															<span class="font-mono text-[10px] text-gray-400"
																>{attr.tipoOriginal}</span
															>
														{/if}
													</div>
												</li>
											{/each}
										</ul>
									{/if}

									<!-- SQL -->
									{#if tabla.sql}
										<div class="group/sql relative">
											<pre
												class="overflow-x-auto rounded-md bg-gray-900 px-3 py-2 font-mono text-xs leading-relaxed text-gray-100">{tabla.sql}</pre>
											<button
												onclick={() => copy(tabla.sql, `t-${i}`)}
												class="absolute top-1.5 right-1.5 rounded bg-gray-800/80 px-2 py-0.5 text-[10px] font-medium text-gray-300 opacity-0 transition-opacity group-hover/sql:opacity-100 hover:bg-gray-700"
											>
												{copiedKey === `t-${i}` ? 'Copiado' : 'Copiar'}
											</button>
										</div>
									{/if}
								</div>
							</details>
						{/each}
					</div>
				{:else if generado && view === 'er'}
					<ERDiagram tablas={generado.tablas} />
				{:else if outputText}
					<pre
						class="h-full w-full overflow-auto px-4 py-3 font-mono text-sm whitespace-pre-wrap text-gray-700">{outputText}</pre>
				{:else}
					<div class="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400"
						>
							<svg
								class="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1.5"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M4 7h16M4 12h16M4 17h10"
								/>
							</svg>
						</div>
						<p class="text-sm text-gray-500">El resultado aparecera aqui</p>
						<p class="max-w-xs text-xs text-gray-400">
							Escribe tu definicion en la izquierda y pulsa <span class="font-semibold"
								>Crear SQL</span
							> para visualizar la base de datos.
						</p>
					</div>
				{/if}
			</div>
		</div>
	</main>

	<!-- Footer -->
	<footer class="relative z-10 border-t border-gray-200/80 bg-white/50 px-6 py-3 backdrop-blur-sm">
		<div class="flex items-center justify-between text-xs text-gray-400">
			<div class="flex items-center gap-2">
				<div class="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></div>
				<span>Editor SQL &mdash; Automatas</span>
			</div>
			<span class="font-mono">{inputText.length} caracteres</span>
		</div>
	</footer>
</div>
