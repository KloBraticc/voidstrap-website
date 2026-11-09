// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://wiki.voidstrapp.pages.dev',
	integrations: [
		starlight({
			title: 'Voidstrap Wiki',
			editLink: { baseUrl: 'https://github.com/KloBraticc/voidstrap-website/edit/main/wiki/' },
			head: [
				{ tag: 'meta', attrs: { property: 'og:image', content: 'https://wiki.voidstrapp.pages.dev/hero.webp' } },
				{ tag: 'meta', attrs: { property: 'og:image:alt', content: 'The Voidstrap app' } },
				{ tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
				{ tag: 'meta', attrs: { name: 'theme-color', content: '#111113' } },
			],
			titleDelimiter: '·',
			logo: { src: './src/assets/logo.png', alt: 'Voidstrap' },
			favicon: '/favicon.png',
			customCss: ['./src/styles/theme.css'],
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/KloBraticc/Voidstrap' },
				{ icon: 'discord', label: 'Discord', href: 'https://discord.gg/5tJBqBH8ck' },
			],
			sidebar: [
				{
					label: 'Get started',
					items: [
						{ label: 'Install', slug: 'start/install' },
						{ label: 'Android setup', slug: 'start/android' },
						{ label: 'Gentoo and NixOS', slug: 'start/linux-distros' },
					],
				},
				{
					label: 'Features',
					items: [
						{ label: 'Feature tour', slug: 'features/overview' },
						{ label: 'Launching and updates', slug: 'features/launching' },
						{ label: 'Server Matchmaker', slug: 'features/matchmaker' },
						{ label: 'FastFlags', slug: 'features/fastflags' },
						{ label: 'Mods', slug: 'features/mods' },
						{ label: 'Overlays and filters', slug: 'features/overlays' },
						{ label: 'RiShade, Clipper and Void Edit', slug: 'features/rishade' },
						{ label: 'Integrations', slug: 'features/integrations' },
						{ label: 'Appearance', slug: 'features/appearance' },
						{ label: 'Library and accounts', slug: 'features/library' },
						{ label: 'Voidstrap mods', slug: 'features/voidstrap-mods' },
					],
				},
				{
					label: 'Platforms',
					items: [
						{ label: 'Linux', slug: 'platforms/linux' },
						{ label: 'macOS', slug: 'platforms/macos' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Connect an AI client', slug: 'guides/mcp' },
						{ label: 'Window control for developers', slug: 'guides/window-control' },
					],
				},
				{
					label: 'Help',
					items: [
						{ label: 'FAQ', slug: 'help/faq' },
						{ label: 'Troubleshooting', slug: 'features/troubleshooting' },
						{ label: 'Report a bug or idea', slug: 'help/report-bug' },
					],
				},
				{
					label: 'Building',
					items: [
						{ label: 'Get the source', slug: 'build/setup' },
						{ label: 'Windows', slug: 'build/windows' },
						{ label: 'Linux', slug: 'build/linux' },
						{ label: 'macOS', slug: 'build/macos' },
						{ label: 'Android', slug: 'build/android' },
						{ label: 'Release script', slug: 'build/publish-script' },
					],
				},
				{
					label: 'Contributing',
					items: [
						{ label: 'Project layout', slug: 'contributing/layout' },
						{ label: 'Checks and code style', slug: 'contributing/checks' },
						{ label: 'Translations', slug: 'contributing/translations' },
						{ label: 'Using AI tools', slug: 'contributing/ai' },
					],
				},
				{
					label: 'About',
					items: [{ label: 'Credits and licenses', slug: 'about/credits' }],
				},
			],
		}),
	],
});
