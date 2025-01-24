<script lang="ts">
	import { PUBLIC_API_BASE } from '$env/static/public';
	import { page } from '$app/state';
	import { i18n } from '$lib/i18n';
	import type { AvailableLanguageTag } from '$lib/paraglide/runtime';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';

	import '../app.css';
	import Button from '$lib/components/ui/button/button.svelte';
	console.log('[DEBUG] Root page component mounted');
	function switchToLanguage(newLanguage: AvailableLanguageTag) {
		const canonicalPath = i18n.route(page.url.pathname);
		const localisedPath = i18n.resolveRoute(canonicalPath, newLanguage);
		goto(localisedPath);
	}
</script>

<div class="flex gap-2">
	<Button variant="outline" size="icon" onclick={() => switchToLanguage('en')} class="uppercase">
		en
	</Button>
	<Button variant="outline" size="icon" onclick={() => switchToLanguage('de')} class="uppercase">
		de
	</Button>
</div>

<h1>{m.welcome()} to ATM</h1>
<p>
	Visit <a href="/app">Dashboard</a>
</p>
