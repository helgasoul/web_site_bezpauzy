'use client'

import { FC, useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Maximize2, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PodcastEpisode } from '@/lib/types/video'
import { formatDuration } from '@/lib/utils/video'

interface PodcastPlayerProps {
  episode: PodcastEpisode
  showTranscript?: boolean
}

export const PodcastPlayer: FC<PodcastPlayerProps> = ({ episode, showTranscript = true }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(episode.duration || 0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showTranscriptModal, setShowTranscriptModal] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // Инициализация аудио
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration || episode.duration || 0)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [episode.duration])

  // Получаем URL аудио в зависимости от типа
  const getAudioUrl = () => {
    // Если есть прямой video_url и это не YouTube/Mave, используем его
    if (episode.video_url && !episode.video_url.includes('youtube.com') && !episode.video_url.includes('mave.io')) {
      return episode.video_url
    }
    
    // Для Mave можно попробовать получить аудио URL
    if (episode.video_type === 'mave' && episode.video_id) {
      // Mave может предоставлять аудио URL через API
      // Пока возвращаем null, так как нужен доступ к Mave API
      return null
    }
    
    // Для YouTube нет прямого аудио URL без специальных сервисов
    if (episode.video_type === 'youtube' && episode.video_id) {
      return null
    }
    
    return episode.video_url
  }

  const audioUrl = getAudioUrl()
  const hasDirectAudio = audioUrl !== null

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const progressBar = progressRef.current
    if (!audio || !progressBar) return

    const rect = progressBar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration

    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const skip = (seconds: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds))
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = parseFloat(e.target.value)
    audio.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <>
      <div className="bg-white rounded-3xl shadow-card overflow-hidden border border-lavender-bg">
        {/* Player Header */}
        <div className="bg-gradient-to-br from-primary-purple/10 to-ocean-wave-start/10 p-6 border-b border-lavender-bg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h4 font-semibold text-deep-navy">Аудио плеер</h2>
            {showTranscript && episode.transcript && (
              <button
                onClick={() => setShowTranscriptModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-purple/10 hover:bg-primary-purple/20 text-primary-purple rounded-full transition-colors text-body-small font-medium"
              >
                <FileText className="w-4 h-4" />
                Транскрипт
              </button>
            )}
          </div>
          <p className="text-body text-deep-navy/70">{episode.title}</p>
        </div>

        {/* Audio Element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            preload="metadata"
            className="hidden"
          />
        )}

        {/* Player Controls */}
        <div className="p-6">
          {/* Progress Bar */}
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="w-full h-2 bg-lavender-bg rounded-full cursor-pointer mb-6 group"
          >
            <div
              className="h-full bg-gradient-to-r from-primary-purple to-ocean-wave-start rounded-full transition-all duration-300 relative group-hover:h-3"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary-purple rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Time Display */}
          <div className="flex items-center justify-between mb-6 text-body-small text-deep-navy/60">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => skip(-10)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-lavender-bg hover:bg-primary-purple/10 text-deep-navy hover:text-primary-purple transition-colors"
              aria-label="Назад на 10 секунд"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              disabled={!hasDirectAudio}
              className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-purple to-ocean-wave-start text-white hover:shadow-strong transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isPlaying ? 'Пауза' : 'Воспроизведение'}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>

            <button
              onClick={() => skip(10)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-lavender-bg hover:bg-primary-purple/10 text-deep-navy hover:text-primary-purple transition-colors"
              aria-label="Вперед на 10 секунд"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMute}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-lavender-bg hover:bg-primary-purple/10 text-deep-navy hover:text-primary-purple transition-colors"
              aria-label={isMuted ? 'Включить звук' : 'Выключить звук'}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-lavender-bg rounded-full appearance-none cursor-pointer accent-primary-purple"
            />
            <span className="text-body-small text-deep-navy/60 w-12 text-right">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>

          {/* External Links */}
          {!hasDirectAudio && (
            <div className="mt-6 pt-6 border-t border-lavender-bg">
              <p className="text-body-small text-deep-navy/60 mb-3">
                Прослушать на:
              </p>
              <div className="flex flex-wrap gap-3">
                {episode.video_type === 'youtube' && episode.video_id && (
                  <a
                    href={`https://www.youtube.com/watch?v=${episode.video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-red-600 text-white rounded-full text-body-small font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    YouTube
                  </a>
                )}
                {episode.video_type === 'mave' && episode.video_id && (
                  <a
                    href={`https://mave.io/embed/${episode.video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-primary-purple text-white rounded-full text-body-small font-medium hover:bg-primary-purple/90 transition-colors flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Mave
                  </a>
                )}
                {episode.video_url && (
                  <a
                    href={episode.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-ocean-wave-start text-white rounded-full text-body-small font-medium hover:bg-ocean-wave-start/90 transition-colors flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Открыть ссылку
                  </a>
                )}
              </div>
              <p className="text-body-small text-deep-navy/50 mt-3">
                Для прослушивания нажмите на кнопку выше
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transcript Modal */}
      <AnimatePresence>
        {showTranscriptModal && episode.transcript && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTranscriptModal(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-br from-primary-purple/10 to-ocean-wave-start/10 p-6 border-b border-lavender-bg flex items-center justify-between">
                <h3 className="text-h3 font-semibold text-deep-navy">Транскрипт эпизода</h3>
                <button
                  onClick={() => setShowTranscriptModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-lavender-bg transition-colors"
                  aria-label="Закрыть"
                >
                  <Maximize2 className="w-5 h-5 text-deep-navy" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="prose prose-lg max-w-none">
                  <p className="text-body text-deep-navy/80 leading-relaxed whitespace-pre-line">
                    {episode.transcript}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

