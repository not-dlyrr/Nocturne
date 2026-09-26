<div class="loader-wrapper">
    <div class="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
</div>

<style lang="scss">
  /*
    Taken from https://loading.io/css/
   */

  .loader-wrapper {
    display: inline-flex;
    flex: none;
    width: 14px;
    height: 14px;
  }

  .lds-ring,
  .lds-ring div {
    box-sizing: border-box;
    position: relative;
    color: currentColor;
  }

  .lds-ring {
    display: inline-block;
    width: 14px;
    height: 14px;
  }

  .lds-ring div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 14px;
    height: 14px;
    border: 2px solid currentColor;
    border-radius: 50%;
    animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: currentColor transparent transparent transparent;
  }

  .lds-ring div:nth-child(1) {
    animation-delay: -0.45s;
  }

  .lds-ring div:nth-child(2) {
    animation-delay: -0.3s;
  }

  .lds-ring div:nth-child(3) {
    animation-delay: -0.15s;
  }

  @keyframes lds-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
