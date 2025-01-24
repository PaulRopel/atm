<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { browser } from '$app/environment';
	import '../app.css';

	let { children } = $props();

	// Wait for browser to avoid SSR issues
	let mounted = $state(false);
	$effect.root(() => {
		if (browser) {
			mounted = true;
		}
	});
</script>

{#if mounted}
	<ParaglideJS {i18n}>
		{@render children()}
	</ParaglideJS>
{:else}
	<div style="display: none">{@render children()}</div>
{/if}
