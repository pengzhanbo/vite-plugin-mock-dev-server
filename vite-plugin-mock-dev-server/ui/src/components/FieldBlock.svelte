<script lang='ts' generics="T">
  import type { Snippet } from 'svelte'
  import { clsx as cn } from 'clsx'

  const {
    field,
    label,
    children,
  }: {
    field: T | undefined
    label: string
    children?: Snippet<[Exclude<T, '<function>' | '<buffer>' | '<stream>'>]>
  } = $props()

  const notObject = $derived(['<function>', '<buffer>', '<stream>'].includes(field as string))
</script>

{#if field}
  <div class={cn('mb-2', notObject ? 'flex items-center gap-2' : '')}>
    <span class='font-bold'>{label}:</span>
    {#if notObject}
      <code class='text-gray-500 dark:text-gray-400'>{field}</code>
    {:else}
      {@render children?.(field as Exclude<T, '<function>' | '<buffer>' | '<stream>'>)}
    {/if}
  </div>
{/if}
