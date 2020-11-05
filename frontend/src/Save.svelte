<script>
    export let snippet;
    export let loading;

    async function save() {
        loading = true
        await fetch('http://localhost:8080/snippet', {
            method: 'POST',
            body: JSON.stringify({
                snippet: snippet
            })
        })
            .then(r => r.json())
            .then(data => {
                console.log('Saved', data.snippet)
                window.location = `/s/${data.snippet.id}`
            })
            .finally(() => {
                loading = false
            })
    }
</script>

<main>
    <input type="button" value="Save" on:click={save}>
</main>

<style>

</style>