<template>
	<div>
		<video
			id="videoPlayer"
			playsinline
			:controls="!hideControls"
			autoplay
		/>
	</div>
</template>

<script setup>
import { queue } from '@/ky';
import emitter from '@/event-bus';
import { onMounted, ref } from 'vue';
import { AVMerge } from '../assets/avmerge.js';

const hideControls = ref(false);

addEventListener('keypress', event => {
	if (event.key !== 'k') return;

	hideControls.value = !hideControls.value;

	emitter.$emit('navbar_update', hideControls.value);

	localStorage.setItem('navbar_hidden', hideControls.value);
});

onMounted(() => {
	// --- Load localStorage value for controls
	hideControls.value = localStorage.navbar_hidden && JSON.parse(localStorage.navbar_hidden);

	emitter.$emit('navbar_update', hideControls.value);

	const videoElement = document.getElementById('videoPlayer');

	videoElement.addEventListener('ended', () => {
		fetchVideo(true);
	});

	fetchVideo();
});

const avdata = ref({});
const avmerge = ref(false);

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
	} catch (error) {
		console.error('Error fetching video:', error);
	}
};

const playVideo = () => {
	try {
		if (avmerge.value) avmerge.value?.close();
		avmerge.value = false;

		if (avdata.value.combined) {
			document.getElementById('videoPlayer').src = avdata.value.combined.url;
		}
		else {
			avmerge.value = new AVMerge(
				document.getElementById('videoPlayer'),
				avdata.value,
				0,
			);
		}
	} catch (error) {
		console.error('Error trying to play video:', error);
	}
};
</script>

<style scoped>
body {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
}

#videoPlayer {
    width: 100vw;
    height: 100vh;
	object-fit: contain;
}
</style>
