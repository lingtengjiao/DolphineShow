import { FiInbox } from 'react-icons/fi'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title?: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({
  icon,
  title = '暂无数据',
  description = '当前没有可显示的内容',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 mb-5">
        {icon || <FiInbox size={28} />}
      </div>
      <h3 className="text-[15px] font-semibold text-gray-500 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 mb-6 text-center max-w-xs">{description}</p>
      {action}
    </div>
  )
}
