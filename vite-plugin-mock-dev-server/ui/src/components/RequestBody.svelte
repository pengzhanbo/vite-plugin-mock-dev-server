<script lang='ts'>
  import type { TestRequest } from '../types'
  import { clsx as cn } from 'clsx'
  import KeyValueEditor from './KeyValueEditor.svelte'

  let {
    bodyType = $bindable(),
    body = $bindable(),
    class: classValue,
  }: Pick<TestRequest, 'bodyType' | 'body'> & { class?: string } = $props()

  const bodyTypes = ['raw', 'form-data', 'x-www-form-urlencoded', 'binary'] as const
</script>

<div class={classValue}>
  <div class='flex items-center gap-4 mb-4'>
    {#each bodyTypes as type}
      <button
        class={cn(
          'text-gray-500 dark:text-gray-400 border border-divider cursor-pointer px-4 py-1 rounded-md',
          { 'text-primary border-primary': type === bodyType },
        )}
        onclick={() => bodyType = type}
      >{type}</button>
    {/each}
  </div>
  <textarea
    class={cn(
      'w-full min-h-50 border border-divider rounded-md py-2 px-3 text-sm leading-5 focus:outline-none focus:border-primary',
      bodyType === 'raw' ? 'block' : 'hidden',
    )}
    bind:value={body.raw}
  ></textarea>
  <KeyValueEditor
    class={cn('w-full min-h-25', bodyType === 'form-data' ? 'block' : 'hidden')}
    valueType
    bind:items={body['form-data']}
  />
  <KeyValueEditor
    class={cn('w-full min-h-25', bodyType === 'x-www-form-urlencoded' ? 'block' : 'hidden')}
    bind:items={body['x-www-form-urlencoded']}
  />
  <input class={cn('border border-divider', bodyType === 'binary' ? 'block' : 'hidden')} type='file' bind:value={body.binary} />
</div>
