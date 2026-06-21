import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

// Trigger Vite dev server config reload to clear cache after file deletion

const terminalLoggerPlugin = (resendApiKey: string) => ({
  name: 'terminal-logger',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req.url === '/api/log-terminal' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const timestamp = new Date().toLocaleTimeString();
            const providerStr = data.provider ? `Proveedor: ${data.provider}` : '';
            const modelStr = data.model ? `Modelo: ${data.model}` : '';
            
            let typeStr = '[INFO]';
            let color = '\x1b[37m'; // White
            
            if (data.type === 'REQUEST') {
              typeStr = '[SOLICITUD]';
              color = '\x1b[93m'; // Bright Yellow
            } else if (data.type === 'SUCCESS') {
              typeStr = '[EXITOSO]';
              color = '\x1b[92m'; // Bright Green
            } else if (data.type === 'ERROR') {
              typeStr = '[ERROR]';
              color = '\x1b[91m'; // Bright Red
            }
            
            const messageStr = data.message || '';
            const detailsStr = data.details ? ` - Detalles: ${JSON.stringify(data.details)}` : '';
            
            // Log with colored output in Node console
            console.log(`${color}[IA-LOG] ${timestamp} - ${typeStr} ${providerStr} (${modelStr}) -> ${messageStr}${detailsStr}\x1b[0m`);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          } catch (e) {
            res.writeHead(400);
            res.end('Invalid JSON');
          }
        });
      } else if (req.url === '/api/support/message' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const { type, message, userEmail, userName, attachment } = data;

            const subject = type === 'suggest'
              ? `💡 Nueva sugerencia de función - ${userName}`
              : `🔧 Reporte de error - ${userName}`;

            const attachments = [];
            if (attachment && attachment.content) {
              attachments.push({
                filename: attachment.filename,
                content: attachment.content,
              });
            }

            const SUPPORT_EMAIL = 'soporte@planix.do';
            
            const resendResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'Planix Soporte <soporte@mail.planix.do>',
                to: [SUPPORT_EMAIL],
                replyTo: userEmail,
                subject: subject,
                html: `
                  <div style="font-family: sans-serif; padding: 20px; color: #334155;">
                    <h2 style="color: #1e88e5;">${type === 'suggest' ? 'Nueva Sugerencia' : 'Reporte de Error'}</h2>
                    <p><strong>De:</strong> ${userName} (${userEmail})</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <div style="background: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 16px; line-height: 1.6; text-align: left;">
                      <div style="white-space: pre-wrap;">${message}</div>
                    </div>
                    ${attachment ? `<p style="margin-top: 20px; font-size: 12px; color: #64748b;">📎 Se ha adjuntado una captura de pantalla.</p>` : ''}
                  </div>
                `,
                attachments: attachments,
              }),
            });

            const resendResult = await resendResponse.json() as any;

            if (!resendResponse.ok) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: resendResult.message || 'Error al enviar email a través de Resend' }));
              return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, id: resendResult.id }));
          } catch (e: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message || 'Invalid Request' }));
          }
        });
      } else {
        next();
      }
    });
  }
});

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const resendApiKey = env.RESEND_API_KEY || '';
  return {
    plugins: [react(), tailwindcss(), terminalLoggerPlugin(resendApiKey)],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      watch: {
        ignored: ['**/node_modules/**', '**/.wrangler/**'],
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
