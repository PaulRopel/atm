<script lang="ts">
	import '../../app.css';

	let { children } = $props();
</script>

<div class="app-layout">
	{@render children()}
</div>

<style>
	.app-layout {
		background: white;
		min-height: 100vh;
		padding: 1rem;
	}
</style>
