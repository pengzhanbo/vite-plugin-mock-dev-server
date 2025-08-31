export function doesProxyContextMatchUrl(
  context: string,
  url: string,
): boolean {
  return (
    (context[0] === '^' && new RegExp(context).test(url))
    || url.startsWith(context)
  )
}
