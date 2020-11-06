import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		analytics: window.location.hostname === 'dasel.tomwright.me'
	}
});

export default app;