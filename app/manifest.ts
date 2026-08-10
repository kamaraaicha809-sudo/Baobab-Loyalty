import { MetadataRoute } from 'next'
import config from '@/config'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: config.appName,
    short_name: config.appName,
    description: config.appDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: config.colors.main,
    icons: [
      { src: '/pwa-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
