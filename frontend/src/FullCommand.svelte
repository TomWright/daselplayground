<script>
	import {afterUpdate} from 'svelte'
	export let snippet;

	export let command = ''

	afterUpdate(() => {
		let cmd = 'dasel'
		if (snippet.fileType) {
			cmd += ` -p ${snippet.fileType}`
		}
		if (snippet.args && snippet.args.length > 0) {
			snippet.args.forEach(arg => {
				cmd += ` ${arg.name}`
				if (arg.hasValue) {
					cmd += ` ${arg.value}`
				}
			})
		}
		command = cmd
	})
</script>

<main>
	<code>{command}</code>
</main>

<style>
main {
	margin-block-end: 0.8em;
}
</style>