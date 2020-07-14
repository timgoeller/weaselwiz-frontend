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
  <div class="button" on:click={resetTypecheckingData} class:disabled={typecheckData === null}>Reset</div>
  <div class="button" on:click={() => dispatch('runTypecheckClicked')} class:disabled={!(typecheckData === null)}>Run</div>
</div>

<style>
  #taskbar-container {
    display: flex;
    justify-content: center;
    flex-direction: row-reverse;
    box-sizing: border-box;
    align-items: center;
    height:100%;
  }
</style>