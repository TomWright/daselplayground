<script>
    export let loading = false;
</script>

<main>
    <div class="loader-container">
        {#if loading}
            <div class="loader-overlay">
                <div class="loader-spinner"></div>
            </div>
        {/if}
        <slot/>
    </div>
</main>

<style>
    .loader-container {
        display: block;
        position: relative;
    }

    .loader-container .loader-overlay {
        display: flex;
        justify-content: center;
        align-items: center;

        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.5)
    }

    .loader-spinner {
        display: inline-block;
        width: 80px;
        height: 80px;
    }

    .loader-spinner:after {
        content: " ";
        display: block;
        width: 64px;
        height: 64px;
        margin: 8px;
        border-radius: 50%;
        border: 6px solid #fff;
        border-color: #666 transparent #666 transparent;
        animation: loader-spinner 1.2s linear infinite;
    }

    @keyframes loader-spinner {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>