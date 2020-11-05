<script>
    export let snippet;
    export let output;

    async function run() {
        await fetch('http://localhost:8080/execute', {
            method: 'POST',
            body: JSON.stringify({
                snippet: snippet
            })
        })
            .then(r => r.json())
            .then(data => {
                console.log('Executed', data.data)
                output = data.data;
            })
    }
</script>

<main>
	<input type="button" value="Run" on:click={run}>
</main>

<style>

</style>