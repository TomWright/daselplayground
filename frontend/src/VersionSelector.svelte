<script>
    import {afterUpdate, onMount} from "svelte"

    let versions = [];

    onMount(async () => {
        loading = true
        await fetch('http://localhost:8080/versions')
            .then(r => r.json())
            .then(data => {
                console.log('Loaded versions', data.versions)
                versions = data.versions;
                version = versions[0]
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