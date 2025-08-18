import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CRO-UX Analysis Tool',
  description: 'Advanced Conversion Rate Optimization and User Experience Analysis Tool with PostHog Integration',
  keywords: ['CRO', 'UX', 'Analytics', 'Conversion', 'User Experience', 'PostHog'],
  authors: [{ name: 'CRO-UX Analysis Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PostHogProvider>
          {children}
          <Toaster />
        </PostHogProvider>
      </body>
    </html>
  )
}
