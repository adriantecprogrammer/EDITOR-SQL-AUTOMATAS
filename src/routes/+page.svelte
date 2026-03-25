<script lang="ts">
	import { sqlApi } from '../Services/sqlApi';
	let inputText = $state('');
	let outputText = $state('');

	async function createSql() {
		try {
			const response = await sqlApi.createSql(inputText);
			outputText = response.data;
		} catch (error) {
			console.error(error);
		}
	}

	function exportToTxt() {
		const blob = new Blob([outputText], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'salida.txt';
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="relative flex min-h-screen flex-col bg-gray-50 text-gray-800">
	<!-- Background glow effects -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		<div class="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl"></div>
		<div class="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-violet-400/15 blur-3xl"></div>
	</div>

	<!-- Header -->
	<header class="relative z-10 flex items-center justify-between border-b border-gray-200/80 bg-white/70 px-6 py-4 backdrop-blur-sm">
		<div class="flex items-center gap-3">
			<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-cyan-400 to-violet-500 shadow-md shadow-cyan-500/20">
				<span class="text-sm font-bold text-white">&gt;_</span>
			</div>
			<div>
				<h1 class="text-lg font-semibold tracking-tight text-gray-900">SQL Editor</h1>
				<p class="text-xs text-gray-400">Automatas</p>
			</div>
		</div>
		<div class="flex gap-3">
			<button
				onclick={createSql}
				class="rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:brightness-110 active:scale-95"
			>
				Crear SQL
			</button>
			<button
				onclick={exportToTxt}
				disabled={!outputText}
				class="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
			>
				Exportar
			</button>
		</div>
	</header>

	<!-- Main content -->
	<main class="relative z-10 flex flex-1 gap-4 p-4">
		<!-- Input panel -->
		<div class="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white/80 shadow-sm backdrop-blur-sm">
			<div class="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5">
				<div class="h-2 w-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></div>
				<span class="text-xs font-semibold tracking-widest text-gray-400 uppercase">Entrada</span>
			</div>
			<textarea
				bind:value={inputText}
				placeholder="Escribe aqui..."
				spellcheck="false"
				class="flex-1 resize-none bg-transparent px-4 py-3 font-mono text-sm text-gray-800 caret-cyan-500 placeholder-gray-300 outline-none"
			></textarea>
		</div>

		<!-- Divider -->
		<div class="flex items-center">
			<div class="h-16 w-px bg-linear-to-b from-transparent via-cyan-400/40 to-transparent"></div>
		</div>

		<!-- Output panel -->
		<div class="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white/80 shadow-sm backdrop-blur-sm">
			<div class="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5">
				<div class="h-2 w-2 rounded-full bg-violet-400 shadow-sm shadow-violet-400/50"></div>
				<span class="text-xs font-semibold tracking-widest text-gray-400 uppercase">Salida</span>
			</div>
			<textarea
				bind:value={outputText}
				readonly
				placeholder="El resultado aparecera aqui..."
				spellcheck="false"
				class="flex-1 resize-none bg-transparent px-4 py-3 font-mono text-sm text-gray-700 placeholder-gray-300 outline-none"
			></textarea>
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
