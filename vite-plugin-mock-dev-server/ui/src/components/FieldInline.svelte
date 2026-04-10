<script lang='ts' generics="T">
  import type { Snippet } from 'svelte'

  const { field, label, children }: { field: T, label: string, children?: Snippet<[T]> } = $props()
</script>

<div class='flex items-center gap-2 mb-2'>
  <span class='font-bold'>{label}:</span>
  {@render children?.(field)}
</div>
