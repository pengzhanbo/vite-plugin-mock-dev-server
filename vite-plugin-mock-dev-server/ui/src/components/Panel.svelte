<script lang='ts'>
  import { store } from '../lib/store.svelte'
  import PanelItem from './PanelItem.svelte'

  const current = $derived(store.mockList.find(([url]) => url === store.active))
</script>

{#if current}
  <div class='mx-auto w-full max-w-264 p-4'>
    <h3 class='text-gray-500 flex items-center gap-2 text-[20px]'>
      <span class='inline-block w-1 h-6 bg-primary translate-y-px'></span>
      <span>{current[0]}</span>
      {#if current[1].length > 1}
        <span class='text-sm text-white w-5 h-5 leading-5 text-center rounded-full bg-primary'>{current[1].length}</span>
      {/if}
    </h3>
    <div class='flex flex-col gap-8 my-8'>
      {#each current[1] as item}
        <PanelItem config={item} />
      {/each}
    </div>
  </div>
{/if}
