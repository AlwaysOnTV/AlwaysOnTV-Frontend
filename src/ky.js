import { useCookies } from 'vue3-cookies';
import { ref } from 'vue';

import ky from 'ky';

export let isLoading = ref(false);

export const API_URL = import.meta.env.VITE_API_URL || '/';

function addAuthorization (options) {
	const { cookies } = useCookies();

	if (!cookies.isKey('password')) return;

	options.headers.set('Authorization', cookies.get('password'));
}

const api = ky.create({
	prefixUrl: `${API_URL}api`,
	hooks: {
		beforeRequest: [
			() => isLoading.value = true,
			addAuthorization,
		],
		afterResponse: [
			() => isLoading.value = false,
		],
	},
});

export const auth = ky.create({
	prefixUrl: `${API_URL}auth`,
	hooks: {
		beforeRequest: [
			addAuthorization,
		],
	},
});

export const queue = ky.create({
	prefixUrl: `${API_URL}api/queue`,
	hooks: {
		beforeRequest: [
			addAuthorization,
		],
	},
});

export default api;