import './globals.css';
import { Providers } from './providers';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import localFont from 'next/font/local';

// Regular font
const teodorFont = localFont({
  src: './public/TeodorTRIAL-Thin-BF672198fb9fdb1.otf',
  display: 'swap',
  variable: '--font-teodor',
});

// Italic font
const teodorItalicFont = localFont({
  src: './public/TeodorTRIAL-ThinItalic-BF672198fb9f370.otf',
  display: 'swap',
  variable: '--font-teodor-italic',
});

export const metadata = {
  title: 'frfn - Prediction Markets',
  description: 'Permissionless prediction markets with dynamic liquidity concentration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${teodorFont.className} ${teodorFont.variable} ${teodorItalicFont.variable} bg-gradient-to-b from-[#05051a] to-black text-white min-h-screen flex flex-col`}>
        <Providers>
          <Header />
          <div className="page-content flex-grow flex flex-col min-h-[80vh]">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}