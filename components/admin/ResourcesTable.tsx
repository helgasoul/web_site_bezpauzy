'use client'

import Link from 'next/link'
import { Edit, Trash2, ChevronLeft, ChevronRight, Download, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/admin/formatters'
import { ResourceTypeBadge } from './ResourceTypeBadge'

interface Resource {
  id: string
  resource_type: 'checklist' | 'guide'
  title: string
  slug: string
  description: string
  icon_name: string | null
  cover_image: string | null
  pdf_source: string
  pdf_file_path: string
  pdf_filename: string
  category: string | null
  published: boolean
  coming_soon: boolean
  download_count: number
  view_count: number
  order_index: number
  created_at: string
  updated_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface ResourcesTableProps {
  resources: Resource[]
  pagination: Pagination
  onPageChange: (page: number) => void
  onDelete?: (id: string) => void
  loading: boolean
}

export function ResourcesTable({ resources, pagination, onPageChange, onDelete, loading }: ResourcesTableProps) {
  if (resources.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Ресурсы не найдены</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Тип
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статистика
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Порядок
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {resources.map((resource) => (
              <tr key={resource.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    {resource.cover_image && (
                      <img
                        src={resource.cover_image}
                        alt={resource.title}
                        className="w-12 h-12 rounded object-cover mr-3 flex-shrink-0"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {resource.title}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                        {resource.description}
                      </div>
                      {resource.category && (
                        <div className="text-xs text-gray-400 mt-1">
                          {resource.category}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ResourceTypeBadge type={resource.resource_type} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {resource.published ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Опубликован
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Черновик
                      </span>
                    )}
                    {resource.coming_soon && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Скоро
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{resource.view_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      <span>{resource.download_count}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {resource.order_index}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/resources/${resource.id}`}
                      className="text-purple-600 hover:text-purple-900"
                      title="Редактировать"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    {onDelete && (
                      <button
                        onClick={() => {
                          if (confirm('Вы уверены, что хотите удалить этот ресурс?')) {
                            onDelete(resource.id)
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {pagination.totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Показано {((pagination.page - 1) * pagination.limit) + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={cn(
                'p-2 rounded-md border border-gray-300',
                pagination.page === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-100'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-700">
              Страница {pagination.page} из {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className={cn(
                'p-2 rounded-md border border-gray-300',
                pagination.page >= pagination.totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-100'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
