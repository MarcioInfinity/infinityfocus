
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  email: string;
  projectName: string;
  inviterName: string;
  role: string;
  inviteLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, projectName, inviterName, role, inviteLink }: InviteEmailRequest = await req.json();

    console.log('Sending invite email:', { email, projectName, inviterName, role });

    // Aqui você pode usar o Supabase Edge Functions com Resend ou outro provedor de email
    // Por enquanto, vamos apenas retornar sucesso para simular o envio
    
    const roleLabel = role === 'admin' ? 'Administrador' : 
                     role === 'member' ? 'Membro' : 'Visualizador';

    const emailContent = {
      from: "Infinity Focus <noreply@infinityfocus.app>",
      to: [email],
      subject: `Convite para o projeto ${projectName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Infinity Focus</h1>
            <p style="color: #e2e8f0; margin: 10px 0 0 0;">Convite para Projeto</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1a202c; margin-bottom: 20px;">Olá!</h2>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              <strong>${inviterName}</strong> convidou você para participar do projeto 
              <strong style="color: #667eea;">${projectName}</strong> como <strong>${roleLabel}</strong>.
            </p>
            
            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">${projectName}</h3>
              <p style="color: #4a5568; margin: 0; font-size: 14px;">
                Função: ${roleLabel}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                Aceitar Convite
              </a>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
              <p style="color: #718096; font-size: 14px; margin: 0;">
                Se você não conseguir clicar no botão, copie e cole este link no seu navegador:
              </p>
              <p style="color: #667eea; font-size: 14px; word-break: break-all; margin: 10px 0;">
                ${inviteLink}
              </p>
              <p style="color: #a0aec0; font-size: 12px; margin: 20px 0 0 0;">
                Este convite expira em 7 dias. Se você não deseja mais receber estes emails, 
                pode ignorar esta mensagem.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #a0aec0; font-size: 12px; margin: 0;">
              © 2024 Infinity Focus. Gerencie seus projetos com foco infinito.
            </p>
          </div>
        </div>
      `,
    };

    console.log('Email content prepared:', emailContent);

    // Simular envio bem-sucedido
    // Em produção, você integraria com um provedor real de email como Resend
    const mockResponse = {
      id: `mock-${Date.now()}`,
      to: [email],
      subject: emailContent.subject,
      from: emailContent.from,
      status: 'sent'
    };

    console.log('Email sent successfully (simulated):', mockResponse);

    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invite-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
