<script type="text/typescript">
import { typecheckDataStore, typecheckDataStepStore } from './../stores'
import { get } from 'svelte/store'

let context

typecheckDataStore.subscribe(typecheckData => {
  if(typecheckData !== null) {

  }
})

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
      case "Function" : return "(Function : " + 
        prettyPrintType(type.argument) + " -> " + prettyPrintType(type.result) + ")"
      case "Var" : return "Var"
      case "Unknown" : return "🤷"
      case "List" : return "List<" + prettyPrintType(type.ty) + ">"
    }
  }
</script>

<div id="context-container">
  {#if context !== undefined && context !== null}
    {#each Object.keys(context) as contextEntryKey}
      <span>{contextEntryKey}: {prettyPrintType(context[contextEntryKey].type)}</span><br/>
    {/each}
  {/if}
</div>


<style>
#context-container {
  margin: 7px;
}
</style>