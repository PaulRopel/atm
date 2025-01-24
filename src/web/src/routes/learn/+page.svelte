<script lang="ts">
	import LearnLetter from '$lib/components/learn-letter.svelte';
</script>

<div class="learn-container">
	<LearnLetter />
</div>

<style>
	.learn-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background-color: white;
		padding: 1rem;
	}

	:global(body) {
		background-color: white;
	}
</style>
