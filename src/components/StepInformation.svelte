<script type="text/typescript">
  import { typecheckDataStepStore, typecheckDataStore, errorStore } from './../stores'
  import { get } from 'svelte/store'

  let currentStep = 0
  let maxStep = 0
  let currentType = '🤷'

  let showNumbers = false
  let error

  typecheckDataStepStore.subscribe(typecheckDataStep => {
    currentStep = typecheckDataStep
    let typecheckData = get(typecheckDataStore)
    if(typecheckData !== null) {
      maxStep = typecheckData.length - 1
      currentType = prettyPrintType(typecheckData[currentStep].type)
      showNumbers = true
    }
    else {
      showNumbers = false
    }

  })

  errorStore.subscribe(newError => {
    error = newError
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

{#if showNumbers == true}
  <div id="step-container">
    <span id="step">{currentStep}/{maxStep}</span>
  </div>
  <div id="type-container">
    <span id="type">{currentType}</span>
  </div>
{:else if error !== null}
  <div id='center-container'>
    <span id="error">{error}</span>
  </div>
{:else}
  <div id='center-container'>
    <span id="shrug">🤷</span>
  </div>
{/if}

<style>
  #center-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  #type-container, #step-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #type-container {
    width: 100%;
    height: 60%;
    font: 20px/28px 'Fira Code', monospace;
  }

  #step-container {
    width: 100%;
    height: 40%;
  }

  span#type {
    margin-top: 15px;
  }

  span#error {
    color: red;
  }

  span#shrug, span#step {
    font-size: 3em;
  }
</style>