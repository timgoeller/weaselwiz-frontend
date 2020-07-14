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
	<div id="code-view" class="tile">
		<Codeview bind:this={codeview}/>
	</div>
	<div id="taskbar" class="tile">
		<Taskbar
			on:runTypecheckClicked={runTypechecker} 
		/>
	</div>
	<div id="environment-view" class="tile">
		<Contextview/>
	</div>
	<div id="step-counter-view" class="tile">
		<StepInformation/>
	</div>
	<div id="secondary-taskbar" class="tile">
		<SteppingTaskbar/>
	</div>
</main>

<style>
	:global(:root) {
		--background-color: #3D3D3D;
		--primary-color: #8D940F;
		--main-background: linear-gradient(180deg, #414141 -5.93%, rgba(74, 74, 74, 0.96) 101.81%);
	}

	#layout {
		display: grid;
		grid-template-columns: auto 500px;
		grid-template-rows: 50vh auto 90px;
		height:100vh;
		background: var(--main-background);
		color: white;
		padding-left: 15px;
		padding-right: 15px;
	}

	#code-view {
		grid-column-start: 1;
		grid-column-end: 2;

		grid-row-start: 1;
		grid-row-end: 3;

		overflow: hidden;
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

		border-radius: 5px;
		margin: 10px;
	}

	#step-counter-view {
		grid-row-start: 2;
		grid-row-end: 3;

		border-radius: 5px;
		margin: 10px;
	}

	.tile {
		background: #FDFDFD;
		box-shadow: 1px 3px 4px rgba(0, 0, 0, 0.25);
		border-radius: 7px;
		margin: 10px;
	}

	:global(.button) {
		width: 150px;
		height: 40px;
	
		background: linear-gradient(107.26deg, #7976FF 0%, #4685FF 100%);
		box-shadow: 1px 2px 5px rgba(0, 0, 0, 0.25);
		border-radius: 7px;

		margin: 0px 5px 0px 5px;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: default;
		border-radius: 3px;
		font-size: 1.3em;
		font-weight: bold;
		user-select: none;
	}

	:global(.button:not(.disabled):hover) {
		box-shadow: 0 4px 8px 0 rgba(195, 195, 195, 0.2), 0 6px 20px 0 rgba(221, 220, 220, 0.19);
	}

	:global(.button.disabled) {
		opacity: 0.4;
	}

</style>