<script lang="ts">
	import { onMount } from 'svelte';

	// All letters to learn
	const allLetters = [
		'a',
		'b',
		'c',
		'd',
		'e',
		'f',
		'g',
		'h',
		'i',
		'j',
		'k',
		'l',
		'm',
		'n',
		'o',
		'p',
		'q',
		'r',
		's',
		't',
		'u',
		'v',
		'w',
		'x',
		'y',
		'z'
	];

	// Audio player instance
	let audio: HTMLAudioElement;

	// Initialize audio on mount
	onMount(() => {
		audio = new Audio();
		return () => {
			audio.pause();
			audio.src = '';
		};
	});

	// Current letter index
	let currentIndex = 0;

	// Sample instruction text
	let instruction: string = 'Listen to the sound and tap the matching letter! 🎵';

	// Generate 3 choices including the correct one
	$: letterChoices = generateChoices(allLetters[currentIndex]);

	// Track if sound has been played
	let hasSoundPlayed = false;

	// Feedback states
	let message = '';
	let isCorrect = false;

	// Generate 3 random choices including the correct letter
	function generateChoices(correctLetter: string) {
		const choices = [correctLetter];
		while (choices.length < 3) {
			const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
			if (!choices.includes(randomLetter)) {
				choices.push(randomLetter);
			}
		}
		// Shuffle the array
		return choices.sort(() => Math.random() - 0.5);
	}

	function nextLetter() {
		if (currentIndex < allLetters.length - 1) {
			currentIndex++;
			resetState();
			// Play the sound of the new letter after a short delay
			setTimeout(() => {
				playSound();
			}, 300);
		}
	}

	function resetState() {
		hasSoundPlayed = false;
		message = '';
		isCorrect = false;
	}

	// Function to get the audio URL for a letter
	function getLetterSoundUrl(letter: string): string {
		return `/sounds/letters/${letter.toLowerCase()}.mp3`;
	}

	// Fallback text-to-speech function
	function speakLetter(letter: string) {
		const utterance = new SpeechSynthesisUtterance(letter);
		utterance.rate = 0.8; // Slightly slower speech
		utterance.pitch = 1.2; // Slightly higher pitch
		speechSynthesis.speak(utterance);
	}

	// Placeholder function for playing the audio
	function playSound() {
		if (audio) {
			// Use text-to-speech as fallback
			speakLetter(allLetters[currentIndex]);
		}
		hasSoundPlayed = true;
	}

	// Function to handle letter selection
	function selectLetter(letter: string) {
		if (!hasSoundPlayed) {
			message = 'Please play the sound first!';
			isCorrect = false;
			return;
		}

		isCorrect = letter === allLetters[currentIndex];
		if (isCorrect) {
			message = 'Correct! Well done!';
			// Play sound again as positive reinforcement
			setTimeout(() => {
				// Delay the replay slightly
				playSound();
			}, 500);
		} else {
			message = 'Try again!';
		}
	}

	// Clean up audio when navigating away
	onMount(() => {
		return () => {
			if (audio) {
				audio.pause();
				audio.src = '';
			}
		};
	});
</script>

<div class="learn-letter-container">
	<div class="card">
		<h2>{instruction}</h2>
		<div class="progress">
			Letter {currentIndex + 1} of {allLetters.length}
		</div>

		<button class="play-button" on:click={playSound}>
			<span class="play-icon">▶</span>
			Play Sound
		</button>

		<div class="choices">
			{#each letterChoices as choice}
				<button
					class="letter-choice"
					class:correct={isCorrect && choice === allLetters[currentIndex]}
					class:incorrect={!isCorrect && message && choice !== allLetters[currentIndex]}
					on:click={() => selectLetter(choice)}
				>
					{choice}
				</button>
			{/each}
		</div>

		{#if message}
			<p class="feedback" class:success={isCorrect} class:error={!isCorrect}>
				{message}
			</p>
		{/if}

		{#if isCorrect && currentIndex < allLetters.length - 1}
			<button class="next-button" on:click={nextLetter}> Next Letter → </button>
		{/if}
	</div>
</div>

<style>
	.learn-letter-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 60vh;
		padding: 2rem;
		padding-top: 3rem;
	}

	.card {
		background: #ffffff;
		border-radius: 20px;
		box-shadow:
			0 8px 24px rgba(0, 0, 0, 0.12),
			0 2px 8px rgba(0, 0, 0, 0.08);
		border: 1px solid rgba(0, 0, 0, 0.1);
		padding: 2rem;
		width: 100%;
		max-width: 400px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		margin-top: 1rem;
	}

	h2 {
		color: #333;
		text-align: center;
		font-size: 1.5rem;
		margin: 0;
	}

	.play-button {
		background: #4caf50;
		color: white;
		border: none;
		border-radius: 50px;
		padding: 1rem 2rem;
		font-size: 1.2rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: transform 0.2s;
	}

	.play-button:hover {
		transform: scale(1.05);
	}

	.play-icon {
		font-size: 1.4rem;
	}

	.choices {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		width: 100%;
	}

	.letter-choice {
		background: #f0f0f0;
		border: 3px solid #ddd;
		border-radius: 12px;
		padding: 1.5rem;
		font-size: 2rem;
		font-weight: bold;
		color: #333;
		cursor: pointer;
		transition: all 0.2s;
	}

	.letter-choice:hover {
		background: #e0e0e0;
		transform: translateY(-2px);
		border-color: #4caf50;
	}

	.letter-choice.correct {
		background: #e8f5e9;
		border-color: #4caf50;
		color: #2e7d32;
	}

	.letter-choice.incorrect {
		background: #ffebee;
		border-color: #ef5350;
		color: #c62828;
	}

	.feedback {
		margin: 0;
		padding: 1rem;
		border-radius: 8px;
		text-align: center;
		width: 100%;
	}

	.feedback.success {
		background: #e8f5e9;
		color: #2e7d32;
	}

	.feedback.error {
		background: #ffebee;
		color: #c62828;
	}

	.progress {
		color: #666;
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.next-button {
		background: #2196f3;
		color: white;
		border: none;
		border-radius: 50px;
		padding: 1rem 2rem;
		font-size: 1.2rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: transform 0.2s;
		margin-top: 1rem;
	}

	.next-button:hover {
		transform: scale(1.05);
		background: #1976d2;
	}
</style>
