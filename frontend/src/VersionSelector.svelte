<script>
    import {afterUpdate, onMount} from "svelte"
    import {getVersions} from "./api";

    let versions = [];

    export let output;

    onMount(async () => {
        loading = true
        await getVersions()
            .then(v => {
                console.log('Loaded versions', v)
                versions = v;
                version = versions[0]
            })
            .catch(err => {
                output = err
            })
            .finally(() => {
                loading = false
            })
    })

    afterUpdate(() => {
        if (!version) {
            // console.log(versions)
            version = versions[0]
        }
    })

    export let version;
    export let loading = false;
</script>

<main>
    <label>
        <select name="version" bind:value={version}>
            {#if versions}
                {#each versions as v}
                    <option value="{v}">{v}</option>
                {/each}
            {/if}
        </select>
    </label>
</main>

<style>

</style>