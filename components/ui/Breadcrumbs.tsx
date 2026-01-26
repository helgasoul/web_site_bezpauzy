import { FC } from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export const Breadcrumbs: FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav className={`mb-6 ${className}`} aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-body-small text-deep-navy/70">
        {items.map((crumb, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4" />}
            {index === 0 && (
              <Link
                href={crumb.href}
                className="hover:text-primary-purple transition-colors flex items-center gap-1"
                aria-label="Главная"
              >
                <Home className="w-4 h-4" />
              </Link>
            )}
            {index > 0 && index === items.length - 1 ? (
              <span className="text-deep-navy font-medium">{crumb.label}</span>
            ) : index > 0 ? (
              <Link
                href={crumb.href}
                className="hover:text-primary-purple transition-colors"
              >
                {crumb.label}
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}

