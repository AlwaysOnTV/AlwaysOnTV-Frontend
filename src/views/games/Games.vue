<template>
	<v-row
		justify="center"
		class="pa-8"
	>
		<v-btn
			color="primary"
			variant="outlined"
			prepend-icon="mdi-plus"
			@click="openCreateGameDialog"
		>
			Add game
		</v-btn>
	</v-row>

	<v-divider :thickness="3" />

	<v-container>
		<v-row justify="center">
			<v-col
				cols="12"
				sm="6"
				md="6"
				lg="4"
				xl="3"
			>
				<v-text-field
					v-model="gameSearch"
					label="Search games"
					append-inner-icon="mdi-magnify"
					variant="solo-filled"
				/>
			</v-col>
			<v-col
				cols="12"
				sm="6"
				md="6"
				lg="4"
				xl="3"
			>
				<v-pagination
					v-model="page"
					:length="chunkedGames.length"
				/>
			</v-col>
		</v-row>
	</v-container>

	<v-container>
		<v-row class="mb-4">
			<v-col
				v-for="item in chunkedGames[page - 1]"
				:key="item.title"
				cols="6"
				sm="4"
				md="3"
				lg="3"
				xl="2"
			>
				<v-hover v-slot="{ isHovering: hoveringCard, props: propsCard }">
					<v-card
						class="mt-4 mx-2 text-center"
						:elevation="hoveringCard ? 10 : 0"
						v-bind="propsCard"
					>
						<div>
							<v-card-title>
								<span :title="item.title">{{ item.title }}</span>
							</v-card-title>
							<v-card-subtitle>
								<strong>Twitch ID:</strong> {{ item.id }}
							</v-card-subtitle>
							<v-card-subtitle>
								<strong>Total Videos:</strong> {{ item.videoCount }}
							</v-card-subtitle>
							<v-card-text>
								<v-hover v-slot="{ isHovering, props }">
									<v-card
										rounded="false"
										flat
									>
										<v-img
											:src="item.thumbnail_url"
											:lazy-src="placeholderImage"
											cover
											width="100%"
											:aspect-ratio="5 / 7"
											v-bind="props"
										/>

										<v-overlay
											v-if="item.id !== '499973'"
											:model-value="isHovering"
											contained
											class="align-center justify-center"
											scrim="#000000"
											v-bind="props"
										>
											<div class="d-flex flex-column h-100 align-center">
												<v-spacer />

												<v-row>
													<v-btn
														class="mx-2"
														icon="mdi-trash-can"
														size="large"
														color="red-darken-1"
														variant="flat"
														@click="openDeleteDialog(item)"
													>
														<v-tooltip
															activator="parent"
															location="top"
															:eager="false"
														>
															Delete Game
														</v-tooltip>
														<v-icon />
													</v-btn>
												</v-row>

												<v-spacer />
											</div>
										</v-overlay>
									</v-card>
								</v-hover>
							</v-card-text>
						</div>
					</v-card>
				</v-hover>
			</v-col>
		</v-row>
	</v-container>

	<!-- Create Game -->
	<v-dialog
		v-model="createGameDialog"
		width="800"
	>
		<v-card>
			<v-card-title>
				<span class="text-h5">Add a new game</span>
			</v-card-title>
			<v-card-text>
				<v-container>
					<v-row>
						<v-text-field
							v-model="searchInput"
							label="Search"
							append-inner-icon="mdi-magnify"
							placeholder="Just Chatting"
							required
							variant="solo-filled"
							hide-details
						/>
					</v-row>
					<v-row>
						<v-col
							cols="12"
							sm="4"
							class="pl-0"
						>
							<v-img
								:src="selectedGame.box_art_url || placeholderImage"
								cover
								:aspect-ratio="5 / 7"
								width="auto"
							/>
						</v-col>
						<v-col
							cols="12"
							sm="8"
							class="pr-0"
						>
							<div class="d-flex flex-column justify-space-around h-100">
								<div>
									<v-text-field
										v-model="selectedGame.name"
										label="Game"
										readonly
										variant="solo-filled"
										hide-details
									/>
								</div>
								<div>
									<v-text-field
										v-model="selectedGame.id"
										label="Twitch ID"
										readonly
										variant="solo-filled"
										hide-details
									/>
								</div>
							</div>
						</v-col>
					</v-row>
				</v-container>
				<small>Creates a new game</small>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn
					color="red-darken-1"
					variant="text"
					@click="createGameDialog = false"
				>
					Close
				</v-btn>
				<v-btn
					color="green-darken-1"
					variant="text"
					:disabled="!canAddGame"
					:loading="isLoading"
					@click="addNewGame"
				>
					Add
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>

	<!-- Delete Game -->
	<v-dialog
		v-model="deleteDialog"
		width="auto"
	>
		<v-card>
			<v-card-title>
				Deleting {{ deletingGame.title }}
			</v-card-title>
			<v-card-text>
				Do you really want to delete {{ deletingGame.title }}?
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn
					color="red-darken-1"
					variant="text"
					@click="deletingGame = false"
				>
					Cancel
				</v-btn>
				<v-btn
					color="green-darken-1"
					variant="text"
					:loading="isLoading"
					@click="deleteGame(deletingGame)"
				>
					Delete
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>

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
import _ from 'lodash';
import { onMounted, ref, watch, computed } from 'vue';
import { useDisplay } from 'vuetify';

import placeholderImage from '@/assets/placeholder-500x700.jpg';

const createGameDialog = ref(false);
const games = ref([]);
const selectedGame = ref({});

const deleteDialog = ref(false);
const deletingGame = ref(false);

const gameSearch = ref('');
const page = ref(1);

watch(deletingGame, (newValue) => {
	deleteDialog.value = !!newValue;
});

const snackbar = ref(false);
const snackbarText = ref('');

const { name } = useDisplay();
const chunkedGames = computed(() => {
	let chunk = 6; // Default for lg+

	switch (name.value) {
	case 'xs':
		chunk = 4;
		break;
	case 'sm':
		chunk = 6;
		break;
	case 'md':
		chunk = 8;
		break;
	case 'lg':
		chunk = 8;
		break;
	case 'xl':
		chunk = 12;
		break;
	case 'xxl':
		chunk = 12;
		break;
	default:
		chunk = 12;
		break;
	}

	const filtered = _.filter(games.value, (game) => {
		if (!gameSearch.value) return true;

		return game.title.toLowerCase().includes(gameSearch.value.toLowerCase());
	});

	return _.chunk(filtered, chunk);
});

watch(chunkedGames, (newValue) => {
	if (page.value >= newValue.length)
		page.value = Math.max(1, newValue.length);
});

const fetchGames = async () => {
	games.value = await ky.get('games').json();
};

onMounted(fetchGames);

const openCreateGameDialog = () => {
	selectedGame.value = {};
	createGameDialog.value = true;
};

const canAddGame = computed(() => {
	if (!selectedGame.value) return false;

	const isDuplicate = games.value.some(
		(game) => game.title === selectedGame.value.name || game.id === selectedGame.value.id,
	);

	return !isDuplicate;
});

const addNewGame = async () => {
	const gameData = {
		name: selectedGame.value.name,
		twitch_id: selectedGame.value.id,
		thumbnail_url: selectedGame.value.box_art_url,
	};

	// Check if the game already exists in the list
	const isDuplicate = games.value.some(
		(game) => game.title === gameData.name && game.id === gameData.twitch_id,
	);

	if (isDuplicate) {
		console.error('Game already exists.');
		return;
	}

	try {
		await ky
			.put('games', {
				json: {
					gameId: gameData.twitch_id,
					title: gameData.name,
					thumbnail_url: gameData.thumbnail_url,
				},
			})
			.json();

		await fetchGames();

		createGameDialog.value = false;
		selectedGame.value = {};

		snackbar.value = true;
		snackbarText.value = 'Successfully added game.';
	}
	catch (error) {
		const message = await error.response.text();

		snackbar.value = true;
		snackbarText.value = message;
	}
};

const openDeleteDialog = item => {
	deletingGame.value = item;
};

const deleteGame = async (game) => {
	try {
		await ky.post(`games/id/${game.id}/delete`, {
			json: {
				force: game.videoCount > 0,
			},
		}).json();

		await fetchGames();

		snackbar.value = true;
		snackbarText.value = 'Successfully deleted game.';

		deleteDialog.value = false;
	}
	catch (error) {
		const message = await error.response.text();

		snackbar.value = true;
		snackbarText.value = message;
	}
};

const searchInput = ref('');

watch(searchInput, (newValue) => {
	if (newValue === '') return;

	searchForGameOnTwitch();
});

const searchForGameOnTwitch = _.debounce(async () => {
	if (!searchInput.value) {
		selectedGame.value = {};
	} else {
		const searchTerm = searchInput.value.toLocaleLowerCase();

		try {
			const games = await ky
				.post('twitch/get-game', {
					json: {
						name: searchTerm,
					},
				})
				.json();

			if (!games.length) {
				console.error('No games found with that name');
				return;
			}
			selectedGame.value = games[0];
			selectedGame.value.box_art_url = selectedGame.value.box_art_url.replace(
				'{width}x{height}',
				'500x700',
			);
		} catch (error) {
			const message = await error.response.text();

			snackbar.value = true;
			snackbarText.value = message;
		}
	}
}, 500);
</script>
