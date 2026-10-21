import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
// الملف الشخصي المختار: rakan (الافتراضي) أو template (نموذج العرض)
const profile = process.env.VITE_PROFILE || 'rakan'
const profileDir = path.join(root, 'src/profiles', profile)
const meta = JSON.parse(fs.readFileSync(path.join(profileDir, 'meta.json'), 'utf8'))

// سياسة أمان المحتوى (CSP) تُحقن في نسخة الإنتاج فقط. تعمل على GitHub Pages لأنها عبر وسم meta.
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co",
  'frame-src https://www.youtube.com https://www.youtube-nocookie.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ')

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
const pageMeta = {
  name: 'page-meta',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) => html
      .replaceAll('__TITLE__', esc(meta.title)).replaceAll('__DESCRIPTION__', esc(meta.description))
      .replaceAll('__OGDESC__', esc(meta.ogDescription)).replaceAll('__SITENAME__', esc(meta.siteName))
      .replaceAll('__URL__', esc(meta.url)).replaceAll('__OGIMAGE__', esc(meta.ogImage))
      .replaceAll('__THEME__', esc(meta.themeColor)).replaceAll('__ROBOTS__', esc(meta.robots || 'index, follow')).replaceAll('__JSONLD__', JSON.stringify(meta.jsonld)),
  },
}

const securityMeta = {
  name: 'security-meta',
  apply: 'build',
  transformIndexHtml: () => [
    { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: csp }, injectTo: 'head-prepend' },
    { tag: 'meta', attrs: { name: 'referrer', content: 'strict-origin-when-cross-origin' }, injectTo: 'head-prepend' },
  ],
}

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  publicDir: profile === 'rakan' ? 'public' : `public-${profile}`,
  resolve: { alias: { '@profile': profileDir } },
  plugins: [react(), tailwindcss(), pageMeta, securityMeta],
  server: {
    proxy: { '/api': 'http://localhost:8787', '/uploads': 'http://localhost:8787' },
  },
})
