<script>
    import Arg from "./Arg.svelte";

    export let args = [];

    function addArg() {
        console.log("adding arg")
        args = [...args, {
            name: '',
            value: null,
            hasValue: false
        }]
    }

    function removeArg(index) {
        console.log("removing arg" + index)
        args = [
            ...args.slice(0, index),
            ...args.slice(index + 1, args.length)
        ]
    }
</script>

<main>
    <div>
        <input type="button" value="Add argument" on:click={addArg}>
    </div>
    <div>
        {#if args}
            {#each args as v, index}
                <Arg bind:value={v.value} bind:name={v.name} bind:hasValue={v.hasValue} deleteArg="{() => {removeArg(index)}}"/>
            {/each}
        {/if}
    </div>
</main>

<style>

</style>