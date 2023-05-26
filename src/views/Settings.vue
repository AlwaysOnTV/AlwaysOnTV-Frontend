<template>
	<v-row
		justify="center"
		class="mt-2"
	>
		<v-card
			class="mx-auto mt-2"
			min-width="400"
			width="30%"
			height="auto"
		>
			<v-card-title>
				Setup
			</v-card-title>
			<v-card-text class="py-0">
				<v-card variant="tonal">
					<v-card-title>
						Generic Settings
					</v-card-title>
					<v-card-text>
						<v-checkbox
							v-model="selected"
							hide-details
							label="Use random video playlist"
						/>
					</v-card-text>
				</v-card>

				<v-divider
					thickness="3"
					class="my-4"
				/>

				<v-card
					variant="tonal"
					class="pt-4"
				>
					<v-card-title>
						Twitch Connection
					</v-card-title>
					<v-card-subtitle> Channel: {{ channelNameAndLogin }} </v-card-subtitle>
					<v-card-text>
						<v-text-field
							v-model="streamingTitle"
							color="dark"
							label="Streaming Title"
							variant="solo-filled"
							hide-details
							hint="If you want to use the video title in your streaming title use this: {{videotitle}}"
						/>

						<v-text-field
							v-model="clientID"
							class="my-2"
							:append-icon="showClientID ? 'mdi-eye' : 'mdi-eye-off'"
							:type="showClientID ? 'text' : 'password'"
							label="Client ID"
							variant="solo-filled"
							hide-details
							@click:append="showClientID = !showClientID"
						>
							<template #append />
						</v-text-field>
						<v-text-field
							v-model="clientSecret"
							class="my-2"
							:append-icon="showClientSecret ? 'mdi-eye' : 'mdi-eye-off'"
							:type="showClientSecret ? 'text' : 'password'"
							label="Client Secret"
							variant="solo-filled"
							hide-details
							@click:append="showClientSecret = !showClientSecret"
						>
							<template #append />
						</v-text-field>

						<v-btn
							color="purple"
							variant="outlined"
							prepend-icon="mdi-twitch"
							:loading="isAuthenticating"
							:disabled="!canAuthenticate"
							class="my-2"
							@click="openAuth"
						>
							Connect With Twitch
						</v-btn>
					</v-card-text>
				</v-card>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn
					class="px-4"
					color="green"
					variant="outlined"
					prepend-icon="mdi-content-save"
					:disabled="!canSave"
					:loading="isLoading"
					@click="saveSettings"
				>
					Save
				</v-btn>
				<v-spacer />
			</v-card-actions>
		</v-card>
	</v-row>

	<v-snackbar
		v-model="snackbar"
		timeout="3000"
	>
		{{ snackbarText }}

		<template #actions>
			<v-btn
				color="blue"
				variant="text"
				@click="snackbar = false"
			>
				Close
			</v-btn>
		</template>
	</v-snackbar>
</template>

<script setup>
import ky, { isLoading } from '@/ky';
import { onMounted, ref, computed } from 'vue';

const settingsData = ref({});
const showClientID = ref(false);
const showClientSecret = ref(false);
const isAuthenticating = ref(false);
const selected = ref(false);

const streamingTitle = ref('');
const clientID = ref('');
const clientSecret = ref('');

const snackbar = ref(false);
const snackbarText = ref('');

const canAuthenticate = computed(() => {
	if (!settingsData.value?.twitch?.client_id)
		return false;

	if (!settingsData.value?.twitch?.client_secret)
		return false;

	return true;
});

const canSave = computed(() => {
	if (streamingTitle.value !== settingsData.value?.title_replacement)
		return true;

	if (clientID.value !== settingsData.value?.twitch?.client_id)
		return true;

	if (clientSecret.value !== settingsData.value?.twitch?.client_secret)
		return true;

	if (selected.value !== settingsData.value?.use_random_playlist) return true;

	return false;
});

const channelNameAndLogin = computed(() => {
	const twitch = settingsData.value?.twitch?.data;

	if (!twitch) return 'Not connected';

	return `${twitch.display_name} (${twitch.login})`;
});

const getSettings = async () => {
	settingsData.value = await ky.get('settings').json();

	streamingTitle.value = settingsData.value.title_replacement;
	clientID.value = settingsData.value.twitch.client_id;
	clientSecret.value = settingsData.value.twitch.client_secret;
	selected.value = settingsData.value.use_random_playlist;
};

onMounted(getSettings);

const openAuth = async () => {
	isAuthenticating.value = true;

	const authWindow = window.open(
		'http://localhost:8085/auth/connect/twitch',
		'authWindow',
	);

	const checkWindowClosed = setInterval(() => {
		if (!authWindow || authWindow.closed) {
			isAuthenticating.value = false;

			clearInterval(checkWindowClosed);
		}
	}, 100);

	const listener = window.addEventListener('message', async (event) => {
		if (event.source !== authWindow) return;

		authWindow.close();

		isAuthenticating.value = false;

		window.removeEventListener('message', listener);

		// -- Data
		const { data } = event;
		if (data.status === 200) {
			snackbar.value = true;
			snackbarText.value = data.message;

			await getSettings();
		}
		else {
			snackbar.value = true;
			snackbarText.value = `Error ${data.status}: ${data.message}`;
		}
	});
};

const saveSettings = async () => {
	const data = await ky
		.post('settings', {
			json: {
				title_replacement: streamingTitle.value,
				client_id: clientID.value,
				client_secret: clientSecret.value,
				use_random_playlist: selected.value,
			},
		})
		.json();
	
	if (data.status !== 200) {
		snackbar.value = true;
		snackbarText.value = data.message;
		return;
	}
	
	await getSettings();
	
	snackbar.value = true;
	snackbarText.value = 'Successfully updated settings.';
};
</script>
