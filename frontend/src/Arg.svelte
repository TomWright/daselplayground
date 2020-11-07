<script>
	import Button from "./Button.svelte";
	export let name = null;
	export let value = null;
	export let hasValue = false;

	export let deleteArg
</script>

<main>
	<div class="input-wrapper">
		<label>
			<input type="text" bind:value={name}>
		</label>
		{#if hasValue}
			<span>=</span>
			<label>
				<input type="text" bind:value={value}>
			</label>
		{/if}
	</div>
	<div class="controls-wrapper">
		<label>
			Has value
			<input type="checkbox" bind:checked={hasValue} on:change={() => {if (!hasValue) {value = null} else {value = ''}}}>
		</label>
		<Button inline={true} on:click={deleteArg}>Delete</Button>
	</div>
</main>

<style>
/*label {*/
/*	display: inline-block;*/
/*}*/
main {
	/*display: flex;*/
	/*flex-direction: row;*/
	/*justify-content: space-between;*/
	/*align-items: center;*/
	background-color: #f4f4f4;
	padding: .8em;
	margin-bottom: .8em;
}

.input-wrapper {
	display: flex;
	align-items: center;
	margin-bottom: 0.8em;
}

.input-wrapper > label {
	flex-grow: 3;
}
.input-wrapper > label > input {
	width: 100%;
	margin: 0;
}
.input-wrapper > span {
	flex-grow: 1;
}


.controls-wrapper {
	flex-grow: 1;
	display: flex;
	align-items: center;
	justify-content: center;
}
.controls-wrapper > label {
	margin-right: 1em;
}
.controls-wrapper > :global(main) > :global(button) {
	margin: 0;
}
</style>