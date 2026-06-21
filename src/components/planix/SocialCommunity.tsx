import React from 'react';

const socialLinks = [
  {
    name: 'Instagram',
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" {...props} fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    href: 'https://www.instagram.com/planix.rd?igsh=dzZ5Njhmd2hoeXBh',
    color: 'text-[#E4405F]',
    bg: 'bg-[#E4405F]/5'
  },
  {
    name: 'TikTok',
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" {...props} fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.59-1.01V14c0 1.02-.15 2.04-.51 3-.36.98-1.01 1.84-1.84 2.47-.83.64-1.85 1.04-2.91 1.17-1.06.13-2.14.01-3.14-.36-1.01-.36-1.92-.99-2.61-1.82-.69-.82-1.14-1.82-1.3-2.87-.16-1.05-.03-2.13.38-3.11.41-.98 1.09-1.83 1.97-2.43.88-.6 1.92-.95 2.99-1.02 1.07-.07 2.14.09 3.12.49v4.29c-.58-.26-1.22-.39-1.86-.39-.64 0-1.28.13-1.86.39-.58.26-1.08.64-1.47 1.13-.39.49-.66 1.06-.78 1.68-.12.62-.07 1.26.13 1.85.2.59.56 1.11 1.04 1.5.48.39 1.06.64 1.68.73.62.09 1.26.03 1.85-.17.59-.2 1.11-.56 1.5-1.04.39-.48.64-1.05.73-1.68.09-.61.02-1.23-.2-1.82V0l.02.02z" />
      </svg>
    ),
    href: 'https://www.tiktok.com/@planix.do?_r=1&_t=ZS-94drckfOrwO',
    color: 'text-black dark:text-white',
    bg: 'bg-black/5 dark:bg-white/10'
  },
  {
    name: 'YouTube',
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" {...props} fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    href: 'https://youtube.com/@planixrd',
    color: 'text-[#FF0000]',
    bg: 'bg-[#FF0000]/5'
  },
  {
    name: 'Facebook',
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" {...props} fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    href: 'https://www.facebook.com/share/1CU3bZhHYv/',
    color: 'text-[#1877F2]',
    bg: 'bg-[#1877F2]/5'
  },
  {
    name: 'WhatsApp',
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" {...props} fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    href: 'https://chat.whatsapp.com/CTxnZvEz6Qr2I2piuSNSDO?mode=gi_t',
    color: 'text-[#25D366]',
    bg: 'bg-[#25D366]/5'
  }
];

export default function SocialCommunity() {
  return (
    <section className="py-24 px-6 bg-white dark:bg-zinc-950 border-t border-slate-100 dark:border-zinc-850 relative z-10">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-neutral-100 tracking-tighter mb-4 font-display">
          Únete a Nuestra Comunidad
        </h2>
        <p className="text-lg md:text-xl text-slate-500 dark:text-neutral-450 font-medium max-w-3xl mx-auto mb-16 leading-relaxed">
          Estamos construyendo una comunidad educativa activa y queremos que formes parte de ella. Encuéntranos en redes sociales para más contenido educativo y recursos.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:shadow-xl hover:border-brand-primary/45 hover:-translate-y-1"
            >
              <div className={`w-16 h-16 rounded-2xl ${social.bg} ${social.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <social.icon className="w-8 h-8" />
              </div>
              <span className="font-black text-slate-900 dark:text-neutral-200 group-hover:text-brand-primary transition-colors">
                {social.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
