import { Download, ExternalLink, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button.js'

const LINKS = [
  {
    href: '/api/file-download',
    label: 'Download file (Readable stream)',
    download: 'shared.ts',
    icon: Download,
  },
  {
    href: '/static/hello.txt',
    label: 'Static file (mock static server)',
    icon: FileText,
  },
  {
    href: '/api/response/redirect',
    label: '302 redirect target',
    icon: ExternalLink,
  },
]

/**
 * File download and static file links
 *
 * 文件下载与静态资源链接
 *
 * @returns Download panel content / 下载面板内容
 */
export function DownloadPanel(): React.ReactNode {
  return (
    <div className="flex flex-wrap gap-2">
      {LINKS.map((link) => {
        const Icon = link.icon
        return (
          <Button
            key={link.href}
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<a href={link.href} download={link.download} />}
          >
            <Icon data-icon="inline-start" />
            {link.label}
          </Button>
        )
      })}
    </div>
  )
}
