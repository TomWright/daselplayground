<script>
	import { afterUpdate } from 'svelte'

	export let fileTypes = [
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
		}
	];

	afterUpdate(() => {
		if (!fileType) {
			fileType = fileTypes[0].value
		}
	})

	export let fileType;
</script>

<main>
	<label>
		<select name="file-type" bind:value={fileType}>
			{#if fileTypes}
				{#each fileTypes as v}
					<option value="{v.value}">{v.label}</option>
				{/each}
			{/if}
		</select>
	</label>
</main>

<style>

</style>