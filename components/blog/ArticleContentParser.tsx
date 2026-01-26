'use client'

import { FC } from 'react'
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
import { PhenoAgeQuizButton } from '@/components/quiz/PhenoAgeQuizButton'
import { WHRQuizButton } from '@/components/quiz/WHRQuizButton'
import { GuideLink } from './GuideLink'

interface ParseResult {
  elements: JSX.Element[]
}

interface ParseOptions {
  articleTitle?: string
  articleSlug?: string
}

export const parseArticleContent = (content: string, options?: ParseOptions): JSX.Element[] => {
  // Удаляем мета-информацию из контента (Meta Title, Meta Description)
  // Эти строки не должны отображаться в статье
  // Также удаляем разделители "---" в начале и конце абзацев
  const cleanedContent = content
    .split('\n')
    .filter(line => {
      const trimmed = line.trim()
      // Пропускаем строки с мета-информацией
      return !trimmed.match(/^\*\*Meta\s+(Title|Description):\*\*/i)
    })
    .map(line => {
      // Удаляем разделители "---" которые идут отдельной строкой
      const trimmed = line.trim()
      if (trimmed === '---' || trimmed.match(/^---+$/)) {
        return '' // Заменяем на пустую строку, она будет обработана как empty line
      }
      return line
    })
    .join('\n')
  
  const lines = cleanedContent.trim().split('\n')
  const elements: JSX.Element[] = []
  let currentParagraph: string[] = []
  let key = 0
  let i = 0

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      // Filter out any separator artifacts before joining
      const filteredParagraph = currentParagraph.filter(line => {
        const trimmed = line.trim()
        return trimmed !== '' && 
               trimmed !== '---' && 
               !trimmed.match(/^---+$/) &&
               !trimmed.startsWith('---') &&
               !trimmed.endsWith('---')
      })
      
      if (filteredParagraph.length === 0) {
        currentParagraph = []
        return
      }
      
      let text = filteredParagraph.join(' ').trim()
      
      // Remove separator artifacts from the final text
      text = text
        .replace(/---+/g, '') // Remove all separators
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
      
      // Remove leading colon artifacts
      if (text.startsWith(': ')) {
        text = text.substring(2).trim()
      }
      
      if (text) {
        // Check for button markers first - they should be on separate lines
        if (text.includes('[ASK_EVA_BUTTON]') || text.includes('[INFLAMMATION_QUIZ_BUTTON]') || text.includes('[MRS_QUIZ_BUTTON]') || text.includes('[PHENOAGE_QUIZ_BUTTON]') || text.includes('[WHR_QUIZ_BUTTON]')) {
          // Split text by markers and process separately
          const parts = text.split(/(\[ASK_EVA_BUTTON\]|\[INFLAMMATION_QUIZ_BUTTON\]|\[MRS_QUIZ_BUTTON\]|\[PHENOAGE_QUIZ_BUTTON\]|\[WHR_QUIZ_BUTTON\])/g)
          
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
            } else if (part === '[PHENOAGE_QUIZ_BUTTON]') {
              elements.push(
                <PhenoAgeQuizButton 
                  key={key++} 
                  articleTitle={options?.articleTitle}
                />
              )
            } else if (part === '[WHR_QUIZ_BUTTON]') {
              elements.push(
                <WHRQuizButton 
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
            <div
              key={key++}
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
            </div>
          )
        } else {
          // Check for guide link pattern: "Скачайте полный гайд "название"" (with or without bold)
          const guideLinkPattern = /Скачайте полный гайд\s+"([^"]+)"/i
          const guideMatch = text.match(guideLinkPattern)
          
          if (guideMatch) {
            const guideName = guideMatch[1].replace(/\*\*/g, '') // Remove any markdown bold markers
            const fullMatch = guideMatch[0]
            const matchIndex = guideMatch.index!
            
            // Split text into parts: before, guide link, after
            const beforeText = text.substring(0, matchIndex).trim()
            const afterText = text.substring(matchIndex + fullMatch.length).trim()
            
            // Process before and after text with markdown formatting
            const processMarkdown = (markdownText: string): JSX.Element[] => {
              if (!markdownText) return []
              const parts = markdownText.split(/(\*\*[^*]+\*\*)/g)
              return parts.map((part, idx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  const boldText = part.replace(/\*\*/g, '')
                  return (
                    <strong key={idx} className="font-semibold text-deep-navy">
                      {boldText}
                    </strong>
                  )
                }
                return <span key={idx}>{part}</span>
              })
            }
            
            // Extract "Скачайте полный гайд" from the matched pattern
            const prefixText = fullMatch.substring(0, fullMatch.indexOf('"')).trim()
            
            elements.push(
              <p key={key++} className="text-body text-deep-navy/85 mb-6 leading-relaxed">
                {processMarkdown(beforeText)}
                {beforeText && <span> </span>}
                <strong className="font-semibold text-deep-navy">{prefixText} </strong>
                <GuideLink guideName={guideName} />
                {afterText && <span> </span>}
                {processMarkdown(afterText)}
              </p>
            )
          } else {
            // Regular paragraph with markdown formatting (bold text)
            // Check if guide link pattern exists inside bold text or anywhere in paragraph
            const guideLinkPattern = /Скачайте полный гайд\s+"([^"]+)"/i
            const guideMatchAnywhere = text.match(guideLinkPattern)
            
            if (guideMatchAnywhere) {
              const guideName = guideMatchAnywhere[1].replace(/\*\*/g, '')
              const fullMatch = guideMatchAnywhere[0]
              const matchIndex = guideMatchAnywhere.index!
              
              // Check if the match is inside bold markers
              const beforeMatch = text.substring(0, matchIndex)
              const afterMatch = text.substring(matchIndex + fullMatch.length)
              
              // Count bold markers before the match
              const boldMarkersBefore = (beforeMatch.match(/\*\*/g) || []).length
              const isInsideBold = boldMarkersBefore % 2 === 1
              
              // Extract text parts
              const beforeText = beforeMatch.trim()
              const afterText = afterMatch.trim()
              
              // Extract text before guide (remove closing bold if exists)
              let beforeGuide = beforeText
              let afterGuide = afterText
              
              if (isInsideBold) {
                // Find the start of bold section
                const lastBoldStart = beforeMatch.lastIndexOf('**')
                beforeGuide = beforeMatch.substring(lastBoldStart + 2).trim()
                // Find the end of bold section
                const firstBoldEnd = afterMatch.indexOf('**')
                if (firstBoldEnd !== -1) {
                  afterGuide = afterMatch.substring(0, firstBoldEnd).trim()
                  const remainingAfter = afterMatch.substring(firstBoldEnd + 2).trim()
                  // Process remaining text with markdown
                  const processMarkdown = (mdText: string): JSX.Element[] => {
                    if (!mdText) return []
                    const parts = mdText.split(/(\*\*[^*]+\*\*)/g)
                    return parts.map((part, idx) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return (
                          <strong key={idx} className="font-semibold text-deep-navy">
                            {part.replace(/\*\*/g, '')}
                          </strong>
                        )
                      }
                      return <span key={idx}>{part}</span>
                    })
                  }
                  
                  // Extract "Скачайте полный гайд" from the matched pattern (it's inside the bold section)
                  const prefixText = guideMatchAnywhere[0].substring(0, guideMatchAnywhere[0].indexOf('"')).trim()
                  
                  elements.push(
                    <p key={key++} className="text-body text-deep-navy/85 mb-6 leading-relaxed">
                      {lastBoldStart > 0 && processMarkdown(beforeMatch.substring(0, lastBoldStart))}
                      {lastBoldStart > 0 && <strong className="font-semibold text-deep-navy">{beforeGuide && `${beforeGuide} `}</strong>}
                      {lastBoldStart === 0 && beforeGuide && <strong className="font-semibold text-deep-navy">{beforeGuide} </strong>}
                      <strong className="font-semibold text-deep-navy">{prefixText} </strong>
                      <GuideLink guideName={guideName} />
                      {afterGuide && <strong className="font-semibold text-deep-navy"> {afterGuide}</strong>}
                      {remainingAfter && <span> {remainingAfter}</span>}
                    </p>
                  )
                  currentParagraph = []
                  return
                }
              }
              
              // Process before and after text with markdown formatting
              const processMarkdown = (markdownText: string): JSX.Element[] => {
                if (!markdownText) return []
                const parts = markdownText.split(/(\*\*[^*]+\*\*)/g)
                return parts.map((part, idx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    const boldText = part.replace(/\*\*/g, '')
                    return (
                      <strong key={idx} className="font-semibold text-deep-navy">
                        {boldText}
                      </strong>
                    )
                  }
                  return <span key={idx}>{part}</span>
                })
              }
              
            // The pattern "Скачайте полный гайд" is already in the matched text, so we need to preserve it
            // Extract "Скачайте полный гайд" from the match
            const prefixText = fullMatch.substring(0, fullMatch.indexOf('"')).trim()
            
            elements.push(
              <p key={key++} className="text-body text-deep-navy/85 mb-6 leading-relaxed">
                {processMarkdown(beforeText)}
                {beforeText && <span> </span>}
                <strong className="font-semibold text-deep-navy">{prefixText} </strong>
                <GuideLink guideName={guideName} />
                {afterText && <span> </span>}
                {processMarkdown(afterText)}
              </p>
            )
            } else {
              // Regular paragraph with markdown formatting (bold text)
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

    if (line === '[WHR_QUIZ_BUTTON]' || (line.includes('[WHR_QUIZ_BUTTON]') && line.trim() === '[WHR_QUIZ_BUTTON]')) {
      flushParagraph()
      elements.push(
        <WHRQuizButton 
          key={key++} 
          articleTitle={options?.articleTitle}
        />
      )
      i++
      continue
    }

    if (line === '[PHENOAGE_QUIZ_BUTTON]' || (line.includes('[PHENOAGE_QUIZ_BUTTON]') && line.trim() === '[PHENOAGE_QUIZ_BUTTON]')) {
      flushParagraph()
      elements.push(
        <PhenoAgeQuizButton 
          key={key++} 
          articleTitle={options?.articleTitle}
        />
      )
      i++
      continue
    }

    // Table detection - Markdown table format
    if (line.includes('|') && line.match(/^\|.*\|$/)) {
      flushParagraph()
      const tableRows: string[][] = []
      let j = i
      
      // Helper function to check if line is a separator row
      const isSeparatorRow = (tableLine: string): boolean => {
        // Separator rows contain only dashes, colons, spaces, and pipes
        // Pattern: |---|, |:---|, |---:|, |:---:|, etc.
        const separatorPattern = /^\|[\s\-:]*\|(\s*\|[\s\-:]*\|)*$/
        if (!separatorPattern.test(tableLine)) {
          return false
        }
        // Also check that all cells (except empty ones) contain only dashes/colons/spaces
        const cells = tableLine.split('|').map(c => c.trim()).filter(c => c !== '')
        return cells.every(cell => /^[\-:\s]+$/.test(cell))
      }
      
      // Collect all table rows
      while (j < lines.length && j < i + 20) {
        const tableLine = lines[j].trim()
        
        // Skip separator rows completely
        if (isSeparatorRow(tableLine)) {
          j++
          continue
        }
        
        // Stop if it's not a table row at all
        if (!tableLine.match(/^\|.*\|$/)) {
          break
        }
        
        // Parse row cells
        const cells = tableLine
          .split('|')
          .map(cell => cell.trim())
          .filter(cell => cell !== '')
        
        // Only add non-empty rows
        if (cells.length > 0) {
          // Double-check: don't add if all cells are just separators
          const hasContent = cells.some(cell => !/^[\-:\s]+$/.test(cell))
          if (hasContent) {
            tableRows.push(cells)
          }
        }
        
        j++
      }
      
      // If we have at least header and one data row, render table
      if (tableRows.length >= 2) {
        const headers = tableRows[0]
        // Filter out any remaining separator rows that might have slipped through
        const dataRows = tableRows.slice(1).filter(row => 
          row.some(cell => !/^[\-:\s]+$/.test(cell))
        )
        
        elements.push(
          <div
            key={key++}
            className="my-8 overflow-x-auto rounded-xl border border-lavender-bg shadow-sm"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-primary-purple/10 to-ocean-wave-start/10">
                  {headers.map((header, idx) => (
                    <th
                      key={idx}
                      className="px-6 py-4 text-left font-semibold text-deep-navy border-b-2 border-primary-purple/20"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={`border-b border-lavender-bg ${
                      rowIdx % 2 === 0 ? 'bg-white' : 'bg-lavender-bg/30'
                    } hover:bg-primary-purple/5 transition-colors`}
                  >
                    {headers.map((_, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-6 py-4 text-body text-deep-navy/85"
                      >
                        {row[cellIdx] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        i = j
        continue
      }
    }

    // H2 with gradient
    if (line.startsWith('## ') && !line.startsWith('###')) {
      flushParagraph()
      const title = line.replace('## ', '')
      elements.push(
        <h2
          key={key++}
          className="text-h2 font-bold text-deep-navy mt-16 mb-8 first:mt-0 relative"
        >
          <span className="relative z-10 bg-gradient-to-r from-primary-purple to-ocean-wave-start bg-clip-text text-transparent">
            {title}
          </span>
          <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-primary-purple to-ocean-wave-start rounded-full" />
        </h2>
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
        <h3
          key={key++}
          className="text-h3 font-bold text-deep-navy mt-10 mb-6 flex items-center gap-3"
        >
          {icon && (
            <div className="w-10 h-10 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-lg flex items-center justify-center text-white shadow-md">
              {icon}
            </div>
          )}
          <span>{title}</span>
        </h3>
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
          <div
            key={key++}
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
          </div>
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
          <div
            key={key++}
            className="flex items-start gap-4 mb-4 p-5 bg-white rounded-xl border-2 border-lavender-bg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
              {stepNum}
            </div>
            <div>
              <span className="font-bold text-deep-navy text-lg">{boldText}</span>
              {rest && <p className="text-deep-navy/80 mt-2 leading-relaxed">{rest}</p>}
            </div>
          </div>
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
          <div
            key={key++}
            className="flex items-start gap-3 mb-3 p-4 bg-gradient-to-r from-lavender-bg to-primary-purple/5 rounded-xl hover:from-primary-purple/10 hover:to-ocean-wave-start/10 transition-all border border-primary-purple/10"
          >
            <div className="w-3 h-3 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full mt-1.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-deep-navy">{label}</span>
              {description && (
                <span className="text-deep-navy/70"> — {description}</span>
              )}
            </div>
          </div>
        )
      } else {
        // Regular list item - process markdown
        let cleanText = line.replace(/^-\s*/, '')
        const parts = cleanText.split(/(\*\*[^*]+\*\*)/g)
        
        elements.push(
          <div
            key={key++}
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
          </div>
        )
      }
      i++
      continue
    }

    // StatHighlight detection - lines starting with "📊" or containing "По данным"
    if (line.includes('📊') || (line.includes('По данным') && (nextLine.startsWith('-') || nextLine.match(/^\d+\./)))) {
      flushParagraph()
      let statSource = line.replace('📊', '').trim()
      // Remove markdown bold formatting (**text**)
      statSource = statSource.replace(/\*\*/g, '').trim()
      // Remove trailing colon if present (will be added by component if needed)
      statSource = statSource.replace(/:$/, '').trim()
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

    // InfoBox detection - blockquote style with warning/info (MUST be before regular blockquote)
    // Handle: "> ⚠️ **Когда идти к врачу**: ..." as InfoBox
    if (line.startsWith('>') && (line.includes('⚠️') || line.includes('ℹ️') || 
        line.includes('**Когда идти') || line.includes('**Важно:'))) {
      flushParagraph()
      let infoType: 'info' | 'warning' | 'success' = 'warning'
      let infoTitle = 'Важно знать'
      let infoContent: string[] = []
      
      // Remove ">" prefix and clean up
      let contentLine = line.replace(/^>\s*/, '').trim()
      
      // Remove markdown formatting markers but keep the structure
      contentLine = contentLine.replace(/⚠️\s*/g, '')
      contentLine = contentLine.replace(/\*\*Когда идти к врачу:\*\*/g, 'Когда идти к врачу:')
      contentLine = contentLine.replace(/\*\*Важно:\*\*/g, 'Важно:')
      contentLine = contentLine.replace(/---+/g, '').trim()
      
      if (contentLine) infoContent.push(contentLine)
      
      let j = i + 1
      while (j < lines.length && j < i + 10) {
        const nextInfoLine = lines[j].trim()
        // Stop at separator, headings, or non-blockquote lines
        if (nextInfoLine === '---' || nextInfoLine.match(/^---+$/) ||
            nextInfoLine.startsWith('##') || 
            nextInfoLine.startsWith('###') ||
            (!nextInfoLine.startsWith('>') && nextInfoLine !== '')) {
          break
        }
        if (nextInfoLine.startsWith('>')) {
          let cleanLine = nextInfoLine.replace(/^>\s*/, '').trim()
          cleanLine = cleanLine.replace(/---+/g, '').trim()
          if (cleanLine) infoContent.push(cleanLine)
        }
        j++
      }
      
      if (infoContent.length > 0) {
        // Clean up the content - remove any remaining markdown artifacts
        let finalContent = infoContent
          .join(' ')
          .replace(/\s+/g, ' ')
          .replace(/---+/g, '')
          .trim()
        
        // Convert markdown bold (**text**) to JSX elements
        const parts = finalContent.split(/(\*\*[^*]+\*\*)/g)
        const formattedContent = parts.map((part, idx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const boldText = part.replace(/\*\*/g, '')
            return <strong key={idx}>{boldText}</strong>
          }
          return <span key={idx}>{part}</span>
        })
        
        elements.push(
          <InfoBox key={key++} type={infoType} title={infoTitle}>
            {formattedContent}
          </InfoBox>
        )
        i = j
        continue
      }
    }

    // InfoBox detection - lines starting with "ℹ️" or "Важно:" or "⚠️" (non-blockquote)
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
      contentLine = contentLine.replace(/---+/g, '').trim()
      if (contentLine) infoContent.push(contentLine)
      
      let j = i + 1
      while (j < lines.length && j < i + 10) {
        const nextInfoLine = lines[j].trim()
        // Stop if we encounter button markers, separators, or headings
        if (nextInfoLine === '[ASK_EVA_BUTTON]' || 
            nextInfoLine === '[INFLAMMATION_QUIZ_BUTTON]' ||
            nextInfoLine.includes('[ASK_EVA_BUTTON]') ||
            nextInfoLine.includes('[INFLAMMATION_QUIZ_BUTTON]') ||
            nextInfoLine === '---' || nextInfoLine.match(/^---+$/) ||
            nextInfoLine.startsWith('##') || 
            nextInfoLine.startsWith('###') || 
            (nextInfoLine.startsWith('**') && !nextInfoLine.includes(':'))) {
          break
        }
        if (nextInfoLine && !nextInfoLine.startsWith('- ')) {
          const cleanLine = nextInfoLine.replace(/---+/g, '').trim()
          if (cleanLine) infoContent.push(cleanLine)
        }
        j++
      }
      
      if (infoContent.length > 0) {
        // Clean up content and convert markdown formatting
        let finalContent = infoContent
          .join(' ')
          .replace(/\s+/g, ' ')
          .replace(/---+/g, '')
          .trim()
        
        // Convert markdown bold (**text**) to JSX elements
        const parts = finalContent.split(/(\*\*[^*]+\*\*)/g)
        const formattedContent = parts.map((part, idx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const boldText = part.replace(/\*\*/g, '')
            return <strong key={idx}>{boldText}</strong>
          }
          return <span key={idx}>{part}</span>
        })
        
        elements.push(
          <InfoBox key={key++} type={infoType} title={infoTitle || undefined}>
            {formattedContent}
          </InfoBox>
        )
        i = j
        continue
      }
    }

    // Blockquote detection (lines starting with ">") - regular blockquotes only
    // Skip if already handled as InfoBox (blockquote-style warnings)
    if (line.startsWith('>') && !line.includes('⚠️') && !line.includes('**Когда идти') && !line.includes('**Важно:')) {
      flushParagraph()
      let quoteText = line.replace(/^>\s*/, '').trim()
      
      // Remove emoji if present (for TipsBox-style blockquotes)
      const isTipBox = quoteText.includes('💡')
      const isInfoBox = quoteText.includes('ℹ️')
      
      // Clean up the text
      quoteText = quoteText
        .replace(/💡\s*/g, '')
        .replace(/ℹ️\s*/g, '')
        .trim()
      
      // Remove separator artifacts
      quoteText = quoteText.replace(/---+/g, '').trim()
      
      let j = i + 1
      
      // Collect following lines that are also blockquotes or continuation
      while (j < lines.length && j < i + 10) {
        const nextQuoteLine = lines[j].trim()
        if (nextQuoteLine.startsWith('>')) {
          let nextText = nextQuoteLine.replace(/^>\s*/, '').trim()
          nextText = nextText.replace(/---+/g, '').trim()
          if (nextText) {
            quoteText += ' ' + nextText
          }
          j++
        } else if (nextQuoteLine === '' || nextQuoteLine === '---' || nextQuoteLine.match(/^---+$/)) {
          j++
          break
        } else {
          break
        }
      }
      
      if (quoteText) {
        // Remove leading colon artifacts
        if (quoteText.startsWith(': ')) {
          quoteText = quoteText.substring(2).trim()
        }
        
        // Remove markdown bold formatting but preserve structure
        const parts = quoteText.split(/(\*\*[^*]+\*\*)/g)
        
        // If it's a TipsBox-style blockquote, render as TipsBox
        if (isTipBox && quoteText.includes('**Вывод**')) {
          const conclusion = quoteText.replace(/\*\*Вывод\*\*:\s*/i, '').trim()
          elements.push(
            <TipsBox key={key++} tips={[conclusion]} />
          )
        } else {
          // Regular blockquote
          elements.push(
            <blockquote
              key={key++}
              className="border-l-4 border-primary-purple bg-lavender-bg/50 rounded-r-xl p-6 my-8 italic text-deep-navy/90"
            >
              <p className="text-body leading-relaxed">
                {parts.map((part, idx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    const boldText = part.replace(/\*\*/g, '').trim()
                    // Remove colon after bold if it's a label
                    const cleanBold = boldText.replace(/:\s*$/, '')
                    return (
                      <strong key={idx} className="font-semibold text-deep-navy not-italic">
                        {cleanBold}{boldText.endsWith(':') ? ':' : ''}
                      </strong>
                    )
                  }
                  // Remove leading colon artifacts
                  const cleanPart = part.replace(/^:\s+/, '')
                  return <span key={idx}>{cleanPart}</span>
                })}
              </p>
            </blockquote>
          )
        }
        i = j
        continue
      }
    }

    // Horizontal rule / separator (---) - MUST check before empty line and regular text
    if (line === '---' || line.match(/^---+$/)) {
      flushParagraph()
      // Skip separator lines completely, don't render them
      i++
      continue
    }

    // Empty line
    if (line === '') {
      flushParagraph()
      i++
      continue
    }

    // Regular text - filter out any remaining separator artifacts
    const cleanLine = line.trim()
    // Skip if line is just separators or contains only separators
    if (cleanLine === '---' || cleanLine.match(/^---+$/) || cleanLine.startsWith('---')) {
      flushParagraph()
      i++
      continue
    }
    
    // Remove separator artifacts from beginning/end of lines
    let processedLine = line
      .replace(/^---+\s*/, '') // Remove separators from start
      .replace(/\s*---+\s*$/, '') // Remove separators from end
      .replace(/\s*---+\s*/g, ' ') // Remove separators in the middle
      .trim()
    
    // Only add if there's actual content left
    if (processedLine && processedLine !== '---' && !processedLine.match(/^---+$/)) {
      // Remove leading colon if it's an artifact (e.g., ": Отказ от курения")
      if (processedLine.startsWith(': ')) {
        processedLine = processedLine.substring(2)
      }
      currentParagraph.push(processedLine)
    }
    i++
  }

  flushParagraph()

  return elements
}

