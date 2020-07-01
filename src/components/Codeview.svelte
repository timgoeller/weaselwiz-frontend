<script>
  export let foo;
  
	// Values that are passed in as props
	// are immediately available
	console.log({ foo });

	function handleCodeInput(input) {
		console.log(input.srcElement.value)
	}

</script>

<div id="code-container">
	<div id="line-numbers">

	</div>
	<div id="text-container">
		<textarea on:input={handleCodeInput} id='code-area'></textarea>
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