<script>
    import {createEventDispatcher} from 'svelte'

    const dispatch = createEventDispatcher()

    export let disabled = false;
    export let inline = false;
    export let className = ''
</script>

<main class:inline={inline}>
    <button
            class="{className}"
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