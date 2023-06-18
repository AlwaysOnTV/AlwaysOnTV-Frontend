<template>
	<v-container
		fluid
		class="h-100"
	>
		<div
			class="d-flex flex-column h-100"
		>
			<v-row>
				<v-col
					sm="12"
					xl="6"
				>
					<v-card
						class="h-100"
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
									<p v-if="getQueueLength === 1">
										There is <strong>{{ getQueueLength }}</strong> video in the queue
									</p>
									<p v-else>
										There are <strong>{{ getQueueLength }}</strong> videos in the queue
									</p>

									<p>
										<strong>Estimated length:</strong> {{ queueLength }}
									</p>
								</v-card-subtitle>

								<v-card-text class="pb-0">
									<v-row>
										<v-col cols="3">
											<v-img
												:src="currentVideo.thumbnail_url"
												:lazy-src="placeholderImage"
												:aspect-ratio="16/9"
												width="auto"
												cover
												class="mr-5"
											/>
										</v-col>
										<v-col
											cols="12"
											md="9"
											class="d-flex flex-column text-center"
										>
											<span class="text-h5 mb-2 font-weight-medium">{{ currentVideo.title }}</span>
											<span class="text-subtitle-1">{{ videoProgressString }}</span>
											<v-slider
												v-model="sliderValue"
												:min="0"
												:max="videoLength"
												:disabled="videoLoading"
												density="compact"
												hide-details
												thumb-label
												@start="sliderStartDrag"
												@end="sliderEndDrag"
											>
												<template #thumb-label="{}">
													{{ videoThumb }}
												</template>
											</v-slider>

											<div class="d-flex flex-row">
												<v-spacer />
												<v-btn
													class="mr-2"
													:icon="videoPlaying ? 'mdi-pause' : 'mdi-play'"
													:loading="videoLoading"
													@click="updatePlayingState"
												>
													<v-tooltip
														activator="parent"
														location="top"
														:eager="false"
													>
														{{ videoPlaying ? 'Pause' : 'Play' }}
													</v-tooltip>
													<v-icon />
												</v-btn>
												<v-btn
													class="mr-2"
													icon="mdi-skip-next"
													:loading="videoLoading"
													@click="skipVideo"
												>
													<v-tooltip
														activator="parent"
														location="top"
														:eager="false"
													>
														Skip
													</v-tooltip>
													<v-icon />
												</v-btn>
												<v-btn
													icon="mdi-refresh"
													:loading="videoLoading"
													@click="refreshVideo"
												>
													<v-tooltip
														activator="parent"
														location="top"
														:eager="false"
													>
														Refresh
													</v-tooltip>
													<v-icon />
												</v-btn>
												<v-spacer />
											</div>
										</v-col>
									</v-row>
								</v-card-text>
							</div>

							<v-divider thickness="3" />

							<v-card-text
								style="position: relative; height:100%;"
							>
								<v-virtual-scroll
									style="position: absolute; left: 0; right: 0; top: 0; bottom: 0;"
									:items="queueData.items"
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
				</v-col>
				<v-col
					sm="12"
					xl="6"
				>
					<v-card
						class="h-100"
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
									<p v-if="getHistoryLength === 1">
										There is <strong>{{ getHistoryLength }}</strong> video in the history
									</p>
									<p v-else>
										There are <strong>{{ getHistoryLength }}</strong> videos in the history
									</p>
								</v-card-subtitle>
							</div>

							<v-divider thickness="3" />

							<v-card-text
								style="position: relative; height:100%;"
							>
								<v-virtual-scroll
									style="position: absolute; left: 0; right: 0; top: 0; bottom: 0;"
									:items="historyData.items"
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
												<br>
												<strong>Played At:</strong> {{ item.played_at }}
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
				</v-col>
			</v-row>
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
import { socket, asyncEmit } from '@/socket';

import SelectVideoDialog from '@/composables/SelectVideoDialog.vue';
import SelectPlaylistDialog from '@/composables/SelectPlaylistDialog.vue';
import QueueVideoItem from '@/composables/QueueVideoItem.vue';

import placeholderImage from '@/assets/placeholder-500x700.jpg';
import { Duration } from 'luxon';

const videoProgress = ref(0);
const videoLength = ref(0);
const videoPlaying = ref(false);

const currentVideo = computed(() => {
	return queueData.value.current_video;
});

const videoThumb = computed(() => {
	const progress = Duration.fromObject({ seconds: sliderValue.value });

	return progress.toFormat('hh:mm:ss');
});

const videoProgressString = computed(() => {
	const total = Duration.fromObject({ seconds: videoLength.value });

	return `${videoThumb.value} / ${total.toFormat('hh:mm:ss')}`;
});

const queueLength = computed(() => {
	let progress = Duration.fromMillis(0);

	for (const video of queueData.value.items) {
		progress = progress.plus({ seconds: video.length });
	}

	if (progress.as('days') >= 1) {
		const progressWithoutDays = progress.minus({ days: Math.floor(progress.as('days')) });
		return `${progress.toFormat('d \'days\'')}, ${progressWithoutDays.toFormat('h \'hours\', m \'minutes\', s \'seconds\'')}`;
	}
	else {
		return progress.toFormat('h \'hours\', m \'minutes\', s \'seconds\'');
	}
});

const sliderValue = ref(0);
const requestUpdate = ref(false);

const sliderDragging = ref(false);
const sliderStartDrag = () => {
	sliderDragging.value = true;
};

const sliderEndDrag = (value) => {
	socket.emit('set_video_time', value);

	videoLoading.value = true;
	sliderDragging.value = false;
	requestUpdate.value = true;
};

const videoLoading = ref(false);
const skipVideo = () => {
	videoLoading.value = true;

	socket.emit('skip_video');
};

const refreshVideo = () => {
	videoLoading.value = true;

	socket.emit('refresh_video');
};

socket.on('update_dashboard', msg => {
	if (msg.time <= 1 || requestUpdate.value) {
		videoLoading.value = false;
		requestUpdate.value = false;
	}

	videoProgress.value = Math.round(msg.time);
	videoLength.value = Math.round(msg.time) + Math.round(msg.timeToEnd);

	videoPlaying.value = msg.isPlaying;

	if (sliderDragging.value) return;
	sliderValue.value = videoProgress.value;
});

const updatePlayingState = () => {
	socket.emit('update_playing_state', !videoPlaying.value);
};

socket.on('update_playing_state', isPlaying => {
	videoPlaying.value = isPlaying;
});

socket.on('next_video', async () => {
	videoLoading.value = true;

	queueData.value = await ky.get('queue').json();
	historyData.value = await ky.get('history').json();
});

socket.on('queue_history_update', ({ queue, history }) => {
	queueData.value = queue;
	historyData.value = history;
});

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
	try {
		await ky
			.post('queue', {
				json: {
					index: editQueuePositionIndex.value,
					newIndex: editQueuePositionInput.value - 1,
				},
			})
			.json();

		socket.emit('queue_history_update');

		editQueuePositionDialog.value = false;

		snackbar.value = true;
		snackbarText.value = 'Successfully edited queue.';
	}
	catch (error) {
		const message = await error.response.text();

		snackbar.value = true;
		snackbarText.value = message;
	}
};

const editQueuePositionStart = async (index) => {
	try {
		await ky
			.post('queue', {
				json: {
					index: index,
					newIndex: 'start',
				},
			})
			.json();

		socket.emit('queue_history_update');

		editQueuePositionDialog.value = false;

		snackbar.value = true;
		snackbarText.value = 'Successfully moved the video to the beginning.';
	}
	catch (error) {
		const message = await error.response.text();

		snackbar.value = true;
		snackbarText.value = message;
	}
};

const editQueuePositionEnd = async (index) => {
	try {
		await ky
			.post('queue', {
				json: {
					index: index,
					newIndex: 'end',
				},
			})
			.json();

		socket.emit('queue_history_update');

		editQueuePositionDialog.value = false;

		snackbar.value = true;
		snackbarText.value = 'Successfully moved the video to the end.';
	}
	catch (error) {
		const message = await error.response.text();

		snackbar.value = true;
		snackbarText.value = message;
	}
};

const deleteVideoFromQueue = async (index) => {
	try {
		await ky
			.delete(`queue/${index}`)
			.json();

		socket.emit('queue_history_update');

		snackbar.value = true;
		snackbarText.value = 'Successfully deleted video from queue.';
	}
	catch (error) {
		const message = await error.response.text();

		snackbar.value = true;
		snackbarText.value = message;
	}
};

// ---

const deleteDialog = ref(false);

const queueData = ref({
	current_video: {},
	items: [],
});
const historyData = ref({
	items: [],
});

const snackbar = ref(false);
const snackbarText = ref('');

onMounted(async () => {
	videoLoading.value = true;

	queueData.value = await ky.get('queue').json();
	historyData.value = await ky.get('history').json();

	videoLength.value = queueData.value.current_video.length || 0;
	videoProgress.value = await asyncEmit('request_video_time');
	sliderValue.value = videoProgress.value;

	videoLoading.value = false;
});

const getQueueLength = computed(() => {
	return queueData.value.items.length;
});

const isQueueEmpty = computed(() => {
	return !getQueueLength.value;
});

const getHistoryLength = computed(() => {
	return historyData.value.items.length;
});

const isHistoryEmpty = computed(() => {
	return !getHistoryLength.value;
});

const addNewVideoToQueue = async () => {
	const videoData = {
		id: selectedVideo.value.id,
		title: selectedVideo.value.title,
	};

	try {
		await ky
			.put('queue/video', {
				json: {
					videoId: videoData.id,
				},
			})
			.json();

		socket.emit('queue_history_update');

		addVideoDialog.value = false;

		snackbar.value = true;
		snackbarText.value = 'Successfully added video.';
	}
	catch (error) {
		const message = await error.response.text();

		snackbar.value = true;
		snackbarText.value = message;
	}
};

const clearQueue = async () => {
	try {
		await ky
			.delete('queue')
			.json();

		socket.emit('queue_history_update');

		deleteDialog.value = false;

		snackbar.value = true;
		snackbarText.value = 'Successfully cleared queue.';
	}
	catch (error) {
		const message = await error.response.text();

		snackbar.value = true;
		snackbarText.value = message;
	}
};

const addToQueueFromHistory = async (videoId) => {
	try {
		await ky
			.put('queue/video', {
				json: {
					videoId,
				},
			})
			.json();

		socket.emit('queue_history_update');

		snackbar.value = true;
		snackbarText.value = 'Successfully added video.';
	}
	catch (error) {
		const message = await error.response.text();

		snackbar.value = true;
		snackbarText.value = message;
	}
};

const addNewPlaylistToQueue = async () => {
	const playlistData = {
		id: selectedPlaylist.value.id,
		title: selectedPlaylist.value.title,
	};

	try {
		await ky
			.put('queue/playlist', {
				json: {
					playlistId: playlistData.id,
				},
			})
			.json();

		socket.emit('queue_history_update');

		addPlaylistDialog.value = false;

		snackbar.value = true;
		snackbarText.value = 'Successfully added playlist to queue.';
	}
	catch (error) {
		const message = await error.response.text();

		snackbar.value = true;
		snackbarText.value = message;
	}
};
</script>
