<script>
	export let foo;
	export let code;
  
	// Values that are passed in as props
	// are immediately available
	console.log({ foo });

	let inputDisabled = false;

	export function disableCodeView() {
		inputDisabled = true;
	}

</script>

<svelte:options accessors={true}/>

<div id="code-container">
	<div id="line-numbers">

	</div>
	<div id="text-container">
		<textarea disabled={inputDisabled} bind:value={code} id='code-area'></textarea>
	</div>
	
</div>

<style>
	textarea {
		resize: none;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 0;
	}

	#code-container {
		display: flex;
		flex-direction: row;
		height: 100%;
	}

	#line-numbers {
		width: 40px;
		height: 100%;
	}

	#text-container {
		flex-grow: 1;
		height: 100%;
	}
</style>