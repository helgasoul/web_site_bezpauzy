'use client'

import Link from 'next/link'
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/admin/formatters'
import { BlogStatusBadge } from './BlogStatusBadge'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  category_name: string
  author_name: string
  author_role: string
  image: string
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  read_time: number | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface BlogPostsTableProps {
  posts: BlogPost[]
  pagination: Pagination
  onPageChange: (page: number) => void
  onDelete?: (id: string) => void
  loading: boolean
}

const categoryLabels: Record<string, string> = {
  gynecologist: 'Гинеколог',
  mammologist: 'Маммолог',
  nutritionist: 'Нутрициолог',
}

export function BlogPostsTable({ posts, pagination, onPageChange, onDelete, loading }: BlogPostsTableProps) {
  if (posts.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Статьи не найдены</p>
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
                Категория
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Автор
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата создания
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-16 h-16 rounded object-cover mr-3 flex-shrink-0"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {post.title}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-1 mt-1">
                        {post.excerpt}
                      </div>
                      {post.read_time && (
                        <div className="text-xs text-gray-400 mt-1">
                          {post.read_time} мин чтения
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {categoryLabels[post.category] || post.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{post.author_name}</div>
                  <div className="text-xs text-gray-500">{post.author_role}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <BlogStatusBadge published={post.published} publishedAt={post.published_at} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(post.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {post.published && (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900"
                        title="Просмотр на сайте"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    )}
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="text-purple-600 hover:text-purple-900"
                      title="Редактировать"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    {onDelete && (
                      <button
                        onClick={() => {
                          if (confirm('Вы уверены, что хотите удалить эту статью?')) {
                            onDelete(post.id)
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
