<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div id='taskbar-container'>
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
</style>