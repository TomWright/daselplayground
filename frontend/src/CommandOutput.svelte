<script>
    import {afterUpdate} from 'svelte'

    export let output;
    afterUpdate(() => {

    })
</script>

<main>
    <label>
        Output
        <textarea name="command-output"
                  autocorrect="off" autocomplete="off" disabled="disabled"
                  autocapitalize="off" spellcheck="false" value="{output}"></textarea>
    </label>
</main>

<style>
    textarea {
        margin-top: 0.5em;
        width: 100%;
        resize: vertical;
        min-height: 10em;
    }
</style>