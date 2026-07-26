import React from 'react';
import PublicPageLayout from '../components/layout/PublicPageLayout';
import { 
  Shield, 
  Settings, 
  UserCheck, 
  Copyright, 
  AlertTriangle, 
  UserX, 
  Landmark, 
  CreditCard 
} from 'lucide-react';

export default function TermsConditionsPage() {
  return (
    <PublicPageLayout
      title="Términos y Condiciones"
      subtitle="Reglas claras para una relación transparente."
    >
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="space-y-8">
          
          {/* 1. Aceptación */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <Shield size={28} className="fill-blue-500/20 text-blue-650 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3">1. Aceptación de los Términos</h3>
              <p className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed">
                Al registrarte y utilizar <strong>Planix</strong>, aceptas cumplir con estos Términos y Condiciones de Uso. Si no estás de acuerdo con alguna parte de estos términos, te recomendamos no utilizar la plataforma.
              </p>
            </div>
          </div>

          {/* 2. Descripción */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-[#02b36d]/10 flex items-center justify-center shrink-0">
              <Settings size={28} className="fill-[#02b36d]/20 text-[#02b36d] dark:text-emerald-450" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3">2. Descripción del Servicio</h3>
              <div className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed space-y-3">
                <p>
                  <strong>Planix</strong> es una herramienta digital de asistencia para la planificación docente. Ofrecemos herramientas para crear, editar, organizar y exportar planes de clase basados en el currículo dominicano.
                </p>
                <p>
                  Nos reservamos el derecho de modificar, suspender o discontinuar cualquier parte del servicio en cualquier momento, aunque siempre intentaremos notificarte con antelación sobre cambios significativos.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Responsabilidades */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <UserCheck size={28} className="fill-amber-500/20 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3">3. Responsabilidades del Usuario</h3>
              <div className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed">
                <p className="mb-3">Al usar <strong>Planix</strong>, te comprometes a:</p>
                <ul className="list-disc pl-5 space-y-2 font-medium">
                  <li>Proporcionar información veraz y actualizada durante el registro.</li>
                  <li>Mantener la confidencialidad de tu contraseña y cuenta.</li>
                  <li>No utilizar la plataforma para fines ilegales o no autorizados.</li>
                  <li>No intentar vulnerar la seguridad del sitio ni realizar ingeniería inversa.</li>
                  <li>
                    <span className="text-[#02b36d] font-bold">Revisar el contenido generado:</span> Eres el responsable final de verificar que las planificaciones generadas sean pedagógicamente adecuadas para tus estudiantes antes de aplicarlas.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 4. Propiedad Intelectual */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
              <Copyright size={28} className="fill-indigo-500/20 text-indigo-650 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3">4. Propiedad Intelectual</h3>
              <div className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed space-y-3">
                <p>
                  <strong>Tu Contenido:</strong> Tú conservas los derechos sobre la información específica y los datos que introduces en la plataforma.
                </p>
                <p>
                  <strong>La Plataforma:</strong> El diseño, código fuente, logotipos y algoritmos de <strong>Planix</strong> son propiedad exclusiva de nuestra empresa.
                </p>
                <p>
                  <strong>Planificaciones Generadas:</strong> Se te otorga una licencia perpetua y libre de regalías para utilizar, modificar y compartir las planificaciones que generes para tus fines profesionales y educativos.
                </p>
              </div>
            </div>
          </div>

          {/* 5. Responsabilidad */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle size={28} className="fill-rose-500/20 text-rose-600 dark:text-rose-450" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3">5. Limitación de Responsabilidad</h3>
              <div className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed space-y-3">
                <p>
                  <strong>Planix</strong> se proporciona "tal cual". No garantizamos que el servicio sea ininterrumpido o libre de errores.
                </p>
                <p>
                  En ningún caso <strong>Planix</strong> será responsable por daños indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso del servicio, incluyendo pero no limitado a fallos en la planificación escolar o inconsistencias curriculares que no hayan sido revisadas por el docente.
                </p>
              </div>
            </div>
          </div>

          {/* 6. Suspensión */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
              <UserX size={28} className="fill-red-500/20 text-red-655 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3">6. Suspensión de Cuentas</h3>
              <p className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed">
                Podemos suspender o cerrar tu cuenta si determinamos que has violado estos términos, especialmente en casos de uso indebido de los recursos del sistema o comportamiento abusivo.
              </p>
            </div>
          </div>

          {/* 7. Ley */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
              <Landmark size={28} className="fill-cyan-500/20 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3">7. Ley Aplicable</h3>
              <p className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed">
                Estos términos se rigen por las leyes de la República Dominicana. Cualquier disputa será resuelta en los tribunales competentes de esta jurisdicción.
              </p>
            </div>
          </div>

          {/* 8. Suscripciones */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
              <CreditCard size={28} className="fill-purple-500/20 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3">8. Suscripciones, Pagos y Reembolsos</h3>
              <div className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed space-y-3">
                <p>
                  <strong>Planix</strong> ofrece planes de suscripción premium para acceder a herramientas avanzadas. Al contratar un plan, aceptas las siguientes condiciones:
                </p>
                <ul className="list-disc pl-5 space-y-2 font-medium">
                  <li>
                    <strong>Renovación Mensual:</strong> Las suscripciones realizadas mediante tarjeta de crédito o débito se renuevan automáticamente cada mes. Puedes cancelar la renovación en cualquier momento desde la configuración de tu perfil.
                  </li>
                  <li>
                    <strong>Pagos Seguros:</strong> Utilizamos Polar.sh y Stripe como procesadores de pago para garantizar la máxima seguridad. No almacenamos datos sensibles de tarjetas en nuestros sistemas.
                  </li>
                  <li>
                    <strong>Política de Reembolso:</strong> Ofrecemos una garantía de satisfacción de 7 días calendario desde la primera compra. Si solicitas el reembolso dentro de este periodo, se te devolverá el monto total, perdiendo el acceso a las funciones premium.
                  </li>
                  <li>
                    <strong>Cancelaciones:</strong> Puedes cancelar tu suscripción en cualquier momento. Seguirás teniendo acceso a las funciones premium hasta el final del periodo de facturación actual.
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PublicPageLayout>
  );
}
