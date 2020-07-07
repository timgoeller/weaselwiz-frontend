<script type="text/typescript">
	import Codeview from './components/Codeview.svelte'
	import Taskbar from './components/Taskbar.svelte'
	import StepInformation from './components/StepInformation.svelte'
	import Contextview from './components/Contextview.svelte'
	import { typecheckDataStore, typecheckDataStepStore, errorStore } from './stores.js'

	let codeview

	function runTypechecker() {
		codeview.disableCodeView()
		fetch('http://localhost:37105/compile' , {
			method: 'POST',
			body: codeview.code
		}).then(response => response.json()).then(data => {
			console.log(data)
			if(data.error !== undefined) {
				errorStore.set(data.error)
			}
			else {
				errorStore.set(null)
				data.sort((a, b) => a.seq < b.seq ? 1 : -1) 
				typecheckDataStore.set(data)
				typecheckDataStepStore.set(0)
			}
		})
	}
</script>

<main id="layout">
	<div id="code-view">
		<Codeview bind:this={codeview}/>
	</div>
	<div id="taskbar">
		<Taskbar
			on:runTypecheckClicked={runTypechecker} 
		/>
	</div>
	<div id="environment-view">
		<Contextview/>
	</div>
	<div id="step-counter-view">
		<StepInformation/>
	</div>
	<div id="secondary-taskbar"></div>
</main>

<style>
	#layout {
		display: grid;
		grid-template-columns: auto 400px;
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

	#secondary-taskbar {
		grid-column-start: 2;
		grid-column-end: 3;

		grid-row-start: 3;
		grid-row-end: 4;
	}

	#environment-view {
		overflow-y: scroll;
	}

	#step-counter-view {
		grid-row-start: 2;
		grid-row-end: 3;
	}
</style>