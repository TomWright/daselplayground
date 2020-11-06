<script>
	import {afterUpdate} from 'svelte'

	export let options;
	export let value;
	export let name;

	afterUpdate(() => {
		if (!value && (options && options.length > 0)) {
			value = options[0].value
		}
	})

</script>

<main>
	<label>
		<select name="{name}" bind:value={value}>
			{#if options}
				{#each options as v}
					<option value="{v.value}">{v.label}</option>
				{/each}
			{/if}
		</select>
	</label>
</main>

<style>
	select {
		width: 100%;
	}
</style>