<script lang='ts'>
  import { clsx as cn } from 'clsx'
  import logo from '../assets/logo.png'
  import { toggleAppearance } from '../lib/appearance.svelte'
  import { store } from '../lib/store.svelte'
  import IconMoon from './IconMoon.svelte'
  import IconSun from './IconSun.svelte'
  import IconSunMoon from './IconSunMoon.svelte'

  const navList: { link: string, text: string }[] = [
    { link: 'https://vite-plugin-mock-dev-server.netlify.app/', text: 'Documentation' },
    { link: 'https://github.com/pengzhanbo/vite-plugin-mock-dev-server', text: 'Github' },
  ]

</script>

<nav class={cn(
  'navbar',
  'fixed top-0 z-20 w-full h-14 mx-auto border-b border-divider',
  'flex items-center justify-between px-5 gap-5 bg-background transition-colors',
)}
>
  <div class='flex items-center justify-center gap-2'>
    <img src={logo} alt='Vite Mock Logo' class='h-8' />
    <h1 class='text-xl font-bold text-gray-600 hover:text-gray-800 transition-colors dark:text-gray-300 dark:hover:text-white'>Vite Mock</h1>
  </div>

  <div class='flex-1 flex items-center justify-end gap-4'>
    {#each navList as { link, text }}
      <a href={link} target='_blank' rel='noopener noreferrer' class='text-sm font-medium text-black hover:text-primary transition-colors dark:text-gray-300 dark:hover:text-white'>{text}</a>
    {/each}
  </div>

  <div class='w-px h-5 border-r border-divider'></div>

  <div class='flex items-center justify-center gap-4'>
    <select bind:value={store.locale} class='text-black dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-divider rounded-md px-2 py-1 cursor-pointer focus:outline-none transition-colors'>
      <option value='zh-CN'>简体中文</option>
      <option value='en-US'>English</option>
    </select>
    <button
      class='appearance border rounded-md border-divider p-1.5 cursor-pointer text-black dark:text-white dark:hover:text-gray-300 transition-colors'
      onclick={toggleAppearance} type='button'
    >
      {#if store.appearance === 'light'}
        <IconSun />
      {:else if store.appearance === 'dark'}
        <IconMoon />
      {:else}
        <IconSunMoon />
      {/if}
    </button>
  </div>
</nav>
