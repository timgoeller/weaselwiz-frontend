<script type="text/typescript">
	import { typecheckDataStore, typecheckDataStepStore } from './../stores'
	import { get } from 'svelte/store'
	export let code = 'let x = 14 in 12 + x'

	let inputDisabled = false
	let highlights

	export function disableCodeView() {
		inputDisabled = true
	}
	
	typecheckDataStepStore.subscribe(step => {
		let typecheckData = get(typecheckDataStore)
		if(typecheckData !== null) {
			showStep(typecheckData[step])
		}
	})

	export function showStep(step) {
		updateHighlight(code, step)
	}

	function updateHighlight(code : String, step) {
		console.log(code)
		let highlightedText
		if (step) {
			highlightedText = applyHighlights(code, 
			step.expr.span.start.column, 
			step.expr.span.start.line, 
			step.expr.span.end.column,
			step.expr.span.end.line)
		}
		else {
			highlightedText = code
		}
		highlights.innerHTML = highlightedText
	}

	function applyHighlights(text, startSpanColumn, startSpanLine, endSpanColumn, endSpanLine) {
		let split = text.split("\n"); 
		split[startSpanLine] = split[startSpanLine].slice(0, startSpanColumn) + '<mark>' + split[startSpanLine].slice(startSpanColumn, split[startSpanLine].length)
		endSpanColumn += 1
		if (startSpanLine === endSpanLine && endSpanColumn > startSpanColumn ) {
			endSpanColumn += 6
		}
		split[endSpanLine] = split[endSpanLine].slice(0, endSpanColumn) + '</mark>' + split[endSpanLine].slice(endSpanColumn, split[endSpanLine].length)
		let highlightedString = ''
	
		split.forEach(string => {
			highlightedString += string + '\n'
		});
		return highlightedString
	}
</script>

<svelte:options accessors={true}/>

<div id="code-container">
	<div id="line-numbers">

	</div>
	<div id="text-container">
		<textarea disabled={inputDisabled} bind:value={code} id='code-area'></textarea>
		<div id="backdrop">
			<div id="highlights" bind:this={highlights}></div>
		</div>
	</div>
	
</div>

<style>
	textarea {
		resize: none;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 0;
		position: absolute;
		z-index: 2;
		background-color: transparent;
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
		position: relative;
	}

	#backdrop {
		position: absolute;
		height: 100%;
		width: 100%;
		top: 0;
    left: 0;
	}

	#highlights, textarea {
		font: 20px/28px 'Fira Code', monospace;
		letter-spacing: 1px;
	}

	#highlights {
    white-space: pre-wrap;
    word-wrap: break-word;
    color: transparent;
	}

	:global(mark) {
		color: transparent;
		background-color: #c6e686;
		border-radius: 3px;
	}
</style>