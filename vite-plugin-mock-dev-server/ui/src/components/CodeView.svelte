<script lang='ts'>
  import type { ClassValue } from 'clsx'
  import { clsx as cn } from 'clsx'

  const props: { code: any, class?: ClassValue } = $props()
</script>

<div class={cn('bg-code rounded-md mt-4', props.class)}>
  <pre class='text-sm text-gray-500 dark:text-gray-400 p-2 overflow-auto w-full max-h-100'><code>{JSON.stringify(props.code, null, 2)}</code></pre>
</div>
