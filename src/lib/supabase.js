import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isLocal = import.meta.env.VITE_BACKEND === 'local'
export const isConfigured = Boolean(url && key)
export const supabase = isConfigured ? createClient(url, key) : null
// وضع الاستضافة الثابتة (GitHub Pages): لا قاعدة بيانات، المحتوى من src/lib/demo.js والطلبات تُرسل برسالة
export const isStatic = !isConfigured && !isLocal
