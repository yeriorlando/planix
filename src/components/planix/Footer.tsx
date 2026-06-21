import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, ArrowUpRight } from 'lucide-react';
import PlatformLogo from '../ui/PlatformLogo';

export default function Footer() {
  return (
    <footer className="bg-[#EEF8FC] dark:bg-zinc-950 pt-10 pb-16 px-4 md:px-6 relative z-10">
      <div className="max-w-6xl mx-auto bg-[#58A0E9] border-2 border-neutral-900 rounded-[2.5rem] shadow-[6px_6px_0px_0px_#1B1B1B] p-8 md:p-12 text-neutral-900">
        
        {/* Upper CTA Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-neutral-900 mb-3">
              Planificación y recursos con IA para docentes.
            </h2>
            <p className="text-base font-bold text-neutral-900/80 leading-relaxed">
              Deja que Planix se encargue del papeleo administrativo — para que te concentres en lo que realmente importa: enseñar.
            </p>
          </div>
          
          <Link
            to="/registro"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-neutral-50 border-2 border-neutral-900 rounded-full font-black text-sm uppercase tracking-wider text-neutral-900 shadow-[3px_3px_0px_0px_#1B1B1B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#1B1B1B] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all shrink-0"
          >
            Comenzar Gratis
            <ArrowUpRight size={16} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Logo and Links Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pt-8 border-t-2 border-neutral-900/20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <PlatformLogo className="h-16 md:h-20" />
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 font-black text-sm">
            <a href="#features" className="hover:underline text-neutral-900 transition-colors">
              Módulos
            </a>
            <a href="#planes" className="hover:underline text-neutral-900 transition-colors">
              Planes
            </a>
            <a href="#faq" className="hover:underline text-neutral-900 transition-colors">
              Preguntas
            </a>
            <Link to="/aviso-legal" className="hover:underline text-neutral-900 transition-colors">
              Aviso Legal
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-neutral-900 bg-white hover:bg-neutral-50 text-neutral-900 transition-transform hover:-translate-y-0.5"
            >
              <Twitter size={18} strokeWidth={2.5} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-neutral-900 bg-white hover:bg-neutral-50 text-neutral-900 transition-transform hover:-translate-y-0.5"
            >
              <Instagram size={18} strokeWidth={2.5} />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[2px] bg-neutral-900/10 my-8"></div>

        {/* Bottom copyright row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-neutral-900/70">
          <div>
            Copyright {new Date().getFullYear()} © Planix. Todos los derechos reservados.
          </div>
          <div className="flex gap-6">
            <Link to="/terminos" className="hover:underline">Términos y Condiciones</Link>
            <Link to="/privacidad" className="hover:underline">Privacidad</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
