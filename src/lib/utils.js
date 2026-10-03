export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' }) : ''

export const fmtNum = (n) => Number(n || 0).toLocaleString('ar-IQ')

export function youtubeEmbed(url = '') {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

export function isDirectVideo(url = '') {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url)
}
