<script>
    import VersionSelector from "./VersionSelector.svelte";
    import FileTypeSelector from "./FileTypeSelector.svelte";
    import FullCommand from "./FullCommand.svelte";
    import FileContent from "./FileContent.svelte";
    import CommandOutput from "./CommandOutput.svelte";
    import Args from "./Args.svelte";
    import Run from "./Run.svelte";
    import Save from "./Save.svelte";
    import {onMount} from 'svelte'

    export let loading = false

    export let snippet = {
        id: null,
        file: `{"name": "Tom"}`,
        fileType: 'json',
        args: [
            {
                name: '.name',
                value: null,
                hasValue: false
            }
        ],
        version: null
    }

    onMount(async () => {
        const splitPath = window.location.pathname.split("/")
        if (splitPath.length === 3) {
            const id = splitPath[2]
            console.log(`loading snippet ${id}`)
            loading = true
            await fetch(`http://localhost:8080/snippet?id=${id}`)
                .then(r => {
                    if (!r.ok) {
                        if (r.status === 404) {
                            throw new Error("Snippet not found")
                        }
                        throw new Error(`${r.status} ${r.statusText}`)
                    }
                    return r
                })
                .then(r => r.json())
                .then(data => {
                    return data.snippet
                })
                .then(s => {
                    console.log(`loaded snippet`, s)
                    snippet = s
                    loading = false
                    return s
                })
                .catch(err => {
                    output = err
                })
        }
    })


    export let output = null

    let command;
</script>

<main>
    <h1>Dasel Playground</h1>
    <p>Playground environment for <a href="https://github.com/TomWright/dasel" target="_blank">Dasel</a>.</p>
    <VersionSelector bind:version="{snippet.version}"/>
    <FileTypeSelector bind:fileType="{snippet.fileType}"/>
    <FileContent bind:content="{snippet.file}"/>
    <Args bind:args={snippet.args}/>
    <FullCommand bind:command={command} snippet="{snippet}"/>
    <Run bind:snippet={snippet} bind:output={output}/>
    <Save bind:snippet={snippet}/>
    <CommandOutput output="{output}"/>
</main>

<style>
    main {
        text-align: center;
        padding: 1em;
        max-width: 240px;
        margin: 0 auto;
    }

    h1 {
        color: #ff3e00;
        text-transform: uppercase;
        font-size: 4em;
        font-weight: 100;

        margin-block-start: 0.2em;
        margin-block-end: 0.5em;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
</style>