import { Loader2Icon } from 'lucide-react'
import { cn } from '@/lib/utils.js'

function Spinner({ className, ...props }: React.ComponentProps<'svg'>): React.JSX.Element {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }
