import './globals.css'

export const metadata = {
  title: 'HentaiEra Reader - Next.js',
  description: 'Scraper & UI Reader built with Next.js App Router',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
