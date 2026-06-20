import Header from '@/components/storefront/Header'
import { LanguageProvider } from '@/lib/i18n'

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 max-w-lg mx-auto w-full pb-10">
          {children}
        </main>
        <footer className="border-t border-gray-100 py-6">
          <p className="text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Folon Marketplace
          </p>
        </footer>

      </div>
    </LanguageProvider>
  )
}
