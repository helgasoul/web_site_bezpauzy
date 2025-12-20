'use client'

import { FC } from 'react'
import { motion } from 'framer-motion'
import { XCircle, AlertTriangle } from 'lucide-react'

interface ContraindicationCardProps {
  title: string
  items: Array<{
    label: string
    description?: string
  }>
  why?: string
  isAbsolute?: boolean
}

export const ContraindicationCard: FC<ContraindicationCardProps> = ({
  title,
  items,
  why,
  isAbsolute = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`${
        isAbsolute
          ? 'bg-red-50 border-red-200'
          : 'bg-yellow-50 border-yellow-200'
      } border-2 rounded-2xl p-6 md:p-8 my-6 shadow-md`}
    >
      <div className="flex items-start gap-3 mb-4">
        {isAbsolute ? (
          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
        )}
        <div>
          <h4
            className={`${
              isAbsolute ? 'text-red-900' : 'text-yellow-900'
            } font-bold text-xl mb-1`}
          >
            {title}
          </h4>
          {isAbsolute && (
            <p className="text-sm text-red-700 font-medium">
              ЗГТ нельзя применять
            </p>
          )}
        </div>
      </div>

      <ul className="space-y-4 mb-4">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <span
              className={`${
                isAbsolute ? 'text-red-600' : 'text-yellow-600'
              } font-bold text-xl mt-0.5 flex-shrink-0`}
            >
              •
            </span>
            <div className="flex-1 min-w-0">
              <p
                className={`${
                  isAbsolute ? 'text-red-900' : 'text-yellow-900'
                } font-semibold mb-1 text-base md:text-lg leading-tight`}
              >
                {item.label}
              </p>
              {item.description && (
                <p
                  className={`${
                    isAbsolute ? 'text-red-800' : 'text-yellow-800'
                  } text-sm md:text-base leading-relaxed mt-2 font-normal`}
                >
                  {item.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {why && (
        <div
          className={`${
            isAbsolute ? 'bg-red-100' : 'bg-yellow-100'
          } rounded-lg p-4 mt-4`}
        >
          <p
            className={`${
              isAbsolute ? 'text-red-900' : 'text-yellow-900'
            } text-sm font-medium`}
          >
            <span className="font-bold">Почему:</span> {why}
          </p>
        </div>
      )}
    </motion.div>
  )
}

