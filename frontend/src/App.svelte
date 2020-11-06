<script>
    import VersionSelector from "./VersionSelector.svelte";
    import FileTypeSelector from "./FileTypeSelector.svelte";
    import FullCommand from "./FullCommand.svelte";
    import FileContent from "./FileContent.svelte";
    import CommandOutput from "./CommandOutput.svelte";
    import Args from "./Args.svelte";
    import {onMount} from 'svelte'
    import Loader from "./Loader.svelte";
    import {createSnippet, executeSnippet, getSnippet} from './api'
    import ButtonGroup from "./ButtonGroup.svelte";

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
            snippetLoading = true
            const id = splitPath[2]
            console.log(`loading snippet ${id}`)
            await getSnippet(id)
                .then(s => {
                    console.log(`loaded snippet`, s)
                    snippet = s
                    return s
                })
                .catch(err => {
                    output = err
                })
                .finally(() => {
                    snippetLoading = false
                })
        }
    })

    async function runSnippet() {
        snippetLoading = true
        await executeSnippet(snippet)
            .then(data => {
                console.log('Executed', data)
                output = data;
            })
            .catch(err => {
                output = err
            })
            .finally(() => {
                snippetLoading = false
            })
    }

    async function saveSnippet() {
        saveLoading = true
        await createSnippet(snippet)
            .then(createdSnippet => {
                console.log('Saved', createdSnippet)
                window.location = `/s/${createdSnippet.id}`
            })
            .catch(err => {
                output = err
            })
            .finally(() => {
                saveLoading = false
            })
    }

    export let output = null

    let snippetLoading = false
    let versionsLoading = false
    let executeLoading = false
    let saveLoading = false

    let command;

    export let analytics = false
    if (analytics) {
        const head = document.getElementsByTagName('head')[0];

        // Global site tag (gtag.js) - Google Analytics
        const gtag = document.createElement('script');
        gtag.type = 'text/javascript';
        gtag.onload = function() {
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-59FDXE6E15');
        }
        gtag.async = true
        gtag.src = 'https://www.googletagmanager.com/gtag/js?id=G-59FDXE6E15';
        head.appendChild(gtag);
    }
</script>

<main>
    <h1>Dasel Playground</h1>
    <p>Playground environment for <a href="https://github.com/TomWright/dasel" target="_blank">Dasel</a>.</p>
    <Loader loading="{snippetLoading || versionsLoading || executeLoading || saveLoading}">
        <VersionSelector bind:output={output} bind:version="{snippet.version}" bind:loading={versionsLoading}/>
        <FileTypeSelector bind:fileType="{snippet.fileType}"/>
        <FileContent bind:content="{snippet.file}"/>
        <Args bind:args={snippet.args}/>
        <FullCommand bind:command={command} snippet="{snippet}"/>
        <ButtonGroup inline={true} buttons={[
                {
                    label: 'Run',
                    onClick: runSnippet,
                    props: {
                        className: 'cta run',
                    }
                },
                {
                    label: 'Save',
                    onClick: saveSnippet,
                    props: {
                        className: 'cta save',
                    }
                }
            ]}/>
        <CommandOutput output="{output}"/>
    </Loader>
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