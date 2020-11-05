<script>
	import Button from "./Button.svelte";
	export let name = null;
	export let value = null;
	export let hasValue = false;

	export let deleteArg
</script>

<main>
	<label>
		<input type="text" bind:value={name}>
	</label>
	{#if hasValue}
		<span>=</span>
		<label>
			<input type="text" bind:value={value}>
		</label>
	{/if}
	<label>
		Has value
		<input type="checkbox" bind:checked={hasValue} on:change={() => {if (!hasValue) {value = null} else {value = ''}}}>
	</label>
	<Button inline={true} on:click={deleteArg}>Delete</Button>
</main>

<style>
label {
	display: inline-block;
}
</style>