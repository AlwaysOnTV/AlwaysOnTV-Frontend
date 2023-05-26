<template>
	<v-container
		fluid
		class="h-100"
	>
		<div class="d-flex flex-column h-100">
			<v-card
				class="my-4 h-100"
			>
				<div class="d-flex flex-column h-100">
					<div class="my-4">
						<div class="d-flex align-center mr-4">
							<v-card-title class="text-h3 mb-4">
								Queue
							</v-card-title>

							<v-spacer />
							
							<v-btn
								class="mx-2"
								color="blue"
								variant="outlined"
								prepend-icon="mdi-plus"
								@click="openAddVideoDialog"
							>
								Add Video To Queue
							</v-btn>

							<v-btn
								class="mx-2"
								color="blue"
								variant="outlined"
								prepend-icon="mdi-plus"
								@click="openAddPlaylistDialog"
							>
								Add Playlist To Queue
							</v-btn>

							<v-btn
								class="mx-2"
								color="red"
								variant="outlined"
								prepend-icon="mdi-delete"
								:disabled="isQueueEmpty"
								@click="deleteDialog = true"
							>
								Clear Queue
							</v-btn>
						</div>
	
						<v-card-subtitle v-if="isQueueEmpty">
							The queue is empty.
						</v-card-subtitle>
						<v-card-subtitle v-else>
							There are {{ getQueueLength }} videos in the queue.
						</v-card-subtitle>
					</div>

					<v-divider thickness="3" />

					<v-card-text
						style="position: relative; height:100%;"
					>
						<v-virtual-scroll
							style="position: absolute; left: 0; right: 0; top: 0; bottom: 0;"
							:items="queueData"
							item-height="100"
						>
							<template #default="{ item, index }">								
								<QueueVideoItem
									:item="item"
									:index="index"

									:loading="isLoading"

									@open-edit-pos="openEditQueuePositionDialog"
									@delete-from-queue="deleteVideoFromQueue"
									@edit-pos-start="editQueuePositionStart"
									@edit-pos-end="editQueuePositionEnd"
								/>
							</template>
						</v-virtual-scroll>
					</v-card-text>
				</div>
			</v-card>

			<v-spacer />

			<v-card
				class="my-4 h-100"
			>
				<div class="d-flex flex-column h-100">
					<div class="my-4">
						<v-card-title class="text-h3 my-4">
							History
						</v-card-title>
						<v-card-subtitle v-if="isHistoryEmpty">
							The history is empty.
						</v-card-subtitle>
						<v-card-subtitle v-else>
							There are {{ getHistoryLength }} videos in the history.
						</v-card-subtitle>
					</div>

					<v-divider thickness="3" />

					<v-card-text
						style="position: relative; height:100%;"
					>
						<v-virtual-scroll
							style="position: absolute; left: 0; right: 0; top: 0; bottom: 0;"
							:items="historyData"
							item-height="100"
						>
							<template #default="{ item }">
								<v-list-item
									class="py-4"
								>
									<v-list-item-title>
										{{ item.title }}
									</v-list-item-title>
									
									<v-list-item-subtitle>
										<strong>Game:</strong> {{ item.game?.title || item.gameId }}
									</v-list-item-subtitle>

									<template #prepend>
										<v-img
											:src="item.thumbnail_url"
											:lazy-src="placeholderImage"
											:aspect-ratio="16/9"
											width="125"
											cover
											class="mr-5"
										/>

										<v-btn
											icon="mdi-youtube"
											size="x-small"
											variant="tonal"
											class="mr-3"
											color="red"
											:href="'https://youtu.be/' + item.id"
											target="_blank"
										>
											<v-tooltip
												activator="parent"
												location="top"
												:eager="false"
											>
												Watch On YouTube
											</v-tooltip>
											<v-icon />
										</v-btn>
									</template>

									<template #append>
										<v-btn
											icon="mdi-clock-outline"
											size="x-small"
											color="orange-darken-4"
											variant="tonal"
											class="mr-1"
											@click="addToQueueFromHistory(item.id)"
										>
											<v-tooltip
												activator="parent"
												location="top"
												:eager="false"
											>
												Queue Video
											</v-tooltip>
											<v-icon />
										</v-btn>
									</template>
								</v-list-item>
							</template>
						</v-virtual-scroll>
					</v-card-text>
				</div>
			</v-card>
		</div>
	</v-container>

	<!-- Edit queue position -->
	<v-dialog
		v-model="editQueuePositionDialog"
		max-width="500"
	>
		<v-card>
			<v-card-title class="headline">
				Edit Position
			</v-card-title>
			<v-card-text>
				<v-text-field
					v-model.number="editQueuePositionInput"
					label="New Position"
					variant="solo-filled"
					hide-details
				/>
			</v-card-text>
			<v-card-actions>
				<v-btn
					color="red-darken-1"
					text
					@click="editQueuePositionDialog = false"
				>
					Cancel
				</v-btn>
				<v-btn
					color="green-darken-1"
					text
					:loading="isLoading"
					@click="editQueuePosition"
				>
					Save
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>

	<!-- Add playlist to queue -->
	<v-dialog
		v-model="addPlaylistDialog"
		width="800"
	>
		<v-card>
			<v-card-title>
				<span class="text-h5">Adds a playlist to the queue</span>
			</v-card-title>
			<v-card-text>
				<v-container>
					<v-row>
						<v-btn
							color="green-darken-1"
							variant="text"
							prepend-icon="mdi-magnify"
							@click="openSelectPlaylistDialog"
						>
							Select Playlist
						</v-btn>
					</v-row>

					<v-row>
						<v-col
							cols="12"
							sm="6"
							class="pl-0"
						>
							<v-img
								:src="selectedPlaylist.thumbnail_url || placeholderImage"
								cover
								:aspect-ratio="16 / 9"
								width="auto"
							/>
						</v-col>
						<v-col
							cols="12"
							sm="6"
							class="pr-0"
						>
							<div class="d-flex flex-column justify-space-around h-100">
								<div>
									<v-text-field
										v-model="selectedPlaylist.title"
										label="Playlist"
										readonly
										variant="solo-filled"
										hide-details
									/>
								</div>
								<div>
									<v-text-field
										v-model="selectedPlaylist.id"
										label="Playlist ID"
										readonly
										variant="solo-filled"
										hide-details
									/>
								</div>
							</div>
						</v-col>
					</v-row>
				</v-container>
				<small>Adds a playlist to the queue</small>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn
					color="red-darken-1"
					variant="text"
					@click="addPlaylistDialog = false"
				>
					Close
				</v-btn>
				<v-btn
					color="green-darken-1"
					variant="text"
					:disabled="!selectedPlaylist"
					:loading="isLoading"
					@click="addNewPlaylistToQueue"
				>
					Add
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>

	<!-- Add video to queue -->
	<v-dialog
		v-model="addVideoDialog"
		width="800"
	>
		<v-card>
			<v-card-title>
				<span class="text-h5">Adds a video to the queue</span>
			</v-card-title>
			<v-card-text>
				<v-container>
					<v-row>
						<v-btn
							color="green-darken-1"
							variant="text"
							prepend-icon="mdi-magnify"
							@click="openSelectVideoDialog"
						>
							Select Video
						</v-btn>
					</v-row>

					<v-row>
						<v-col
							cols="12"
							sm="6"
							clöass="pl-0"
						>
							<v-img
								:src="selectedVideo.thumbnail_url || placeholderImage"
								cover
								:aspect-ratio="16 / 9"
								width="auto"
							/>
						</v-col>
						<v-col
							cols="12"
							sm="6"
							class="pr-0"
						>
							<div class="d-flex flex-column justify-space-around h-100">
								<div>
									<v-text-field
										v-model="selectedVideo.title"
										label="Video"
										readonly
										variant="solo-filled"
										hide-details
									/>
								</div>
								<div>
									<v-text-field
										v-model="selectedVideo.id"
										label="Video ID"
										readonly
										variant="solo-filled"
										hide-details
									/>
								</div>
							</div>
						</v-col>
					</v-row>
				</v-container>
				<small>Adds a video to the queue</small>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn
					color="red-darken-1"
					variant="text"
					@click="addVideoDialog = false"
				>
					Close
				</v-btn>
				<v-btn
					color="green-darken-1"
					variant="text"
					:disabled="!selectedVideo"
					:loading="isLoading"
					@click="addNewVideoToQueue"
				>
					Add
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>

	<!-- Select Video -->
	<SelectVideoDialog
		ref="selectVideoDialog"
		@select-video="selectVideo"
	/>

	<!-- Select Playlist -->
	<SelectPlaylistDialog
		ref="selectPlaylistDialog"
		@select-playlist="selectPlaylist"
	/>

	<!-- Clear the queue -->
	<v-dialog
		v-model="deleteDialog"
		width="auto"
	>
		<v-card>
			<v-card-title> Clearing the entire queue </v-card-title>
			<v-card-text>
				Do you really want to delete the entire queue?
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn
					color="red-darken-1"
					variant="text"
					@click="deleteDialog = false"
				>
					Cancel
				</v-btn>
				<v-btn
					color="green-darken-1"
					variant="text"
					:loading="isLoading"
					@click="clearQueue"
				>
					Clear Queue
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>

	<!-- Snackbar -->
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

import SelectVideoDialog from '@/composables/SelectVideoDialog.vue';
import SelectPlaylistDialog from '@/composables/SelectPlaylistDialog.vue';
import QueueVideoItem from '@/composables/QueueVideoItem.vue';

import placeholderImage from '@/assets/placeholder-500x700.jpg';

// ---
// Select Video

const addVideoDialog = ref(false);

const openAddVideoDialog = () => {
	addVideoDialog.value = true;
	openSelectVideoDialog();	
};

const selectVideoDialog = ref(null);
const selectedVideo = ref(false);

const openSelectVideoDialog = () => {
	selectVideoDialog.value.open();
};

const selectVideo = video => {
	selectedVideo.value = video;
};

// ---

// ---
// Select Playlist

const addPlaylistDialog = ref(false);

const openAddPlaylistDialog = () => {
	addPlaylistDialog.value = true;
	openSelectPlaylistDialog();	
};

const selectPlaylistDialog = ref(null);
const selectedPlaylist = ref(false);

const openSelectPlaylistDialog = () => {
	selectPlaylistDialog.value.open();
};

const selectPlaylist = playlist => {
	selectedPlaylist.value = playlist;
};

// ---

// ---
// Queue Video Items

const editQueuePositionDialog = ref(false);
const editQueuePositionIndex = ref(false);
const editQueuePositionInput = ref('');

const openEditQueuePositionDialog = index => {
	editQueuePositionInput.value = '';
	editQueuePositionIndex.value = index;
	editQueuePositionDialog.value = true;
};

const editQueuePosition = async () => {
	const result = await ky
		.post('queue', {
			json: {
				index: editQueuePositionIndex.value,
				newIndex: editQueuePositionInput.value - 1,
			},
		})
		.json();

	if (result.status !== 200) {
		snackbar.value = true;
		snackbarText.value = result.message;
		return;
	}

	queueData.value = await ky.get('queue').json();

	editQueuePositionDialog.value = false;

	snackbar.value = true;
	snackbarText.value = 'Successfully edited queue.';
};

const editQueuePositionStart = async (index) => {
	const result = await ky
		.post('queue', {
			json: {
				index: index,
				newIndex: 'start',
			},
		})
		.json();

	if (result.status !== 200) {
		snackbar.value = true;
		snackbarText.value = result.message;
		return;
	}

	queueData.value = await ky.get('queue').json();

	editQueuePositionDialog.value = false;

	snackbar.value = true;
	snackbarText.value = 'Successfully moved the video to the beginning.';
};

const editQueuePositionEnd = async (index) => {
	const result = await ky
		.post('queue', {
			json: {
				index: index,
				newIndex: 'end',
			},
		})
		.json();

	if (result.status !== 200) {
		snackbar.value = true;
		snackbarText.value = result.message;
		return;
	}

	queueData.value = await ky.get('queue').json();

	editQueuePositionDialog.value = false;

	snackbar.value = true;
	snackbarText.value = 'Successfully moved the video to the end.';
};

const deleteVideoFromQueue = async (index) => {
	const result = await ky
		.delete(`queue/${index}`)
		.json();

	if (result.status !== 200) {
		snackbar.value = true;
		snackbarText.value = result.message;
		return;
	}

	queueData.value = await ky.get('queue').json();

	snackbar.value = true;
	snackbarText.value = result.message;
};

// ---

const deleteDialog = ref(false);

const queueData = ref([]);
const historyData = ref([]);
const playlistData = ref([]);

const snackbar = ref(false);
const snackbarText = ref('');

onMounted(async () => {
	queueData.value = await ky.get('queue').json();
	historyData.value = await ky.get('history').json();
	playlistData.value = await ky.get('playlists').json();
});

const getQueueLength = computed(() => {
	return queueData.value.length;
});

const isQueueEmpty = computed(() => {
	return !getQueueLength.value;
});

const getHistoryLength = computed(() => {
	return historyData.value.length;
});

const isHistoryEmpty = computed(() => {
	return !getHistoryLength.value;
});


const addNewVideoToQueue = async () => {
	const videoData = {
		id: selectedVideo.value.id,
		title: selectedVideo.value.title,
	};

	const addedvideoq = await ky
		.put('queue/video', {
			json: {
				videoId: videoData.id,
			},
		})
		.json();

	if (addedvideoq.status !== 200) {
		snackbar.value = true;
		snackbarText.value = addedvideoq.message;
		return;
	}

	queueData.value = await ky.get('queue').json();

	addVideoDialog.value = false;

	snackbar.value = true;
	snackbarText.value = 'Successfully added video.';
};

const clearQueue = async () => {
	const result = await ky.delete('queue').json();

	if (result.status !== 200) {
		snackbar.value = true;
		snackbarText.value = result.message;
		return;
	}

	queueData.value = await ky.get('queue').json();

	deleteDialog.value = false;

	snackbar.value = true;
	snackbarText.value = 'Successfully cleared queue.';
};

const addToQueueFromHistory = async (videoId) => {
	const result = await ky
		.put('queue/video', {
			json: {
				videoId,
			},
		})
		.json();

	if (result.status !== 200) {
		snackbar.value = true;
		snackbarText.value = result.message;
		return;
	}

	queueData.value = await ky.get('queue').json();

	snackbar.value = true;
	snackbarText.value = 'Successfully added video.';
};

const addNewPlaylistToQueue = async () => {
	const playlistData = {
		id: selectedPlaylist.value.id,
		title: selectedPlaylist.value.title,
	};

	const addedplaylistq = await ky
		.put('queue/playlist', {
			json: {
				playlistId: playlistData.id,
			},
		})
		.json();

	if (addedplaylistq.status !== 200) {
		snackbar.value = true;
		snackbarText.value = addedplaylistq.message;
		return;
	}

	queueData.value = await ky.get('queue').json();

	addPlaylistDialog.value = false;

	snackbar.value = true;
	snackbarText.value = 'Successfully added playlist.';
};
</script>
