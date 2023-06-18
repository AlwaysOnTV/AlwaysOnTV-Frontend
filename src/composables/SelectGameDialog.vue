<template>
	<v-dialog
		v-model="dialog"
		fullscreen
	>
		<v-card>
			<v-toolbar
				dark
				density="compact"
			>
				<v-btn
					icon
					dark
					@click="dialog = false"
				>
					<v-icon>mdi-close</v-icon>
				</v-btn>
				<v-toolbar-title>Select Game</v-toolbar-title>
			</v-toolbar>

			<v-card-text>
				<v-text-field
					v-model="search"
					append-inner-icon="mdi-magnify"
					label="Game Name"
					variant="solo-filled"
					hide-details
				/>
			</v-card-text>

			<v-divider thickness="3" />

			<v-progress-linear
				:indeterminate="loading"
				color="blue"
			/>

			<v-card-text
				style="position: relative; height:100%;"
			>
				<v-virtual-scroll
					style="position: absolute; left: 0; right: 0; top: 0; bottom: 0;"
					:items="filteredGames"
					item-height="100"
				>
					<template #default="{ item }">
						<v-list-item
							class="py-2"
							@click="selectGame(item)"
						>
							<v-list-item-title class="text-h5 font-weight-bold">
								{{ item.title }}
							</v-list-item-title>

							<template #prepend>
								<v-img
									:src="item.thumbnail_url"
									:lazy-src="placeholderImage"
									cover
									:aspect-ratio="16 / 9"
									width="125"
									class="mr-4"
								/>
							</template>
						</v-list-item>
					</template>
				</v-virtual-scroll>
			</v-card-text>
		</v-card>
	</v-dialog>
</template>

<script setup>
// TODO: Add option to create new game
// TODO: Update styling for list - maybe 2 on one row? We need higher thumbnails

import ky from '@/ky';
import { ref, computed } from 'vue';

import placeholderImage from '@/assets/placeholder-500x700.jpg';

const loading = ref(false);
const dialog = ref(false);
const search = ref(null);
const games = ref([]);

const open = async () => {
	dialog.value = true;

	loading.value = true;

	games.value = await ky.get('games').json();

	loading.value = false;
};

const filteredGames = computed(() => {
	return games.value.filter(game => {
		if (!search.value) return true;

		return game.title.toLowerCase().includes(search.value.toLowerCase());
	});
});

const emit = defineEmits(['selectGame']);

const selectGame = game => {
	emit('selectGame', game);

	dialog.value = false;
};

defineExpose({
	open,
});
</script>