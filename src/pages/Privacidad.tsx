import React from 'react';
import PublicPageLayout from '../components/layout/PublicPageLayout';
import { 
  Eye, 
  Database, 
  CheckSquare, 
  Sparkles, 
  ShieldCheck, 
  Fingerprint, 
  Mail 
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <PublicPageLayout
      title="Política de Privacidad"
      subtitle="Tu confianza es nuestra prioridad. Transparencia total sobre tus datos."
    >
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="space-y-8">
          
          {/* Last Update Date */}
          <div className="text-center md:text-left mb-6">
            <span className="inline-block bg-brand-light dark:bg-brand-light/10 text-brand-primary dark:text-blue-400 text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider">
              Última actualización: 2 de Febrero, 2026
            </span>
          </div>

          {/* 1. Introducción */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <Eye size={28} className="fill-blue-500/20 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3">1. Introducción</h3>
              <p className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed">
                En <strong>Planix</strong>, nos tomamos muy en serio la privacidad de nuestros usuarios. Esta política describe qué información recopilamos, cómo la utilizamos y cómo la protegemos. Al utilizar nuestra plataforma, aceptas las prácticas descritas aquí.
              </p>
            </div>
          </div>

          {/* 2. ¿Qué datos recopilamos? */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Database size={28} className="fill-emerald-500/20 text-emerald-600 dark:text-emerald-450" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3">2. ¿Qué datos recopilamos?</h3>
              <div className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed">
                <p className="mb-3">Para brindarte nuestro servicio de planificación, necesitamos recopilar cierta información:</p>
                <ul className="list-disc pl-5 space-y-2 font-medium">
                  <li><strong>Información de Registro:</strong> Nombre completo, correo electrónico, centro educativo, distrito y regional.</li>
                  <li><strong>Perfil Pedagógico:</strong> Grados que impartes, asignaturas y preferencias de enseñanza.</li>
                  <li><strong>Contenido Generado:</strong> Las planificaciones, unidades y evaluaciones que creas o guardas en la plataforma.</li>
                  <li><strong>Datos Técnicos:</strong> Dirección IP, tipo de navegador y datos de uso para mejorar la experiencia (cookies esenciales).</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 3. Uso de tus datos */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <CheckSquare size={28} className="fill-amber-500/20 text-amber-600 dark:text-amber-455" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3">3. Uso de tus datos</h3>
              <div className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed space-y-3">
                <p>Utilizamos tu información exclusivamente para:</p>
                <ul className="list-disc pl-5 space-y-2 font-medium">
                  <li>Proporcionarte acceso a tu cuenta y tus documentos guardados.</li>
                  <li>Generar contenido personalizado mediante nuestros algoritmos de IA.</li>
                  <li>Mejorar la precisión y relevancia de nuestras sugerencias pedagógicas.</li>
                  <li>Comunicarnos contigo sobre actualizaciones, soporte técnico o noticias del servicio.</li>
                </ul>
                <div className="mt-4 p-4 bg-brand-secondary-light/40 dark:bg-brand-secondary-light/5 rounded-2xl border border-brand-secondary/15 max-w-full overflow-hidden">
                  <p className="text-zinc-700 dark:text-emerald-400 font-bold text-xs lg:text-[13px] lg:whitespace-nowrap">
                    <span className="text-[#02b36d]">Importante:</span> Nunca vendemos tus datos personales a terceros ni los utilizamos para fines publicitarios externos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Uso de Inteligencia Artificial */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
              <Sparkles size={28} className="fill-purple-500/20 text-purple-650 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3">4. Uso de Inteligencia Artificial</h3>
              <div className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed space-y-3">
                <p>
                  <strong>Planix</strong> utiliza modelos de Inteligencia Artificial (IA) para ayudarte a redactar contenido. Al usar nuestras funciones de generación automática:
                </p>
                <ul className="list-disc pl-5 space-y-2 font-medium">
                  <li>Los textos que introduces (ej. "tema de la clase") se envían a nuestros proveedores de IA para generar la respuesta.</li>
                  <li>No enviamos tu información personal identificable (nombre, email) a estos modelos, solo el contexto pedagógico necesario.</li>
                  <li>Nuestros proveedores de IA no utilizan tus datos para entrenar sus modelos públicos.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 5. Almacenamiento y Seguridad */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck size={28} className="fill-indigo-500/20 text-indigo-650 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3">5. Almacenamiento y Seguridad</h3>
              <div className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed space-y-3">
                <p>
                  Tus datos se almacenan de forma segura en la nube utilizando <strong>Supabase</strong>, un proveedor de infraestructura de clase mundial que cumple con estándares de seguridad internacionales.
                </p>
                <p>
                  Implementamos encriptación SSL/TLS en tránsito y medidas de seguridad robustas para proteger tu información contra accesos no autorizados.
                </p>
              </div>
            </div>
          </div>

          {/* 6. Tus Derechos */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
              <Fingerprint size={28} className="fill-cyan-500/20 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3">6. Tus Derechos</h3>
              <div className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed">
                <p className="mb-3">Como usuario, tienes derecho a:</p>
                <ul className="list-disc pl-5 space-y-2 font-medium">
                  <li><strong>Acceder:</strong> Ver qué datos tenemos sobre ti.</li>
                  <li><strong>Corregir:</strong> Actualizar tu información personal en tu perfil.</li>
                  <li><strong>Eliminar:</strong> Solicitar la eliminación completa de tu cuenta y todos tus datos asociados.</li>
                  <li><strong>Exportar:</strong> Descargar tus planificaciones en formatos estándar (PDF).</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 7. Contacto Legal */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
              <Mail size={28} className="fill-rose-500/20 text-rose-600 dark:text-rose-455" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3">7. Contacto Legal</h3>
              <p className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed">
                Si tienes preguntas sobre esta política o deseas ejercer tus derechos, contáctanos en: <a href="mailto:legal@planix.do" className="text-brand-primary dark:text-blue-400 font-extrabold hover:underline">legal@planix.do</a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </PublicPageLayout>
  );
}
