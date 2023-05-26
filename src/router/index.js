// Composables
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
	{
		path: '/',
		name: 'home',
		meta: {
			title: 'Home',
		},
		// route level code-splitting
		// this generates a separate chunk (about.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
	},
	{
		path: '/dashboard',
		name: 'dashboard',
		meta: {
			title: 'Dashboard',
		},
		component: () =>
			import(/* webpackChunkName: "home" */ '@/views/Dashboard.vue'),
	},
	{
		path: '/settings',
		name: 'settings',
		meta: {
			title: 'Settings',
		},
		component: () =>
			import(/* webpackChunkName: "home" */ '@/views/Settings.vue'),
	},
	{
		path: '/games',
		name: 'games',
		meta: {
			title: 'Games',
		},
		component: () =>
			import(/* webpackChunkName: "home" */ '@/views/games/Games.vue'),
	},
	{
		path: '/videos',
		name: 'videos',
		meta: {
			title: 'Videos',
		},
		component: () =>
			import(/* webpackChunkName: "home" */ '@/views/videos/Videos.vue'),
	},
	{
		path: '/playlists',
		name: 'playlists',
		meta: {
			title: 'Playlists',
		},
		component: () =>
			import(/* webpackChunkName: "home" */ '@/views/playlists/Playlists.vue'),
	},
	{
		path: '/playlists/:id',
		name: 'playlist-view',
		meta: {
			title: 'Playlists',
		},
		component: () =>
			import(/* webpackChunkName: "home" */ '@/views/playlists/PlaylistView.vue'),
	},
	{
		path: '/playlists/random',
		name: 'random-playlist-view',
		meta: {
			title: 'Random Playlist',
		},
		component: () =>
			import(/* webpackChunkName: "home" */ '@/views/playlists/RandomPlaylistView.vue'),
	},
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
});

export default router;
