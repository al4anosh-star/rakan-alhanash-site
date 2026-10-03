import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import { Loader } from './components/ui'
import Home from './pages/Home'

const Biography = lazy(() => import('./pages/Biography'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Achievements = lazy(() => import('./pages/Achievements'))
const Requests = lazy(() => import('./pages/Requests'))
const Completed = lazy(() => import('./pages/Completed'))
const Contact = lazy(() => import('./pages/Contact'))
const News = lazy(() => import('./pages/News').then((m) => ({ default: m.News })))
const NewsDetail = lazy(() => import('./pages/News').then((m) => ({ default: m.NewsDetail })))
const AdminLogin = lazy(() => import('./admin/Admin').then((m) => ({ default: m.AdminLogin })))
const AdminLayout = lazy(() => import('./admin/Admin').then((m) => ({ default: m.AdminLayout })))
const M = (name) => lazy(() => import('./admin/Managers').then((m) => ({ default: m[name] })))
const RequestsManager = M('RequestsManager'), NewsManager = M('NewsManager'), GalleryManager = M('GalleryManager'),
  AchievementsManager = M('AchievementsManager'), CompletedManager = M('CompletedManager'), ReportsManager = M('ReportsManager'), TimelineManager = M('TimelineManager'), SettingsManager = M('SettingsManager')

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="biography" element={<Biography />} />
          <Route path="news" element={<News />} />
          <Route path="news/:id" element={<NewsDetail />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="requests" element={<Requests />} />
          <Route path="completed" element={<Completed />} />
          <Route path="contact" element={<Contact />} />
        </Route>
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="requests" replace />} />
          <Route path="requests" element={<RequestsManager />} />
          <Route path="news" element={<NewsManager />} />
          <Route path="reports" element={<ReportsManager />} />
          <Route path="completed" element={<CompletedManager />} />
          <Route path="gallery" element={<GalleryManager />} />
          <Route path="achievements" element={<AchievementsManager />} />
          <Route path="timeline" element={<TimelineManager />} />
          <Route path="settings" element={<SettingsManager />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
