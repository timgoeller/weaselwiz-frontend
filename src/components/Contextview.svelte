<script type="text/typescript">
import { typecheckDataStore, typecheckDataStepStore } from './../stores'
import { get } from 'svelte/store'

let context
let defaultContexEntries = ['head', 'add', 'isEmpty', 'multiply', 'tail', 'subtract', 'equals', 'nil', 'cons']

typecheckDataStepStore.subscribe(typecheckDataStep => {
  let typecheckData = get(typecheckDataStore)

  if(typecheckData !== null) {
    context = typecheckData[get(typecheckDataStepStore)].ctx
  }
})

function prettyPrintType(type) {
    switch(type.typeName) {
      case "Number" : return "Number"
      case "Boolean" : return "Boolean"
      case "Function" : return prettyPrintType(type.argument) + " -> " + prettyPrintType(type.result)
      case "Var" : return "Var"
      case "Unknown" : return "🤷"
      case "List" : return "[" + prettyPrintType(type.ty) + "]"
    }
  }
</script>

<div id="context-container">
  {#if context !== undefined && context !== null}
    <div id="divider">
      <span>New Entries</span>
      <div id="divider-line"></div>
    </div>
    {#each Object.keys(context) as contextEntryKey}
      {#if !defaultContexEntries.includes(contextEntryKey)}
        <span class="context-entry">{contextEntryKey}: {prettyPrintType(context[contextEntryKey].type)}</span><br/>
      {/if}
    {/each}

    <div id="divider">
      <span>Default Context</span>
      <div id="divider-line"></div>
    </div>
    {#each Object.keys(context) as contextEntryKey}
      {#if defaultContexEntries.includes(contextEntryKey)}
        <span class="context-entry" id="default-entry">{contextEntryKey}: {prettyPrintType(context[contextEntryKey].type)}</span><br/>
      {/if}
    {/each}
  {/if}
</div>


<style>
#context-container {
  margin: 7px;
}

#divider-line {
  border-bottom: 1px solid var(--primary-color);
  width:100%;
}

#divider {
  margin-bottom: 5px;
  margin-top: 5px;
}

#divider span {
  font-size: 1.3em;
}

#default-entry {
  color: grey;
}

.context-entry {
  font: 20px/28px 'Fira Code', monospace;
}
</style>