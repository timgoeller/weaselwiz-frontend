<script type="text/typescript">
  import { typecheckDataStore, typecheckDataStepStore } from './../stores'
  import { get } from 'svelte/store'

  let steppingDisabled = true
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

<div id='taskbar-container'>
  <div class="button" on:click={stepForward} class:disabled={steppingDisabled}>Step forward</div>
  <div class="button" on:click={stepBackward} class:disabled={steppingDisabled}>Step backward</div>
</div>

<style>
  #taskbar-container {
    display: flex;
    flex-direction: row-reverse;
    box-sizing: border-box;
    align-items: center;
    height:100%;
  }
</style>