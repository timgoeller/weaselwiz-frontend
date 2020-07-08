<script type="text/typescript">

	import SteppingTaskbar from './components/SteppingTaskbar.svelte';
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
	<div id="secondary-taskbar">
		<SteppingTaskbar/>
	</div>
</main>

<style>
	:global(:root) {
		--background-color: #3D3D3D;
		--primary-color: #8D940F;
	}

	#layout {
		display: grid;
		grid-template-columns: auto 400px;
		grid-template-rows: 50vh auto 40px;
		height:100vh;
		background-color: var(--background-color);
		color: white;
	}

	#code-view {
		grid-column-start: 1;
		grid-column-end: 2;

		grid-row-start: 1;
		grid-row-end: 3;

		border: 2px solid var(--primary-color);
		border-radius: 5px;

		overflow: hidden;

		margin: 5px;
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

		border: 2px solid var(--primary-color);
		border-radius: 5px;
		margin: 5px;
	}

	#step-counter-view {
		grid-row-start: 2;
		grid-row-end: 3;

		border: 2px solid var(--primary-color);
		border-radius: 5px;
		margin: 5px;
	}

	:global(.button) {
		width: 140px;
		height: 30px;
		background-color: var(--primary-color);
		margin: 0px 5px 0px 5px;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: default;
		border-radius: 3px;
		border: 1px solid white;
		font-weight: bold;
		user-select: none;
	}

	:global(.button:not(.disabled):hover) {
		box-shadow: 0 4px 8px 0 rgba(195, 195, 195, 0.2), 0 6px 20px 0 rgba(221, 220, 220, 0.19);
	}

	:global(.button.disabled) {
		background-color: #535709;
	}

</style>