<script lang='ts'>
  import { t } from '../lib/i18n.svelte'
  import { store } from '../lib/store.svelte'
  import { cn } from '../utils/cn'

  const RE_DYNAMIC = /[*:{}]/
  const dynamicList = $derived(store.mockList.filter(([url]) => RE_DYNAMIC.test(url)).sort((a, b) => sort(a[0], b[0])))
  const staticList = $derived(store.mockList.filter(([url]) => !RE_DYNAMIC.test(url)).sort((a, b) => sort(a[0], b[0])))

  function sort(a: string, b: string) {
    const depthA = a.split('/').length
    const depthB = b.split('/').length
    if (depthB !== depthA)
      return depthB - depthA // 深度降序
    return a.localeCompare(b) // 字母升序
  }

  function handleClick(url: string) {
    store.active = url
  }
</script>

{#snippet item(url: string, length: number)}
  <button class={cn(
    'text-gray-600 hover:text-primary leading-7 transition-colors mb-2 last:mb-0 dark:text-gray-300 cursor-pointer flex items-baseline',
    { 'text-primary': url === store.active },
  )} onclick={() => handleClick(url)}>
    <span>{url}</span>
    {#if length > 1}
      <span class='inline-block w-5 h-5 ml-2 rounded-full text-center leading-5 text-white bg-primary text-xs'>{length}</span>
    {/if}
  </button>
{/snippet}

<aside class={cn(
  'sidebar',
  'fixed top-14 left-0 z-10 w-(--sidebar-width) h-[calc(100vh-56px)] p-4 overflow-y-auto border-r border-divider transition-colors',
)}>
  {#if dynamicList.length}
    <p class='font-medium text-gray-600 dark:text-gray-400 mb-2'>{t('dynamicPattern')}</p>
    {#each dynamicList as [url, items]}
      {@render item(url, items.length)}
    {/each}
  {/if}
  {#if dynamicList.length || staticList.length}
    <hr class='border-divider my-4 transition-colors' />
  {/if}
  {#if staticList.length}
    <p class='font-medium text-gray-600 dark:text-gray-400 mb-2'>{t('staticPattern')}</p>
    {#each staticList as [url, items]}
      {@render item(url, items.length)}
    {/each}
  {/if}
</aside>
