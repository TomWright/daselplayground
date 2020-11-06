<script>
    import {createEventDispatcher} from 'svelte'

    const dispatch = createEventDispatcher()

    export let disabled = false;
    export let inline = false;
</script>

<main class:inline={inline}>
    <button
            disabled={disabled}
            on:click={e => (dispatch('click', e))}
    >
        <slot/>
    </button>
</main>

<style>
    .inline {
        display: inline-block;
    }
</style>