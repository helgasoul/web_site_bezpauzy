/**
 * Базовый URL статики из Supabase Storage (или другого CDN).
 * Если задан — все пути вида /file.png превращаются в {base}/file.png.
 * Пример: https://xxx.supabase.co/storage/v1/object/public/public
 */
const ASSETS_BASE = process.env.NEXT_PUBLIC_ASSETS_BASE_URL ?? ''

/**
 * Возвращает полный URL статического файла.
 * - Если задан NEXT_PUBLIC_ASSETS_BASE_URL — подставляет его перед путём.
 * - Иначе возвращает путь как есть (файлы из локальной public/).
 */
export function assetUrl(path: string): string {
  if (!ASSETS_BASE) return path
  const p = path.startsWith('/') ? path.slice(1) : path
  return `${ASSETS_BASE.replace(/\/$/, '')}/${p}`
}
