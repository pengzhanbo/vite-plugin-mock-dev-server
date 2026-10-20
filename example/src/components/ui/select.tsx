import type { ComponentProps } from 'react'
import { Select as SelectPrimitive } from '@base-ui/react/select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils.js'

/**
 * shadcn-style Select root (Base UI primitive)
 *
 * shadcn 风格 Select 根组件（基于 Base UI）
 *
 * @param props - Select root props / Select 根组件属性
 * @returns Select root / Select 根组件
 */
const Select = SelectPrimitive.Root

/**
 * Button that toggles the select popup
 *
 * 触发下拉弹层的按钮
 *
 * @param props - Trigger props / 触发器属性
 * @returns Trigger button / 触发按钮
 */
function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props): React.JSX.Element {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        'flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm whitespace-nowrap shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[popup-open]:border-ring [&_svg]:shrink-0 [&_svg]:opacity-60',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="size-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

/**
 * Text of the selected item, or the placeholder when nothing is selected
 *
 * 展示选中项文本，未选中时展示占位文本
 *
 * @param props - Value props / 值属性
 * @returns Value element / 值元素
 */
function SelectValue({ className, ...props }: SelectPrimitive.Value.Props): React.JSX.Element {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn(
        'line-clamp-1 flex items-center gap-2 text-left data-[placeholder]:text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Popup containing the select options
 *
 * 包含选项的下拉弹层
 *
 * @param props - Content props / 内容属性
 * @returns Select popup / 下拉弹层
 */
function SelectContent({
  className,
  children,
  side = 'bottom',
  sideOffset = 6,
  align = 'start',
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset' | 'alignItemWithTrigger'
  >): React.JSX.Element {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50 outline-none"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            'relative z-50 max-h-[var(--available-height)] min-w-[var(--anchor-width)] overflow-x-hidden overflow-y-auto rounded-md border border-border/70 bg-popover p-1 text-popover-foreground shadow-lg transition-opacity duration-150 outline-none data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
            className,
          )}
          {...props}
        >
          <SelectScrollUpArrow />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownArrow />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

/**
 * Option of the select
 *
 * 下拉选项
 *
 * @param props - Item props / 选项属性
 * @returns Select item / 选项元素
 */
function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props): React.JSX.Element {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
        <Check className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

/**
 * Group of related options
 *
 * 相关选项分组
 *
 * @param props - Group props / 分组属性
 * @returns Group element / 分组元素
 */
function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props): React.JSX.Element {
  return (
    <SelectPrimitive.Group data-slot="select-group" className={cn('p-1', className)} {...props} />
  )
}

/**
 * Label of an option group
 *
 * 选项分组的标题
 *
 * @param props - Label props / 标题属性
 * @returns Group label / 分组标题
 */
function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props): React.JSX.Element {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn('px-2 py-1.5 text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

/**
 * Divider between option groups
 *
 * 选项分组之间的分隔线
 *
 * @param props - Separator props / 分隔线属性
 * @returns Separator element / 分隔线元素
 */
function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props): React.JSX.Element {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  )
}

/**
 * Arrow shown when the list can scroll up
 *
 * 列表可向上滚动时的箭头
 *
 * @param props - Arrow props / 箭头属性
 * @returns Scroll up arrow / 向上滚动箭头
 */
function SelectScrollUpArrow({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollUpArrow>): React.JSX.Element {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-arrow"
      className={cn(
        'flex w-full items-center justify-center bg-popover py-1 text-muted-foreground',
        className,
      )}
      {...props}
    >
      <ChevronUp className="size-4" />
    </SelectPrimitive.ScrollUpArrow>
  )
}

/**
 * Arrow shown when the list can scroll down
 *
 * 列表可向下滚动时的箭头
 *
 * @param props - Arrow props / 箭头属性
 * @returns Scroll down arrow / 向下滚动箭头
 */
function SelectScrollDownArrow({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollDownArrow>): React.JSX.Element {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-arrow"
      className={cn(
        'flex w-full items-center justify-center bg-popover py-1 text-muted-foreground',
        className,
      )}
      {...props}
    >
      <ChevronDown className="size-4" />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownArrow,
  SelectScrollUpArrow,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
