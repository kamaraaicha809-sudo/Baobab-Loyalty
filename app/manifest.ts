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
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  }
}
