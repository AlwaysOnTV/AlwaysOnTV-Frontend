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
			>
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

const drawer = ref(false);
const navItems = [
	{
		title: 'Home',
		name: 'home',
	},
	{
		title: 'Dashboard',
		name: 'dashboard',
	},
	{
		title: 'Playlists',
		name: 'playlists',
	},
	{
		title: 'Games',
		name: 'games',
	},
	{
		title: 'Videos',
		name: 'videos',
	},
	{
		title: 'Settings',
		name: 'settings',
	},
];

const route = useRoute();
</script>
