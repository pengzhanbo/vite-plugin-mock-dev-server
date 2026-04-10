<script lang='ts'>
  import logo from '../assets/logo.png'
  import { toggleAppearance } from '../lib/appearance.svelte'
  import { store } from '../lib/store.svelte'
  import { cn } from '../utils/cn'

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
    <a href='https://vite-plugin-mock-dev-server.netlify.app/' target='_blank' rel='noopener noreferrer' class='text-sm font-medium text-black hover:text-primary transition-colors dark:text-gray-300 dark:hover:text-white'>Documentation</a>
    <a href='https://github.com/pengzhanbo/vite-plugin-mock-dev-server' target='_blank' rel='noopener noreferrer' class='text-sm font-medium text-black hover:text-primary transition-colors dark:text-gray-300 dark:hover:text-white'>Github</a>
  </div>

  <div class='w-px h-5 border-r border-divider'></div>

  <div class='flex items-center justify-center gap-4'>
    <select bind:value={store.locale} class='text-black dark:text-gray-300'>
      <option value='zh-CN'>简体中文</option>
      <option value='en-US'>English</option>
    </select>
    <button
      class='appearance border rounded-md border-divider p-1.5 cursor-pointer text-black dark:text-white dark:hover:text-gray-300 transition-colors'
      onclick={toggleAppearance} type='button'
    >
      {#if store.appearance === 'light'}
        <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-sun-icon lucide-sun'>
          <circle cx='12' cy='12' r='4' />
          <path d='M12 2v2' /><path d='M12 20v2' />
          <path d='m4.93 4.93 1.41 1.41' />
          <path d='m17.66 17.66 1.41 1.41' />
          <path d='M2 12h2' />
          <path d='M20 12h2' />
          <path d='m6.34 17.66-1.41 1.41' />
          <path d='m19.07 4.93-1.41 1.41' />
        </svg>
      {:else if store.appearance === 'dark'}
        <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-moon-icon lucide-moon'>
          <path d='M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401' />
        </svg>
      {:else}
        <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-sun-moon-icon lucide-sun-moon'>
          <path d='M12 2v2' />
          <path d='M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715' />
          <path d='M16 12a4 4 0 0 0-4-4' />
          <path d='m19 5-1.256 1.256' />
          <path d='M20 12h2' />
        </svg>
      {/if}
    </button>
  </div>
</nav>
