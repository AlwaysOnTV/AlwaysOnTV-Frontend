<template>
	<v-app-bar
		prominent
		fixed
		:height="isHidden"
	>
		<v-app-bar-nav-icon
			variant="text"
			@click.stop="drawer = !drawer"
		/>
		<v-toolbar-title>{{ route.meta.title }}</v-toolbar-title>
	</v-app-bar>

	<v-navigation-drawer
		v-model="drawer"
		location="left"
	>
		<v-list>
			<v-list-item
				v-for="item in navItems"
				:key="item.title"
				:to="{ name: item.name }"
				color="primary"
			>
				<template #prepend>
					<v-icon :icon="item.icon" />
				</template>

				{{ item.title }}
			</v-list-item>
		</v-list>
	</v-navigation-drawer>
</template>

<script setup>
import emitter from '@/event-bus';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const hideNavbar = ref(false);
const isHidden = computed(() => {
	return hideNavbar.value ? '0' : '60';
});

emitter.$on('navbar_update', isHidden => {
	hideNavbar.value = isHidden;
});

// TODO: Dividers

const drawer = ref(false);
const navItems = [
	{
		title: 'Dashboard',
		name: 'dashboard',
		icon: 'mdi-home',
	},
	{
		title: 'Video Player',
		name: 'video-player',
		icon: 'mdi-television',
	},
	{
		title: 'Playlists',
		name: 'playlists',
		icon: 'mdi-playlist-edit',
	},
	{
		title: 'Videos',
		name: 'videos',
		icon: 'mdi-video',
	},
	{
		title: 'Games',
		name: 'games',
		icon: 'mdi-controller',
	},
	{
		title: 'Settings',
		name: 'settings',
		icon: 'mdi-cog',
	},
];

const route = useRoute();
</script>
