<script>
    import {onMount} from 'svelte'
    import Loader from "./Loader.svelte";
    import {createSnippet, executeSnippet, getSnippet, getVersions} from './api'
    import ButtonGroup from "./ButtonGroup.svelte";
    import IconLink from "./IconLink.svelte";
    import TopBar from "./TopBar.svelte";
    import SelectBox from "./SelectBox.svelte";
    import TextArea from "./TextArea.svelte";
    import Button from "./Button.svelte";

    export let snippet = {
        id: null,
        input: `{\n  "name": "Tom"\n}`,
        args: '-p json .name',
        version: null
    }

    export let argumentsHelpVisible = false;

    async function showArgumentsHelp() {
        argumentsHelpVisible = true
        console.log(argumentsHelpVisible)
    }

    async function hideArgumentsHelp() {
        argumentsHelpVisible = false
        console.log(argumentsHelpVisible)
    }


    onMount(async () => {
        const splitPath = window.location.pathname.split("/")
        if (splitPath.length === 3) {
            snippetLoading = true
            const id = splitPath[2]
            console.log(`loading snippet ${id}`)
            sendGaEvent('loadSnippet', {
                snippetId: id,
            })
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

    function compareVersions(a, b) {
        if (a.label === 'latest') {
            return -1
        }
        if (b.label === 'latest') {
            return 1
        }
        if (a.label < b.label) {
            return 1
        }
        if (b.label < a.label) {
            return -1
        }
        return 0;
    }

    onMount(async () => {
        versionsLoading = true
        await getVersions()
            .then(versionList => {
                let newVersions = []
                versionList.forEach(v => {
                    console.log(v)
                    newVersions.push({
                        label: v,
                        value: v
                    })
                })
                newVersions.sort(compareVersions);
                versions = newVersions
                console.log('Loaded versions', versions)
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
        sendGaEvent('executeSnippet', {
            snippetId: snippet.id ? snippet.id : '',
        })
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
        sendGaEvent('saveSnippet', {
            snippetId: snippet.id ? snippet.id : '',
        })
        await createSnippet(snippet)
            .then(createdSnippet => {
                console.log('Saved', createdSnippet)
                sendGaEvent('savedSnippet', {
                    snippetId: createdSnippet.id,
                })
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

    function sendGaEvent(event, data) {
        if (!analytics || typeof window.dataLayer == 'undefined') {
            return
        }
        window.dataLayer.push({
            event: event,
            ...data,
        });
    }
</script>

<main>
    <TopBar>
        <h1>Dasel Playground</h1>
    </TopBar>
    <p>Playground environment for <a href="https://github.com/TomWright/dasel" target="_blank">Dasel</a>.</p>
    <IconLink href="https://github.com/TomWright/daselplayground" newWindow={true} alt="View Source on GitHub"
              icon="/github.png">View Source on
        GitHub
    </IconLink>
    <div class="content-wrapper">
        <Loader loading="{snippetLoading || versionsLoading || executeLoading || saveLoading}">
            <div class="top-level-form-wrapper">
                <div class="input">
                    <label for="versions-input">
                        Dasel Version
                    </label>
                    <SelectBox id="versions-input" bind:options={versions} bind:value={snippet.version}/>
                </div>
            </div>

            <div class="main-input-wrapper">
                <div class="input">
                    <label for="args-input">
                        Arguments <a href="#arguments-help" onclick="return false"
                                     on:click="{showArgumentsHelp}">(help)</a>
                        <TextArea id="args-input" isCode="{true}" bind:value={snippet.args}/>
                    </label>
                </div>
                <div class="input">
                    <label for="file-input">
                        File
                    </label>
                    <TextArea id="file-input" isCode="{true}" bind:value={snippet.input} noWrap="{true}"/>
                </div>
            </div>

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
            <label for="command-output">
                Output
                <TextArea id="command-output" isCode="{true}" disabled="{true}" bind:value={output}/>
            </label>
        </Loader>

        <div id="arguments-help" class="notes" class:visible={argumentsHelpVisible}>
            <p>Use quotes only if the input value contains a space or a quote:</p>
            <ul>
                <li>put string -p json .text value</li>
                <li>put string -p json .text 'Toms value'</li>
                <li>put string -p json .text "Tom's value"</li>
            </ul>
            <p>Including quotes outside of this context may provide unexpected results. Escaping characters is not
                supported.</p>
            <Button on:click={hideArgumentsHelp}>Close</Button>
        </div>
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

    .content-wrapper {
        margin-top: 1em;
    }

    .top-level-form-wrapper {
        margin: 0 auto;
        position: relative;
        width: 100%;
        max-width: 300px;
    }

    .main-input-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
    }

    .input {
        width: 100%;
    }

    div.notes {
        text-align: left;
        font-size: 0.8em;
        display: none;
    }

    div.notes.visible {
        display: block;
    }

    @media (min-width: 640px) {
        main {
            max-width: 80%;
        }

        .main-input-wrapper {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }

        .input {
            margin-right: 1em;
        }

        .input:last-of-type {
            margin-right: 0;
        }
    }
</style>