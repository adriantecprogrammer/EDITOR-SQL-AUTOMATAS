<script lang="ts">
	let inputText = $state('');
	let outputText = $state('');

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

<div class="flex min-h-screen flex-col bg-white text-gray-800">
	<!-- Header -->
	<header class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
		<div>
			<h1 class="text-xl font-semibold tracking-tight text-gray-900">SQL Editor</h1>
			<p class="mt-0.5 text-sm text-gray-400">Automatas</p>
		</div>
		<div class="flex gap-3">
			<button
				class="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
			>
				Crear SQL
			</button>
			<button
				onclick={exportToTxt}
				disabled={!outputText}
				class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
			>
				Exportar
			</button>
		</div>
	</header>

	<!-- Main content -->
	<main class="flex flex-1 gap-px bg-gray-200 p-4">
		<!-- Input panel -->
		<div class="flex flex-1 flex-col rounded-l-lg bg-white">
			<div class="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
				<span class="text-xs font-medium tracking-wide text-gray-400 uppercase">Entrada</span>
			</div>
			<textarea
				bind:value={inputText}
				placeholder="Escribe aqui..."
				spellcheck="false"
				class="flex-1 resize-none bg-transparent px-4 py-3 font-mono text-sm text-gray-800 placeholder-gray-300 outline-none"
			></textarea>
		</div>

		<!-- Output panel -->
		<div class="flex flex-1 flex-col rounded-r-lg bg-white">
			<div class="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
				<span class="text-xs font-medium tracking-wide text-gray-400 uppercase">Salida</span>
			</div>
			<textarea
				bind:value={outputText}
				readonly
				placeholder="El resultado aparecera aqui..."
				spellcheck="false"
				class="flex-1 resize-none bg-gray-50 px-4 py-3 font-mono text-sm text-gray-700 placeholder-gray-300 outline-none"
			></textarea>
		</div>
	</main>

	<!-- Footer -->
	<footer class="border-t border-gray-200 px-6 py-3">
		<div class="flex items-center justify-between text-xs text-gray-400">
			<span>Editor SQL &mdash; Automatas</span>
			<span>{inputText.length} caracteres</span>
		</div>
	</footer>
</div>
