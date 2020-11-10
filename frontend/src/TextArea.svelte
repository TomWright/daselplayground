<script>
    export let value;
    export let disabled = false;
    export let isCode = false;
    export let id;
    export let noWrap = false;
</script>

<main>
    <textarea id="{id}"
              autocorrect="{!isCode}" autocomplete="{!isCode}" disabled="{disabled}"
              autocapitalize="{!isCode}" spellcheck="{!isCode}" bind:value={value} class:nowrap={noWrap}></textarea>
</main>

<style>
    textarea {
        margin-top: 0.5em;
        width: 100%;
        resize: vertical;
        min-height: 10em;
    }

    .nowrap {
        white-space: nowrap;
        overflow: auto;
    }
</style>