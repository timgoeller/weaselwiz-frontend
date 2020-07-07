<script type="text/typescript">
	import Codeview from './components/Codeview.svelte'
	import Taskbar from './components/Taskbar.svelte'
	import {typecheckDataStore} from './stores.js'

	let codeview

	function runTypechecker() {
		codeview.disableCodeView()
		fetch('http://localhost:37105/compile' , {
			method: 'POST',
			body: codeview.code
		}).then(response => response.json()).then(data => {
			typecheckDataStore.set(data)
		})
	}
</script>

<main id="layout">
	<div id="code-view">
		<Codeview bind:this={codeview}></Codeview>
	</div>
	<div id="taskbar">
		<Taskbar
			on:runTypecheckClicked={runTypechecker} 
		/>
	</div>
	<div id="environment-view"></div>
	<div id="some-view"></div>
</main>

<style>
	#layout {
		display: grid;
		grid-template-columns: auto 300px;
		grid-template-rows: 50vh auto 40px;
		height:100vh;
	}

	#code-view {
		grid-column-start: 1;
		grid-column-end: 2;

		grid-row-start: 1;
		grid-row-end: 3;

		border: 2px solid black;
		border-radius: 5px;
	}

	#taskbar {
		grid-column-start: 1;
		grid-column-end: 2;

		grid-row-start: 3;
		grid-row-end: 4;
	}

	#environment-view {
		background-color: blueviolet;
	}

	#some-view {
		background-color: greenyellow;

		grid-row-start: 2;
		grid-row-end: 4;
	}
</style>