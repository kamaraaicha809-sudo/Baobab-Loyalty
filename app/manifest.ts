import { MetadataRoute } from 'next'
import config from '@/config'

export default function manifest(): MetadataRoute.Manifest {
  const isEurope = config.region === 'europe';
  const prefix = isEurope ? '/loyavia-pwa-icon' : '/pwa-icon';

  return {
    name: config.appName,
    short_name: config.appName,
    description: config.appDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: config.colors.main,
    icons: [
      { src: `${prefix}-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: `${prefix}-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: `${prefix}-maskable-192.png`, sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: `${prefix}-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
