<script type="text/typescript">
  import { typecheckDataStore, typecheckDataStepStore } from './../stores'
  import { get } from 'svelte/store'
  import { createEventDispatcher } from 'svelte';

  let typecheckData

  const dispatch = createEventDispatcher();

  typecheckDataStore.subscribe(typecheckDataVar => {
    typecheckData = typecheckDataVar
  })

  function resetTypecheckingData() {
    typecheckDataStore.set(null)
    typecheckDataStepStore.set(null)
    typecheckDataStepStore.set(null)
  }
</script>

<div id='taskbar-container'>
  <button on:click={resetTypecheckingData} disabled={typecheckData === null}>Reset</button>
  <button on:click={() => dispatch('runTypecheckClicked')}>Run Typecheck</button>
</div>

<style>
  #taskbar-container {
    display: flex;
    flex-direction: row-reverse;
    border: 4px solid white;
    box-sizing: border-box;
    align-items: center;
    height:100%;
  }

  button {
    margin: 5px;
  }
</style>