import type { Metadata, Viewport } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { LanguageProvider } from '@/lib/i18n/context'
import './globals.css'

// Space Grotesk - similar to Lab Grotesque from CAI brand guidelines
const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'CAI Drive - Keeper of the Keys',
    template: '%s | CAI Drive',
  },
  description: 'Premium luxury car rental platform. Experience the finest vehicles with seamless booking and exceptional service.',
  keywords: ['car rental', 'luxury cars', 'premium vehicles', 'Ferrari', 'BMW', 'Bentley', 'Porsche', 'Dubai', 'UAE'],
  authors: [{ name: 'CAI Drive' }],
  creator: 'CAI Drive',
  icons: {
    icon: [
      {
        url: '/logo-black.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logo-white.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/logo-black.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'CAI Drive',
    title: 'CAI Drive - Keeper of the Keys',
    description: 'Premium luxury car rental platform',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#161821' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} font-sans antialiased min-h-screen bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <LanguageProvider>
            {children}
            <Toaster position="top-center" richColors />
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
