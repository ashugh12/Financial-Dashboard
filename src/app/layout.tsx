import './globals.css'

export const metadata = {
  title: 'FinBoard',
  description: 'Customizable Finance Dashboard',
  icons: {
    icon: '/icons/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
