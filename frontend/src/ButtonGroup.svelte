<script>
    import Button from "./Button.svelte";
    export let inline = false;
    export let buttons = [];
    export let space = true;
</script>

<main class:inline={inline} class:space={space}>
    {#each buttons as button}
        <Button inline={inline} on:click={button.onClick} {...button.props}>{button.label}</Button>
    {/each}
</main>

<style>
    main.inline.space > :global(main) {
        margin-right: 5px;
    }
    main.inline.space > :global(main:last-of-type) {
        margin-right: 0;
    }
</style>