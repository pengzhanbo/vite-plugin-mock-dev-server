<script lang='ts'>
  import type { KeyValue } from '../types'
  import { cn } from '../utils/cn'
  import IconRemove from './IconRemove.svelte'

  const { items = $bindable([]), disableKey = false, valueType = false, immutable = false, class: classValue }: {
    items: KeyValue[]
    // 是否禁用键
    disableKey?: boolean
    // 是否显示输入类型
    valueType?: boolean
    // 是否不可变
    immutable?: boolean

    class?: string
  } = $props()
</script>

<div class={classValue}>
  <table class='mb-4 rounded-md min-w-105'>
    <thead>
      <tr>
        <th>Key</th>
        <th>Value</th>
        {#if items.length && !immutable}
          <th></th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each items as item, index}
        <tr class='border border-divider transition-colors'>
          <td>
            <input
              type='text'
              class={cn('px-2 py-1 focus:outline-none m-0 border border-transparent transition-colors focus:border-primary', !valueType && 'w-full')}
              placeholder='Key'
              bind:value={item.key}
              disabled={disableKey}
            />
            {#if valueType}
              <select
                class='px-2 py-1 focus:outline-none m-0 border-l border-divider'
                bind:value={item.type}
              >
                <option value='text'>Text</option>
                <option value='file'>File</option>
              </select>
            {/if}
          </td>
          <td>
            <input
              type={item.type}
              class='w-full px-2 py-1 focus:outline-none m-0 border border-transparent transition-colors focus:border-primary'
              placeholder='Value'
              bind:value={item.value}
            />
          </td>
          {#if !immutable}
            <td class='px-2'>
              <button
                class='text-gray-500 dark:text-gray-400 cursor-pointer'
                onclick={() => items.splice(index, 1)}
              ><IconRemove /></button>
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>

  {#if !immutable}
    <button
      class='text-gray-500 dark:text-gray-400 border border-divider cursor-pointer px-4 py-1 rounded-md'
      onclick={() => items.push({ key: '', value: '', type: 'text' })}
    >+</button>
  {/if}
</div>
