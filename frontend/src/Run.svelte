<script>

    export let snippet;
    export let output;
    export let loading;

    async function run() {
        loading = true
        await fetch('http://localhost:8080/execute', {
            method: 'POST',
            body: JSON.stringify({
                snippet: snippet
            })
        })
            .then(r => {
                return r.json().then(
                    data => {
                        return {
                            r: r,
                            data: data
                        }
                    }
                )
            })
            .then(data => {
                if (data.data.error) {
                    throw new Error(data.data.error)
                }
                if (!data.r.ok) {
                    throw new Error(`${data.r.status} ${data.r.statusText}`)
                }
                return data.data.data
            })
            .then(data => {
                console.log('Executed', data)
                output = data;
            })
            .catch(err => {
                output = err
            })
            .finally(() => {
                loading = false
            })
    }
</script>

<main>
    <input type="button" value="Run" on:click={run}>
</main>

<style>

</style>