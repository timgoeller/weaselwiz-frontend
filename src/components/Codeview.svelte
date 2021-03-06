<script type="text/typescript">
	import { typecheckDataStore, typecheckDataStepStore, resultStore } from './../stores'
	import { get } from 'svelte/store'
	export let code = 'let x = 14 in 12 + x'

	let inputDisabled = false
	let highlights
	let lineNumbers
	let typecheckData

	export function disableCodeView() {
		inputDisabled = true
	}
	
	typecheckDataStepStore.subscribe(step => {
		typecheckData = get(typecheckDataStore)
		if(typecheckData !== null)
			showStep(typecheckData[step])
		else {
			showStep(null)
		}
	})

	export function showStep(step) {
		updateHighlight(code, step)
	}

	function updateHighlight(code : String, step) {
		let highlightedText
		if (step !== null) {
			highlightedText = applyHighlights(code, 
			step.expr.span.start.column, 
			step.expr.span.start.line, 
			step.expr.span.end.column,
			step.expr.span.end.line)
		}
		else {
			highlightedText = code
		}
		if(highlights !== undefined)
			highlights.innerHTML = highlightedText
	}

	function applyHighlights(text, startSpanColumn, startSpanLine, endSpanColumn, endSpanLine) {
		let split = text.split("\n"); 
		split[startSpanLine] = split[startSpanLine].slice(0, startSpanColumn) + "<mark>" + split[startSpanLine].slice(startSpanColumn, split[startSpanLine].length)
		endSpanColumn += 1
		if (startSpanLine === endSpanLine && endSpanColumn > startSpanColumn ) {
			endSpanColumn += 6
		}
		split[endSpanLine] = split[endSpanLine].slice(0, endSpanColumn) + '</mark>' + split[endSpanLine].slice(endSpanColumn, split[endSpanLine].length)
		let highlightedString = ''
	
		split.forEach(string => {
			highlightedString += string + '\n'
		});
		return highlightedString + "<mark id='result'>Result: " + prettyPrintResult(get(resultStore)) + '</mark>'
	}

	function onTaskbarScroll(event) {
		lineNumbers.scrollTop = event.srcElement.scrollTop
		highlights.scrollTop = event.srcElement.scrollTop
	}

	function prettyPrintResult(result) {
		if(result.number != undefined) {
			return 'Number(' + result.number + ")"
		}
		if(result.bool != undefined) {
			return 'Boolean(' + result.bool + ")"
		}
		if(result.values != undefined) {
			return "[" + result.values.map((accumulator, currentValue, index) => {
				return prettyPrintResult(accumulator) + (index < result.values.length ? "," : "")
			}) + "]"
		}
		else {
			return '🤷'
		}
	}
</script>

<svelte:options accessors={true}/>

<div id="code-container">
	<div id="line-numbers" bind:this={lineNumbers}>
		{#each Array.from({length: 1000}, (x, i) => i) as number}
			<span>{number}</span>
		{/each}
	</div>
	<div id="text-container">
		<textarea disabled={!(typecheckData === null)} bind:value={code} id='code-area' on:scroll={onTaskbarScroll}></textarea>
		<div id="backdrop">
			<div id="highlights" class="{(typecheckData === null) ? 'hidden' : ''}" bind:this={highlights}></div>
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
		color: black;
	}

	textarea:focus {
    outline-width: 0;
	}

	textarea:disabled {
    opacity: 0;
	}

	#code-container {
		display: flex;
		flex-direction: row;
		height: 100%;
	}

	#line-numbers {
		width: 40px;
		height: 100%;
		display: flex;
		align-items: center;
		flex-direction: column;
		overflow: hidden;
		padding-top: 5px;
		background: #7976FF;
		box-shadow: 1px 2px 5px rgba(0, 0, 0, 0.25);
	}

	#line-numbers span {
		font: 20px/28px 'Fira Code', monospace;
		letter-spacing: 1px;	
	}

	#text-container {
		flex-grow: 1;
		height: 100%;
		position: relative;
		margin-top: 5px;
		margin-left: 10px;
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
    color: black;
	}

	#highlights.hidden {
		opacity: 0;
	}

	:global(mark:not(#result)) {
		background: #7976FF;
		color: white;
		border-radius: 3px;
	}

	:global(mark#result) {
		background: transparent;
		color: grey;
	}
</style>