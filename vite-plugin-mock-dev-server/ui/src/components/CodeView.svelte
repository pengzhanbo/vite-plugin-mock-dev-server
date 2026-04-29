<script lang='ts'>
  import type { ClassValue } from 'clsx'
  import { clsx as cn } from 'clsx'

  const props: { code: any, class?: ClassValue } = $props()
</script>

<div class={cn('code-view bg-code rounded-md mt-4', props.class)}>
  <pre class='text-sm text-gray-500 dark:text-gray-400 px-3 py-4 overflow-auto w-full max-h-100 '><code class='font-mono'>{JSON.stringify(props.code, null, 2)}</code></pre>
</div>

<style>
.code-view pre,
.code-view code {
  -webkit-hyphens: none;
  hyphens: none;
  text-align: left;
  word-break: normal;
  overflow-wrap: normal;
  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;
  white-space: pre;
  word-spacing: normal;

  direction: ltr;
  -webkit-font-smoothing: auto;
  -moz-osx-font-smoothing: auto;
}
</style>
