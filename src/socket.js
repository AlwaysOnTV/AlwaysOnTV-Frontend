import { reactive } from 'vue';
import { io } from 'socket.io-client';

export const state = reactive({
	connected: false,
	currentTime: 0,
	videoLength: 0,
});

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : import.meta.env.VITE_API_URL;

export const socket = io(URL);

socket.on('connect', () => {
	state.connected = true;
});

socket.on('disconnect', () => {
	state.connected = false;
});

socket.on('time_update', (newTime, videoLength) => {
	state.currentTime = newTime;
	state.videoLength = videoLength;
});