import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { ClientLayout } from '@/components/ClientLayout';

export const metadata: Metadata = {
  title: 'VoiceCart — Voice-Powered Shopping by Amazon',
  description: 'Shop together with voice. The AI-powered group shopping platform for Amazon quick-commerce.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
