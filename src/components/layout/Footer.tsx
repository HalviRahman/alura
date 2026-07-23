import logoImg from "../../assets/logo.png";
import arebiLogo from "../../assets/arebi-logo.png";

export default function Footer() {
  return (
    <footer className="bg-surface-container-highest border-t border-outline-variant mt-8">
      <div className="w-full py-8 px-6 max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              className="h-14 w-auto object-contain"
              alt="ALURA Logo"
            />
            <span className="w-px h-6 bg-outline-variant" />
            <div className="flex flex-col items-center">
              <span className="font-mono text-[6px] font-bold text-black uppercase tracking-widest leading-none mb-0.5">
                Member of
              </span>
              <img
                src={arebiLogo}
                className="h-10 w-auto object-contain"
                alt="AREBI Logo"
                title="Anggota AREBI — Asosiasi Real Estate Broker Indonesia"
              />
            </div>
          </div>
          <p className="font-mono text-[10px] text-on-surface-variant text-center md:text-left">
            © 2024 ALURA Institutional Assets. All Rights Reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {[
            "Legal Disclaimer",
            "Privacy Policy",
            "Terms of Sale",
            "Whistleblowing",
            "Contact Support",
          ].map((link) => (
            <a
              key={link}
              href="#"
              className="font-mono text-[10px] text-on-surface-variant hover:text-primary transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
