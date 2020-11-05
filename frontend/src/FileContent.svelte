<script>
    export let content;
</script>

<main>
    <label>
        Input File
		<textarea name="file-content" bind:value={content}
                  autocorrect="off" autocomplete="off"
                  autocapitalize="off" spellcheck="false"></textarea>
    </label>
</main>

<style>
    textarea {
        margin-top: 0.5em;
        width: 100%;
        resize: none;
    }
</style>