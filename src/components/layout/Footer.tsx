export default function Footer() {
  return (
    <footer className="bg-surface-container-highest border-t border-outline-variant mt-8">
      <div className="w-full py-8 px-6 max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-headline font-bold text-2xl text-primary">ALURA</span>
          <p className="font-mono text-[10px] text-on-surface-variant text-center md:text-left">
            © 2024 ALURA Institutional Assets. All Rights Reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {['Legal Disclaimer', 'Privacy Policy', 'Terms of Sale', 'Whistleblowing', 'Contact Support'].map(link => (
            <a key={link} href="#" className="font-mono text-[10px] text-on-surface-variant hover:text-primary transition-colors">
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
