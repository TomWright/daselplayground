<script>
    export let icon;
    export let alt;
    export let href;
    export let newWindow = false;
</script>

<main>
    <a class="icon" href={href} target="{newWindow ? '_blank' : '_self'}">
        <img src={icon} alt={alt} /> <slot />
    </a>
</main>

<style>
    a.icon {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    a.icon > img {
        width: 2em;
        margin-right:0.5em
    }
</style>