<script>
	import {afterUpdate} from 'svelte'

	export let options;
	export let value;
	export let id;

	afterUpdate(() => {
		if (!value && (options && options.length > 0)) {
			value = options[0].value
		}
	})

</script>

<main>
	<select id="{id}" bind:value={value}>
		{#if options}
			{#each options as v}
				<option value="{v.value}">{v.label}</option>
			{/each}
		{/if}
	</select>
</main>

<style>
	select {
		width: 100%;
		margin-top: 0.5em;
	}
</style>