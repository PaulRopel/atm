<script lang="ts">
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { registerUserSchema, type RegisterFormData } from '$lib/schemas/auth';
	import { Field } from 'formsnap';
	import { Button, Control, FieldErrors, Label } from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import * as Card from '$lib/components/ui/card/index.js';
	import { authClient } from '$lib/domain/auth/auth.client';
	import { goto } from '$app/navigation';

	const data = $props();

	const form = superForm(data, {
		validators: zodClient(registerUserSchema),
		dataType: 'json',
		onSubmit: async ({ formData, cancel }) => {
			cancel();
			try {
				const data = Object.fromEntries(formData);
				await authClient.register({
					email: data.email as string,
					password: data.password as string,
					name: data.name as string
				});
				goto('/login');
			} catch (error) {
				return {
					type: 'error',
					text: 'Registration failed. Please try again.'
				};
			}
		}
	});

	const { form: formData, enhance, delayed, message } = form;
</script>

<div class="flex min-h-screen items-center justify-center">
	<Card.Root class="w-full max-w-sm p-6">
		<Card.Header>
			<Card.Title class="text-2xl">Register</Card.Title>
			<Card.Description>Create your account.</Card.Description>
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

				<Field {form} name="name">
					<Control>
						{#snippet children({ props })}
							<Label>Name</Label>
							<Input {...props} bind:value={$formData.name} />
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
						<Button type="submit" class="w-full">Register</Button>
					{/if}
				</div>
			</form>

			<div class="text-center text-sm">
				Already have an account?
				<a href="/login" class="text-primary font-semibold hover:underline"> Sign in </a>
			</div>
		</Card.Content>
	</Card.Root>
</div>
