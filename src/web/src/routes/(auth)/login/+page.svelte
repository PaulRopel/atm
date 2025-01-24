<script lang="ts">
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { loginUserSchema } from '$lib/schemas/auth';
	import { Field } from 'formsnap';
	import { Button, Control, FieldErrors, Label } from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import * as Card from '$lib/components/ui/card/index.js';
	import { authClient } from '$lib/domain/auth/auth.client';
	import { goto } from '$app/navigation';

	const data = $props();

	const form = superForm(data, {
		validators: zodClient(loginUserSchema),
		dataType: 'json',
		onSubmit: async ({ formData, cancel }) => {
			cancel();
			try {
				const data = Object.fromEntries(formData);
				console.log('Login attempt with:', data);

				const validationResult = loginUserSchema.safeParse(data);
				if (!validationResult.success) {
					console.error('Validation error:', validationResult.error);
					form.message.set({
						type: 'error',
						text: 'Invalid email or password format'
					});
					return;
				}

				await authClient.login({
					email: data.email as string,
					password: data.password as string
				});
				goto('/app');
			} catch (error) {
				console.error('Login error:', error);
				form.message.set({
					type: 'error',
					text: error instanceof Error ? error.message : 'Login failed. Please try again.'
				});
			}
		}
	});

	const { form: formData, enhance, delayed, message } = form;
</script>

<div class="flex min-h-screen items-center justify-center">
	<Card.Root class="w-full max-w-sm p-6">
		<Card.Header>
			<Card.Title class="text-2xl">Login</Card.Title>
			<Card.Description>Welcome back!</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			{#if $message}
				<div class={$message.type === 'error' ? 'text-red-500' : 'text-green-500'}>
					{$message.text}
				</div>
			{/if}

			<form method="POST" use:enhance>
				<Field {form} name="email">
					<Control>
						{#snippet children({ props })}
							<Label>Email</Label>
							<Input {...props} type="email" bind:value={$formData.email} />
						{/snippet}
					</Control>
					<FieldErrors class="mt-2" />
				</Field>

				<Field {form} name="password">
					<Control>
						{#snippet children({ props })}
							<Label>Password</Label>
							<Input {...props} type="password" bind:value={$formData.password} />
						{/snippet}
					</Control>
					<FieldErrors class="mt-2" />
				</Field>

				<div class="mt-6">
					{#if $delayed}
						<Button disabled class="w-full">Processing...</Button>
					{:else}
						<Button type="submit" class="w-full">Login</Button>
					{/if}
				</div>
			</form>

			<div class="text-center text-sm">
				Don't have an account?
				<a href="/register" class="text-primary font-semibold hover:underline"> Sign up </a>
			</div>
		</Card.Content>
	</Card.Root>
</div>
