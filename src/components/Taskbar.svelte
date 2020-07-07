<script type="text/typescript">
  import { typecheckDataStore, typecheckDataStepStore } from './../stores'
  import { get } from 'svelte/store'
  import { createEventDispatcher } from 'svelte';

  let steppingDisabled = true

  const dispatch = createEventDispatcher();

  let typecheckData = null

  typecheckDataStore.subscribe(data => {
    typecheckData = data
    if(data === null) {
      steppingDisabled = true
    }
    else {
      steppingDisabled = false
    }
  })

  function stepBackward() {
    typecheckDataStepStore.update(step => {
      if (!(step <= 0)) {
        return step - 1
      }
      return step
    })
  }	
  
  function stepForward() {
    typecheckDataStepStore.update(step => {
      if (step < get(typecheckDataStore).length - 1) {
          return step + 1
      }
      return step
    })
  }	
</script>

<svelte:options accessors={true}/>

<div id='taskbar-container'>
  <button on:click={() => dispatch('runTypecheckClicked')}>Run Typecheck</button>
  <button disabled={steppingDisabled} on:click={stepForward}>Step forward</button>
  <button disabled={steppingDisabled} on:click={stepBackward}>Step back</button>
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