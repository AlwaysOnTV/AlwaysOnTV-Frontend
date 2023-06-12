<template>
	<div>
		<!-- <video
			id="videoPlayer"
			playsinline
			:controls="!hideControls"
			autoplay
		/> -->
		<video
			id="videoPlayer"
			autoplay
			controls
		/>

		<!-- <audio
			id="audioPlayer"
			group="merge"
		/> -->
	</div>
</template>

<script setup>
import Plyr from 'plyr';
import { queue, getMPDForVideo } from '@/ky';
import emitter from '@/event-bus';
import { onMounted, ref } from 'vue';
import { MediaPlayer } from 'dashjs';
import { onUnmounted } from 'vue';

import { socket } from '@/socket';

const hideControls = ref(false);
const dashjsPlayer = ref(false);
const plyrPlayer = ref(false);
const videoBitrates = ref([]);

const plyrShowControls = ref('flex');
const bodyShowScrollbar = ref('none');

addEventListener('keypress', event => {
	if (event.key !== 'k') return;

	hideControls.value = !hideControls.value;

	plyrShowControls.value = hideControls.value ? 'none' : 'flex';
	bodyShowScrollbar.value = hideControls.value ? 'none' : 'auto';

	emitter.$emit('navbar_update', hideControls.value);

	localStorage.setItem('navbar_hidden', hideControls.value);
});

addEventListener('keypress', event => {
	if (event.key !== 'c') return;

	plyrShowControls.value = plyrShowControls.value === 'flex' ? 'none' : 'flex';
});

onMounted(() => {
	// --- Load localStorage value for controls
	hideControls.value = localStorage.navbar_hidden && JSON.parse(localStorage.navbar_hidden);

	emitter.$emit('navbar_update', hideControls.value);

	plyrShowControls.value = hideControls.value ? 'none' : 'flex';
	bodyShowScrollbar.value = hideControls.value ? 'none' : 'auto';

	fetchVideo();
});

onUnmounted(() => {
	if (plyrPlayer.value) plyrPlayer.value?.destroy();
	if (dashjsPlayer.value) dashjsPlayer.value?.reset();
});

const avdata = ref({});

const fetchVideo = async (nextVideo = false) => {
	try {
		const response = await queue(
			nextVideo ? 'next' : 'current',
			{
				method: nextVideo ? 'POST' : 'GET',
			},
		);

		if (response.status !== 200) {
			console.error(response.message);
			setTimeout(() => fetchVideo(), 1000 * 5);
			return;
		}

		avdata.value = await response.json();

		playVideo();
	}
	catch (error) {
		const message = await error.response.text();
		
		console.error('Error fetching video:', message);
	}
};

socket.on('set_video_time', value => {
	plyrPlayer.value.currentTime = value;
});

socket.on('skip_video', () => {
	fetchVideo(true);
});

socket.on('update_playing_state', isPlaying => {
	if (isPlaying) {
		plyrPlayer.value.play();
	}
	else {
		plyrPlayer.value.pause();
	}
});

socket.on('refresh_video', () => {
	fetchVideo();
});

const createDashPlayer = () => {
	const videoPlayer = document.getElementById('videoPlayer');

	dashjsPlayer.value = MediaPlayer().create();

	dashjsPlayer.value.on(MediaPlayer.events['PLAYBACK_ENDED'], () => {
		fetchVideo(true);
	});

	dashjsPlayer.value.on(MediaPlayer.events['PLAYBACK_TIME_UPDATED'], (e) => {
		socket.emit('time_update', { timeToEnd: e.timeToEnd, time: e.time });
	});

	dashjsPlayer.value.on(MediaPlayer.events['PLAYBACK_PLAYING'], () => {
		socket.emit('update_playing_state', true);
	});

	dashjsPlayer.value.on(MediaPlayer.events['PLAYBACK_PAUSED'], () => {
		socket.emit('update_playing_state', false);
	});

	dashjsPlayer.value.on('streamInitialized', () => {
		videoBitrates.value = [];
		const bitrateInfo = dashjsPlayer.value.getBitrateInfoListFor('video');

		for (const info of bitrateInfo) {
			if (info.height > 1440) continue;

			videoBitrates.value.push(info.height);
		}

		const defaultOptions = {
			controls: [
				'play',
				'progress',
				'current-time',
				'mute',
				'volume',
				'fullscreen',
			],
			keyboard: {
				focused: false,
				global: false,
			},
		};

		if (!plyrPlayer.value) {
			plyrPlayer.value = new Plyr(videoPlayer, defaultOptions);
		}
	});
};

const playVideo = async () => {
	try {
		const player = document.getElementById('videoPlayer');

		if (dashjsPlayer.value) {
			dashjsPlayer.value.destroy();
			dashjsPlayer.value = false;
		}
		createDashPlayer();
		dashjsPlayer.value.initialize(player, getMPDForVideo(avdata.value.id), true);

		// TODO: Still allow combined video formats?
		if (avdata.value.combined) {
			// document.getElementById('videoPlayer').src = avdata.value.combined.url;
		}
	} catch (error) {
		const message = await error.response.text();

		console.error('Error trying to play video:', message);
	}
};
</script>

<style>
@import 'https://cdn.plyr.io/3.7.8/plyr.css';

.plyr__controls {
	display: v-bind(plyrShowControls);
}

html, body {
	overflow-y: v-bind(bodyShowScrollbar);
}
</style>

<style scoped>
#videoPlayer {
    width: 100vw;
    height: 100vh;
	object-fit: contain;
}
</style>
