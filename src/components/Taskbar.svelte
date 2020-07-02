<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div id='taskbar-container'>
  <button on:click={() => dispatch('runTypecheckClicked')}>Run Typecheck</button>
  <button on:click={() => dispatch('stepForwardClicked')}>Step forward</button>
  <button on:click={() => dispatch('stepBackwardClicked')}>Step back</button>
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