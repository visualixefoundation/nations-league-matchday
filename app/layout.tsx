import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display"
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body"
});

const siteUrl = "https://nations-league-matchday.vercel.app";
const title = "Matchday — UEFA Nations League";
const description =
  "Live scores, fixtures, results and standings for the UEFA Nations League. Updated on match nights.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · Nations League Matchday"
  },
  description,
  applicationName: "Nations League Matchday",
  authors: [{ name: "Visualixe Foundation" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteUrl,
    siteName: "Nations League Matchday",
    title,
    description,
  },
  twitter: {
    card: "summary",
    title,
    description
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${oswald.variable} ${inter.variable}`}>
        <header className="site-header">
          <div className="wrap site-header__inner">
            <a href="/" className="wordmark">
              Matchday <span className="wordmark__sub">Nations League</span>
            </a>
            <nav className="site-nav">
              <a href="/">Fixtures &amp; Scores</a>
              <a href="/standings">Standings</a>
              <a href="/results">Results</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="wrap site-footer__inner">
            <p className="site-footer__copy">
              © {new Date().getFullYear()}{" "}
              <a
                href="https://visualixe-foundation.vercel.app/"
                className="site-footer__link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visualixe Foundation
              </a>
              . All rights reserved.
            </p>
            <p className="site-footer__tagline">Built with purpose</p>
            <p className="site-footer__credit">
              Scores via Highlightly. Not affiliated with UEFA.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
