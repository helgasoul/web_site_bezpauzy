'use client'

import { FC } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, Brain, Droplet, Bone, Activity, 
  AlertCircle, CheckCircle2, XCircle, Info,
  Pill, Shield, Clock, Users
} from 'lucide-react'
import { InfoBox } from './InfoBox'
import { MetaphorBox } from './MetaphorBox'
import { ContraindicationCard } from './ContraindicationCard'
import { StepCard } from './StepCard'
import { StatHighlight } from './StatHighlight'
import { TipsBox } from './TipsBox'
import { AskEvaButton } from './AskEvaButton'
import { InflammationQuizButton } from './InflammationQuizButton'
import { MRSQuizButton } from '@/components/quiz/MRSQuizButton'

interface ParseResult {
  elements: JSX.Element[]
}

interface ParseOptions {
  articleTitle?: string
  articleSlug?: string
}

export const parseArticleContent = (content: string, options?: ParseOptions): JSX.Element[] => {
  const lines = content.trim().split('\n')
  const elements: JSX.Element[] = []
  let currentParagraph: string[] = []
  let key = 0
  let i = 0

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim()
      if (text) {
        // Check for button markers first - they should be on separate lines
        if (text.includes('[ASK_EVA_BUTTON]') || text.includes('[INFLAMMATION_QUIZ_BUTTON]')) {
          // Split text by markers and process separately
          const parts = text.split(/(\[ASK_EVA_BUTTON\]|\[INFLAMMATION_QUIZ_BUTTON\])/g)
          
          parts.forEach((part) => {
            if (part === '[ASK_EVA_BUTTON]') {
              elements.push(
                <AskEvaButton 
                  key={key++} 
                  articleTitle={options?.articleTitle}
                  articleSlug={options?.articleSlug}
                />
              )
            } else if (part === '[INFLAMMATION_QUIZ_BUTTON]') {
              elements.push(
                <InflammationQuizButton 
                  key={key++} 
                  articleTitle={options?.articleTitle}
                />
              )
            } else if (part === '[MRS_QUIZ_BUTTON]') {
              elements.push(
                <MRSQuizButton 
                  key={key++} 
                  articleTitle={options?.articleTitle}
                />
              )
            } else if (part.trim()) {
              // Process remaining text as regular paragraph
              const textParts = part.split(/(\*\*[^*]+\*\*)/g)
              elements.push(
                <p key={key++} className="text-body text-deep-navy/85 mb-6 leading-relaxed">
                  {textParts.map((textPart, idx) => {
                    if (textPart.startsWith('**') && textPart.endsWith('**')) {
                      const boldText = textPart.replace(/\*\*/g, '')
                      return (
                        <strong key={idx} className="font-semibold text-deep-navy">
                          {boldText}
                        </strong>
                      )
                    }
                    return <span key={idx}>{textPart}</span>
                  })}
                </p>
              )
            }
          })
        } else if (text.includes('**Короткий ответ**') || text.includes('**Важно:**') || text.includes('**Помните:**')) {
          const parts = text.split(/(\*\*[^*]+\*\*)/g)
          elements.push(
            <motion.div
              key={key++}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-primary-purple/10 to-ocean-wave-start/10 rounded-xl p-5 mb-6 border-l-4 border-primary-purple shadow-sm"
            >
              <p className="text-body text-deep-navy leading-relaxed">
                {parts.map((part, idx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    const boldText = part.replace(/\*\*/g, '')
                    return (
                      <span key={idx} className="font-bold text-primary-purple">
                        {boldText}
                      </span>
                    )
                  }
                  return <span key={idx}>{part}</span>
                })}
              </p>
            </motion.div>
          )
        } else {
          // Regular paragraph with markdown formatting (bold text) - improved regex
          // Handle multiple bold sections in one paragraph
          const parts = text.split(/(\*\*[^*]+\*\*)/g)
          elements.push(
            <p key={key++} className="text-body text-deep-navy/85 mb-6 leading-relaxed">
              {parts.map((part, idx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  const boldText = part.replace(/\*\*/g, '')
                  return (
                    <strong key={idx} className="font-semibold text-deep-navy">
                      {boldText}
                    </strong>
                  )
                }
                return <span key={idx}>{part}</span>
              })}
            </p>
          )
        }
      }
      currentParagraph = []
    }
  }

  while (i < lines.length) {
    const line = lines[i].trim()
    const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : ''
    const prevLine = i > 0 ? lines[i - 1].trim() : ''

    // Button markers - check FIRST, before ANY other processing (including empty lines)
    // This ensures buttons are always rendered separately, even if they come after special blocks
    if (line === '[ASK_EVA_BUTTON]' || (line.includes('[ASK_EVA_BUTTON]') && line.trim() === '[ASK_EVA_BUTTON]')) {
      flushParagraph()
      elements.push(
        <AskEvaButton 
          key={key++} 
          articleTitle={options?.articleTitle}
          articleSlug={options?.articleSlug}
        />
      )
      i++
      continue
    }

    if (line === '[INFLAMMATION_QUIZ_BUTTON]' || (line.includes('[INFLAMMATION_QUIZ_BUTTON]') && line.trim() === '[INFLAMMATION_QUIZ_BUTTON]')) {
      flushParagraph()
      elements.push(
        <InflammationQuizButton 
          key={key++} 
          articleTitle={options?.articleTitle}
        />
      )
      i++
      continue
    }

    if (line === '[MRS_QUIZ_BUTTON]' || (line.includes('[MRS_QUIZ_BUTTON]') && line.trim() === '[MRS_QUIZ_BUTTON]')) {
      flushParagraph()
      elements.push(
        <MRSQuizButton 
          key={key++} 
          articleTitle={options?.articleTitle}
        />
      )
      i++
      continue
    }

    // H2 with gradient
    if (line.startsWith('## ') && !line.startsWith('###')) {
      flushParagraph()
      const title = line.replace('## ', '')
      elements.push(
        <motion.h2
          key={key++}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-h2 font-bold text-deep-navy mt-16 mb-8 first:mt-0 relative"
        >
          <span className="relative z-10 bg-gradient-to-r from-primary-purple to-ocean-wave-start bg-clip-text text-transparent">
            {title}
          </span>
          <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-primary-purple to-ocean-wave-start rounded-full" />
        </motion.h2>
      )
      i++
      continue
    }

    // H3 with icon
    if (line.startsWith('### ')) {
      flushParagraph()
      const title = line.replace('### ', '')
      let icon = null
      
      if (title.includes('Яичники') || title.includes('солнечные') || title.includes('Метаболизм')) {
        icon = <Activity className="w-5 h-5" />
      } else if (title.includes('Вазомоторные') || title.includes('приливы')) {
        icon = <Droplet className="w-5 h-5" />
      } else if (title.includes('Урогенитальные')) {
        icon = <Heart className="w-5 h-5" />
      } else if (title.includes('остеопороз') || title.includes('кости') || title.includes('Заботьтесь о костях')) {
        icon = <Bone className="w-5 h-5" />
      } else if (title.includes('Психоэмоциональные') || title.includes('настроение')) {
        icon = <Brain className="w-5 h-5" />
      } else if (title.includes('Абсолютные') || title.includes('противопоказания')) {
        icon = <XCircle className="w-5 h-5" />
      } else if (title.includes('Относительные')) {
        icon = <AlertCircle className="w-5 h-5" />
      } else if (title.includes('Комбинированная') || title.includes('Монотерапия') || title.includes('Местная')) {
        icon = <Pill className="w-5 h-5" />
      } else if (title.includes('Шаг') || title.includes('Принцип')) {
        icon = <CheckCircle2 className="w-5 h-5" />
      } else if (title.includes('Миф')) {
        icon = <AlertCircle className="w-5 h-5" />
      } else if (title.includes('Неделя') || title.includes('Месяц')) {
        icon = <Clock className="w-5 h-5" />
      } else if (title.includes('сердце') || title.includes('Сердце')) {
        icon = <Heart className="w-5 h-5" />
      } else if (title.includes('кишечник') || title.includes('Кишечник') || title.includes('микробиом')) {
        icon = <Activity className="w-5 h-5" />
      }

      elements.push(
        <motion.h3
          key={key++}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-h3 font-bold text-deep-navy mt-10 mb-6 flex items-center gap-3"
        >
          {icon && (
            <div className="w-10 h-10 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-lg flex items-center justify-center text-white shadow-md">
              {icon}
            </div>
          )}
          <span>{title}</span>
        </motion.h3>
      )
      i++
      continue
    }

    // H4 - Contraindication or regular
    if (line.startsWith('#### ')) {
      flushParagraph()
      const title = line.replace('#### ', '')
      
      // Check if next lines form a contraindication card
      let j = i + 1
      const listItems: string[] = []
      let whyText = ''
      
      while (j < lines.length && j < i + 15) {
        const checkLine = lines[j].trim()
        if (checkLine.startsWith('####') || checkLine.startsWith('###') || checkLine.startsWith('##')) {
          break
        }
        if (checkLine.startsWith('- **') || checkLine.startsWith('- ')) {
          // Remove markdown formatting and bullet point
          let cleanItem = checkLine.replace(/^-\s*/, '')
          // Remove bold markers but preserve the text
          cleanItem = cleanItem.replace(/\*\*/g, '')
          // Trim and add to list
          const trimmed = cleanItem.trim()
          if (trimmed) {
            listItems.push(trimmed)
          }
        }
        if (checkLine.startsWith('**Почему:**')) {
          whyText = checkLine.replace('**Почему:**', '').trim()
          j++
          break
        }
        // Stop if we hit an empty line followed by another heading or bold text
        if (checkLine === '' && j + 1 < lines.length) {
          const nextLine = lines[j + 1].trim()
          if (nextLine.startsWith('**') || nextLine.startsWith('####') || nextLine.startsWith('###')) {
            break
          }
        }
        j++
      }
      
      if (listItems.length > 0) {
        const isAbsolute = prevLine.includes('Абсолютные')
        elements.push(
          <ContraindicationCard
            key={key++}
            title={title}
            items={listItems.map(item => {
              // Split by " — " but only on the first occurrence
              const separatorIndex = item.indexOf(' — ')
              if (separatorIndex > 0) {
                return {
                  label: item.substring(0, separatorIndex).trim(),
                  description: item.substring(separatorIndex + 3).trim() || undefined,
                }
              }
              // If no separator, the whole item is the label
              return {
                label: item.trim(),
                description: undefined,
              }
            })}
            why={whyText || undefined}
            isAbsolute={isAbsolute}
          />
        )
        i = j
        continue
      }
      
      // Regular H4
      elements.push(
        <h4 key={key++} className="text-xl font-bold text-deep-navy mt-8 mb-4">
          {title}
        </h4>
      )
      i++
      continue
    }

    // Metaphor detection
    if (line.includes('как') && (line.includes('солнечные батареи') || line.includes('дирижёры') || line.includes('оркестр'))) {
      flushParagraph()
      let metaphorText = line
      let j = i + 1
      while (j < lines.length && !lines[j].trim().startsWith('##') && !lines[j].trim().startsWith('###')) {
        const nextLine = lines[j].trim()
        if (nextLine && !nextLine.startsWith('**') && !nextLine.match(/^\d+\./)) {
          metaphorText += ' ' + nextLine
          j++
        } else {
          break
        }
      }
      
      const titleMatch = metaphorText.match(/([^.]+\s+как[^.]+\.[^.]*)/)
      const title = titleMatch ? titleMatch[1].split('.')[0] : 'Метафора'
      
      elements.push(
        <MetaphorBox key={key++} title={title} emoji="💡">
          {metaphorText}
        </MetaphorBox>
      )
      i = j
      continue
    }

    // "Для кого", "Почему", "Что это значит", etc. sections
    if (line.match(/^\*\*(Для кого|Почему нужен|Почему можно|Почему ЗГТ особенно важна|Что это значит|Что происходит|Что вы чувствуете|Преимущества|Особенности|Когда используется|Когда ЗГТ показана|Режимы приёма|Формы):\*\*/)) {
      flushParagraph()
      const match = line.match(/\*\*([^*]+):\*\*\s*(.*)/)
      if (match) {
        const [, label, value] = match
        let content = value
        
        // Collect following lines
        let j = i + 1
        const listItems: string[] = []
        let hasList = false
        
        while (j < lines.length) {
          const nextLine = lines[j].trim()
          if (nextLine.startsWith('**') || nextLine.startsWith('##') || nextLine.startsWith('###')) {
            break
          }
          if (nextLine === '') {
            // Empty line - check if next line is also empty or a heading
            if (j + 1 < lines.length) {
              const nextNextLine = lines[j + 1].trim()
              if (nextNextLine.startsWith('**') || nextNextLine.startsWith('##') || nextNextLine.startsWith('###') || nextNextLine === '') {
                break
              }
            }
            j++
            continue
          }
          if (nextLine.startsWith('- ')) {
            hasList = true
            const listItem = nextLine.replace(/^-\s*\*\*|\*\*/g, '').replace(/^-\s*/, '').trim()
            if (listItem) {
              listItems.push(listItem)
            }
          } else if (!hasList) {
            // Only add to content if we haven't started collecting a list
            content += ' ' + nextLine
          }
          j++
        }
        
        const bgColor = label.includes('Для кого') 
          ? 'from-primary-purple/10 to-ocean-wave-start/10'
          : label.includes('Почему')
          ? 'from-warm-accent/10 to-primary-purple/10'
          : 'from-lavender-bg to-primary-purple/5'
        
        elements.push(
          <motion.div
            key={key++}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`bg-gradient-to-r ${bgColor} rounded-xl p-5 mb-6 border-l-4 border-primary-purple shadow-sm`}
          >
            <p className="text-body text-deep-navy leading-relaxed mb-3">
              <span className="font-bold text-primary-purple">{label}:</span>
              {content.trim() && (
                <span className="text-deep-navy/90"> {content.trim()}</span>
              )}
            </p>
            {hasList && listItems.length > 0 && (
              <ul className="space-y-2 mt-3">
                {listItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary-purple mt-1.5">•</span>
                    <span className="text-deep-navy/90 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )
        i = j
        continue
      }
    }

    // Numbered lists - steps
    if (line.match(/^\d+\.\s/)) {
      flushParagraph()
      const stepNum = parseInt(line.match(/^\d+/)?.[0] || '0')
      const text = line.replace(/^\d+\.\s/, '')
      const match = text.match(/^\*\*([^*]+)\*\*\s*(.*)/)
      
      const isStep = prevLine.includes('Шаг')
      
      if (isStep && match) {
        const [, boldText, rest] = match
        elements.push(
          <StepCard key={key++} step={stepNum} title={boldText}>
            {rest}
          </StepCard>
        )
      } else if (match) {
        const [, boldText, rest] = match
        elements.push(
          <motion.div
            key={key++}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-start gap-4 mb-4 p-5 bg-white rounded-xl border-2 border-lavender-bg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
              {stepNum}
            </div>
            <div>
              <span className="font-bold text-deep-navy text-lg">{boldText}</span>
              {rest && <p className="text-deep-navy/80 mt-2 leading-relaxed">{rest}</p>}
            </div>
          </motion.div>
        )
      } else {
        elements.push(
          <div key={key++} className="flex items-start gap-3 mb-3 ml-2">
            <span className="w-6 h-6 bg-primary-purple/20 rounded-full flex items-center justify-center text-primary-purple font-bold text-sm flex-shrink-0 mt-0.5">
              {stepNum}
            </span>
            <p className="text-body text-deep-navy/85">{text}</p>
          </div>
        )
      }
      i++
      continue
    }

    // Lists with bold items
    if (line.startsWith('- **') || line.startsWith('- ')) {
      flushParagraph()
      
      const isSpecialList = prevLine.includes('Что включает') || 
                           prevLine.includes('Факторы') || 
                           prevLine.includes('Режимы') ||
                           prevLine.includes('Формы') ||
                           prevLine.includes('Преимущества')
      
      if (isSpecialList && line.startsWith('- **')) {
        const text = line.replace(/^-\s*\*\*|\*\*/g, '')
        const parts = text.split(' — ')
        const label = parts[0]
        const description = parts[1] || ''
        
        elements.push(
          <motion.div
            key={key++}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-3 mb-3 p-4 bg-gradient-to-r from-lavender-bg to-primary-purple/5 rounded-xl hover:from-primary-purple/10 hover:to-ocean-wave-start/10 transition-all border border-primary-purple/10"
          >
            <div className="w-3 h-3 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full mt-1.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-deep-navy">{label}</span>
              {description && (
                <span className="text-deep-navy/70"> — {description}</span>
              )}
            </div>
          </motion.div>
        )
      } else {
        // Regular list item - process markdown
        let cleanText = line.replace(/^-\s*/, '')
        const parts = cleanText.split(/(\*\*[^*]+\*\*)/g)
        
        elements.push(
          <motion.div
            key={key++}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-3 mb-2 p-2 bg-lavender-bg/50 rounded-lg"
          >
            <div className="w-2 h-2 bg-primary-purple rounded-full mt-2 flex-shrink-0" />
            <div className="text-deep-navy/85">
              {parts.map((part, idx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  const boldText = part.replace(/\*\*/g, '')
                  return (
                    <strong key={idx} className="font-semibold text-deep-navy">
                      {boldText}
                    </strong>
                  )
                }
                return <span key={idx}>{part}</span>
              })}
            </div>
          </motion.div>
        )
      }
      i++
      continue
    }

    // StatHighlight detection - lines starting with "📊" or containing "По данным"
    if (line.includes('📊') || (line.includes('По данным') && (nextLine.startsWith('-') || nextLine.match(/^\d+\./)))) {
      flushParagraph()
      let statSource = line.replace('📊', '').trim()
      if (statSource.includes('По данным')) {
        const parts = statSource.split('По данным')
        statSource = parts.length > 1 ? 'По данным ' + parts[1].trim() : 'Исследования'
      }
      if (!statSource || statSource === '') {
        statSource = 'Исследования'
      }
      const stats: string[] = []
      let j = i + 1
      while (j < lines.length && j < i + 10) {
        const statLine = lines[j].trim()
        if (statLine.startsWith('##') || statLine.startsWith('###') || 
            (statLine === '' && j + 1 < lines.length && !lines[j + 1].trim().startsWith('-'))) {
          break
        }
        if (statLine.startsWith('- ') || statLine.match(/^\d+\./)) {
          const cleanStat = statLine.replace(/^[-•]\s*|\d+\.\s*/, '').trim()
          if (cleanStat) stats.push(cleanStat)
        }
        j++
      }
      if (stats.length > 0) {
        elements.push(
          <StatHighlight key={key++} source={statSource} stats={stats} />
        )
        i = j
        continue
      }
    }

    // TipsBox detection - lines starting with "💡" or "Что делать прямо сейчас"
    if (line.includes('💡') || line.includes('Что делать прямо сейчас') || 
        (line.includes('Практические шаги') && nextLine.startsWith('-'))) {
      flushParagraph()
      const tips: string[] = []
      let j = i
      // Skip the header line
      if (line.includes('💡') || line.includes('Что делать')) {
        j = i + 1
      }
      while (j < lines.length && j < i + 15) {
        const tipLine = lines[j].trim()
        if (tipLine.startsWith('##') || tipLine.startsWith('###') || 
            (tipLine.startsWith('**') && !tipLine.startsWith('- **'))) {
          break
        }
        if (tipLine.startsWith('- ')) {
          const cleanTip = tipLine.replace(/^-\s*\*\*|\*\*/g, '').replace(/^-\s*/, '').trim()
          if (cleanTip) tips.push(cleanTip)
        }
        j++
      }
      if (tips.length > 0) {
        elements.push(
          <TipsBox key={key++} tips={tips} />
        )
        i = j
        continue
      }
    }

    // InfoBox detection - lines starting with "ℹ️" or "Важно:" or "⚠️"
    // BUT: "Помните:" should be handled as a special highlighted block, not InfoBox
    if (line.includes('ℹ️') || line.includes('⚠️') || line.startsWith('**Важно:**')) {
      flushParagraph()
      let infoType: 'info' | 'warning' | 'success' = 'info'
      let infoTitle = ''
      let infoContent: string[] = []
      
      if (line.includes('⚠️') || line.includes('Важно')) {
        infoType = 'warning'
        infoTitle = 'Важно знать'
      } else if (line.includes('✅')) {
        infoType = 'success'
      }
      
      // Extract content
      let contentLine = line.replace(/ℹ️|⚠️|\*\*Важно:\*\*/g, '').trim()
      if (contentLine) infoContent.push(contentLine)
      
      let j = i + 1
      while (j < lines.length && j < i + 10) {
        const nextInfoLine = lines[j].trim()
        // Stop if we encounter button markers or headings
        if (nextInfoLine === '[ASK_EVA_BUTTON]' || 
            nextInfoLine === '[INFLAMMATION_QUIZ_BUTTON]' ||
            nextInfoLine.includes('[ASK_EVA_BUTTON]') ||
            nextInfoLine.includes('[INFLAMMATION_QUIZ_BUTTON]') ||
            nextInfoLine.startsWith('##') || 
            nextInfoLine.startsWith('###') || 
            (nextInfoLine.startsWith('**') && !nextInfoLine.includes(':'))) {
          break
        }
        if (nextInfoLine && !nextInfoLine.startsWith('- ')) {
          infoContent.push(nextInfoLine)
        }
        j++
      }
      
      if (infoContent.length > 0) {
        elements.push(
          <InfoBox key={key++} type={infoType} title={infoTitle || undefined}>
            {infoContent.join(' ')}
          </InfoBox>
        )
        i = j
        continue
      }
    }

    // Empty line
    if (line === '') {
      flushParagraph()
      i++
      continue
    }

    // Regular text
    currentParagraph.push(line)
    i++
  }

  flushParagraph()

  return elements
}

