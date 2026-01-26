'use client'

import { FC, useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Volume2, VolumeX, Volume1, Play, Pause, Square } from 'lucide-react'
import { assetUrl } from '@/lib/assets'

interface BotIntroVideoProps {}

export const BotIntroVideo: FC<BotIntroVideoProps> = () => {
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1) // 0 to 1
  const [showControls, setShowControls] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Проверяем состояние воспроизведения
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => {
      setIsPlaying(true)
    }
    const handlePause = () => {
      setIsPlaying(false)
    }
    const handleEnded = () => {
      setIsPlaying(false)
    }
    const handlePlaying = () => {
      setIsPlaying(true)
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('playing', handlePlaying)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    // Проверяем начальное состояние
    if (video.readyState >= 2) {
      setIsPlaying(!video.paused)
    }

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Устанавливаем volume через ref (volume не является HTML-атрибутом)
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.volume = volume
      video.muted = isMuted
    }
  }, [volume, isMuted])

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted
      videoRef.current.muted = newMuted
      setIsMuted(newMuted)
    }
  }

  const togglePlay = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    const video = videoRef.current
    if (!video) {
      console.error('Video element not found')
      return
    }

    try {
      // Если видео еще не загружено, ждем загрузки
      if (video.readyState === 0) {
        video.load()
        // Ждем, пока видео загрузится, перед воспроизведением
        await new Promise((resolve) => {
          video.addEventListener('canplay', resolve, { once: true })
        })
      }
      
      if (video.paused) {
        // Видео на паузе - запускаем с текущей позиции
        const playPromise = video.play()
        if (playPromise !== undefined) {
          await playPromise
          setIsPlaying(true)
        }
      } else {
        // Видео играет - ставим на паузу (но это не должно происходить, так как используется handlePause)
        video.pause()
        setIsPlaying(false)
      }
    } catch (error: any) {
      console.error('Error toggling play:', error)
      setIsPlaying(false)
      // Показываем сообщение пользователю, если видео не может быть воспроизведено
      if (error.name === 'NotAllowedError') {
        alert('Пожалуйста, разрешите автовоспроизведение видео в настройках браузера')
      } else if (error.name === 'NotSupportedError') {
        console.error('Video format not supported or file not found')
      }
    }
  }

  const handlePause = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    const video = videoRef.current
    if (!video) return

    // Просто ставим на паузу, НЕ сбрасываем currentTime
    video.pause()
    setIsPlaying(false)
  }

  const handleStop = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    const video = videoRef.current
    if (!video) return

    video.pause()
    video.currentTime = 0
    setIsPlaying(false)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      videoRef.current.muted = newVolume === 0
      setIsMuted(newVolume === 0)
    }
  }

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX
    if (volume < 0.5) return Volume1
    return Volume2
  }

  const VolumeIcon = getVolumeIcon()

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-soft-white to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-purple/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-ocean-wave-start/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h2
              className="text-h2 font-bold text-deep-navy mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Познакомьтесь с Евой
            </motion.h2>
            <motion.p
              className="text-body-large text-deep-navy/70 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Посмотрите приветственное видео, где Ева рассказывает о себе и о том, как она работает
            </motion.p>
          </div>

          {/* Video Container - Circular like Telegram */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            {/* Circular video container */}
            <div className="relative w-80 h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] rounded-full overflow-hidden shadow-strong bg-gradient-to-br from-primary-purple/20 to-ocean-wave-start/20 border-4 border-white">
              <video
                ref={videoRef}
                src="/api/video/welcome-video"
                preload="metadata"
                className={`w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
                loop
                playsInline
                muted={isMuted}
                onClick={togglePlay}
                onLoadedMetadata={() => {
                  // Видео загружено, можно воспроизводить
                  console.log('Video metadata loaded successfully')
                }}
                onCanPlay={() => {
                  console.log('Video can play')
                }}
                onError={(e) => {
                  console.error('Video error:', e)
                  const video = e.currentTarget
                  if (video.error) {
                    console.error('Video error code:', video.error.code)
                    console.error('Video error message:', video.error.message)
                    console.error('Video src:', video.src)
                    console.error('Video currentSrc:', video.currentSrc)
                    
                    // Устанавливаем сообщение об ошибке
                    if (video.error.code === 4) {
                      setVideoError('Файл видео не найден. Добавьте welcome-video.mp4 в public/ или укажите WELCOME_VIDEO_URL в настройках (URL из Supabase Storage).')
                    } else {
                      setVideoError(`Ошибка загрузки видео: код ${video.error.code}`)
                    }
                  }
                }}
              />

              {/* Error message */}
              {videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 backdrop-blur-sm z-30 rounded-full p-4">
                  <div className="text-center text-sm text-red-600 max-w-xs">
                    <p className="font-semibold mb-2">Ошибка загрузки видео</p>
                    <p className="text-xs">{videoError}</p>
                    <p className="text-xs mt-2 text-red-500">
                      Либо загрузите welcome-video.mp4 в public/, либо задайте WELCOME_VIDEO_URL (URL в Supabase Storage).
                    </p>
                  </div>
                </div>
              )}

              {/* Beautiful placeholder with Eva image when paused */}
              {!isPlaying && !videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-purple/30 via-primary-purple/20 to-ocean-wave-start/30">
                  {/* Eva image */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="relative w-3/4 h-3/4 rounded-full overflow-hidden">
                      <Image
                        src={assetUrl('/ChatGPT Image Dec 19, 2025 at 10_44_36 PM.png')}
                        alt="Ева"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 240px, (max-width: 1024px) 360px, 375px"
                        priority
                      />
                      {/* Subtle overlay for better play button visibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </div>
                  </div>

                  {/* Play button overlay */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={togglePlay}
                    type="button"
                    className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer group"
                    aria-label="Воспроизвести видео"
                  >
                    <div className="w-24 h-24 md:w-28 md:h-28 bg-white/95 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group-hover:bg-white">
                      <Play className="w-12 h-12 md:w-14 md:h-14 text-primary-purple ml-1" fill="currentColor" />
                    </div>
                  </motion.button>
                </div>
              )}

              {/* Subtle gradient overlay at bottom only when playing */}
              {isPlaying && (
                <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/20 via-transparent to-transparent pointer-events-none" />
              )}


              {/* Controls Overlay */}
              <motion.div
                className="absolute inset-0 pointer-events-none z-20"
                animate={{ opacity: showControls ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                
                {/* Play button in center when paused and controls visible */}
                {!isPlaying && showControls && (
                  <button
                    onClick={togglePlay}
                    type="button"
                    className="absolute inset-0 flex items-center justify-center pointer-events-auto z-10"
                    aria-label="Воспроизвести видео"
                  >
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-primary-purple ml-1" fill="currentColor" />
                    </div>
                  </button>
                )}

                {/* Bottom controls */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-auto">
                  {/* Video controls (Play/Pause/Stop) - только когда видео играет */}
                  {isPlaying && (
                    <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md rounded-full px-3 py-2">
                      <button
                        onClick={handlePause}
                        type="button"
                        className="w-10 h-10 flex items-center justify-center text-white hover:text-primary-purple transition-colors rounded-full hover:bg-white/20"
                        aria-label="Пауза"
                      >
                        <Pause className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleStop}
                        type="button"
                        className="w-10 h-10 flex items-center justify-center text-white hover:text-primary-purple transition-colors rounded-full hover:bg-white/20"
                        aria-label="Стоп"
                      >
                        <Square className="w-4 h-4" fill="currentColor" />
                      </button>
                      <button
                        onClick={togglePlay}
                        type="button"
                        className="w-10 h-10 flex items-center justify-center text-white hover:text-primary-purple transition-colors rounded-full hover:bg-white/20"
                        aria-label="Воспроизвести"
                      >
                        <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                      </button>
                    </div>
                  )}
                  
                  {/* Volume controls */}
                  <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-full px-4 py-2">
                    <button
                      onClick={toggleMute}
                      className="w-8 h-8 flex items-center justify-center text-white hover:text-primary-purple transition-colors"
                      aria-label={isMuted ? 'Включить звук' : 'Выключить звук'}
                    >
                      <VolumeIcon className="w-5 h-5" />
                    </button>
                    
                    {/* Volume slider */}
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-24 md:w-32 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-primary-purple"
                        style={{
                          background: `linear-gradient(to right, #8B7FD6 0%, #8B7FD6 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 100%)`
                        }}
                      />
                      <span className="text-xs text-white min-w-[2rem] text-right">
                        {Math.round((isMuted ? 0 : volume) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Additional info */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <p className="text-sm text-deep-navy/60 mb-2">
              В этом видео Ева рассказывает о своих возможностях и о том, как она может помочь вам
            </p>
            <p className="text-xs text-deep-navy/50">
              Наведите курсор на видео, чтобы увидеть контролы громкости
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

