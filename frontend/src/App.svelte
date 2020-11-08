<script>
    import FullCommand from "./FullCommand.svelte";
    import FileContent from "./FileContent.svelte";
    import CommandOutput from "./CommandOutput.svelte";
    import Args from "./Args.svelte";
    import {onMount} from 'svelte'
    import Loader from "./Loader.svelte";
    import {createSnippet, executeSnippet, getSnippet, getVersions} from './api'
    import ButtonGroup from "./ButtonGroup.svelte";
    import IconLink from "./IconLink.svelte";
    import TopBar from "./TopBar.svelte";
    import SelectBox from "./SelectBox.svelte";

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

    onMount(async () => {
        versionsLoading = true
        await getVersions()
            .then(versionList => {
                console.log('Loaded versions', versionList)
                let newVersions = []
                versionList.forEach(v => {
                    newVersions.push({
                        label: v,
                        value: v
                    })
                })
                versions = newVersions;
            })
            .catch(err => {
                output = err
            })
            .finally(() => {
                versionsLoading = false
            })
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

    let versions = []
    let snippetLoading = false
    let versionsLoading = false
    let executeLoading = false
    let saveLoading = false

    let fileTypes = [
        {
            'label': 'None',
            'value': null
        },
        {
            'label': 'JSON',
            'value': 'json'
        },
        {
            'label': 'YAML',
            'value': 'yaml'
        },
        {
            'label': 'TOML',
            'value': 'toml'
        },
        {
            'label': 'XML',
            'value': 'xml'
        },
        {
            'label': 'CSV',
            'value': 'csv'
        }
    ]

    let command;

    export let analytics = false
    if (analytics) {
        const head = document.getElementsByTagName('head')[0];

        // Global site tag (gtag.js) - Google Analytics
        const gtag = document.createElement('script');
        gtag.type = 'text/javascript';
        gtag.onload = function () {
            window.dataLayer = window.dataLayer || [];

            function gtag() {
                window.dataLayer.push(arguments);
            }

            gtag('js', new Date());
            gtag('config', 'G-59FDXE6E15');
        }
        gtag.async = true
        gtag.src = 'https://www.googletagmanager.com/gtag/js?id=G-59FDXE6E15';
        head.appendChild(gtag);
    }
</script>

<main>
    <TopBar>
        <h1>Dasel Playground</h1>
    </TopBar>
    <p>Playground environment for <a href="https://github.com/TomWright/dasel" target="_blank">Dasel</a>.</p>
    <IconLink href="https://github.com/TomWright/daselplayground" newWindow={true} icon="/github.png">View Source on
        GitHub
    </IconLink>
    <div class="content-wrapper">
        <Loader loading="{snippetLoading || versionsLoading || executeLoading || saveLoading}">
            <div class="form-wrapper">
                <SelectBox bind:options={versions} bind:value={snippet.version}/>
                <SelectBox bind:options={fileTypes} bind:value={snippet.fileType}/>
            </div>
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
    </div>
</main>

<style>
    main {
        text-align: center;
        padding: 1em;
        max-width: 95%;
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
            max-width: 80%;
        }
    }

    .content-wrapper {
        margin-top: 1em;
    }
    .form-wrapper {
        margin: 0 auto;
        position: relative;
        width: 100%;
        max-width: 300px;
    }
</style>