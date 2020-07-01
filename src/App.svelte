<script>
	import Codeview from './components/Codeview.svelte'

	export let name;
</script>

<main id="layout">
	<div id="code-view">
		<Codeview></Codeview>
	</div>
	<div id="environment-view"></div>
	<div id="some-view"></div>
</main>

<style>
	#layout {
		display: grid;
		grid-template-columns: auto 300px;
		grid-template-rows: 50vh auto;
		height:100vh;
	}

	#code-view {
		grid-column-start: 1;
		grid-column-end: 2;

		grid-row-start: 1;
		grid-row-end: 3;
		background-color: red;
	}

	#environment-view {
		background-color: blueviolet;
	}

	#some-view {
		background-color: greenyellow;
	}

	:global(body) {
		padding: 0
	}
</style>