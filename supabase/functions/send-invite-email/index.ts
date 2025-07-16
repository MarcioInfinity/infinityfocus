
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteData {
  email: string;
  projectName: string;
  inviterName: string;
  role: string;
  inviteLink: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    console.log('Environment variables check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasResendKey: !!resendApiKey
    });

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      throw new Error('RESEND_API_KEY não configurado. Configure-o nas configurações do Supabase.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, projectName, inviterName, role, inviteLink }: InviteData = await req.json();

    console.log('Sending invite email:', {
      to: email,
      projectName,
      inviterName,
      role,
      inviteLink: inviteLink.substring(0, 50) + '...'
    });

    // Validar dados obrigatórios
    if (!email || !projectName || !inviterName || !role || !inviteLink) {
      throw new Error('Dados obrigatórios faltando para envio do email');
    }

    // Enviar email usando Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TaskSync <onboarding@resend.dev>', // Use o domínio padrão do Resend
        to: [email],
        subject: `🎯 Convite para o projeto "${projectName}"`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Convite para Projeto - TaskSync</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f8fafc;
              }
              .container { 
                max-width: 600px; 
                margin: 20px auto; 
                background: white; 
                border-radius: 12px; 
                overflow: hidden; 
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center; 
              }
              .header h1 { 
                margin: 0; 
                font-size: 28px; 
                font-weight: 600;
              }
              .header p { 
                margin: 10px 0 0 0; 
                opacity: 0.9; 
                font-size: 16px;
              }
              .content { 
                padding: 40px 30px; 
              }
              .content h2 { 
                color: #1a202c; 
                margin-top: 0; 
                font-size: 24px;
              }
              .invite-details { 
                background: #f7fafc; 
                padding: 24px; 
                border-radius: 8px; 
                margin: 24px 0; 
                border-left: 4px solid #667eea;
              }
              .invite-details h3 { 
                margin-top: 0; 
                color: #2d3748; 
                font-size: 18px;
              }
              .detail-row { 
                display: flex; 
                justify-content: space-between; 
                padding: 8px 0; 
                border-bottom: 1px solid #e2e8f0;
              }
              .detail-row:last-child { 
                border-bottom: none; 
              }
              .detail-label { 
                font-weight: 500; 
                color: #4a5568; 
              }
              .role-badge { 
                background: #e3f2fd; 
                color: #1976d2; 
                padding: 4px 12px; 
                border-radius: 20px; 
                font-size: 14px; 
                font-weight: 500;
              }
              .button { 
                display: inline-block; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 16px 32px; 
                text-decoration: none; 
                border-radius: 8px; 
                margin: 24px 0; 
                font-weight: 600; 
                font-size: 16px;
                text-align: center;
              }
              .button:hover { 
                opacity: 0.9; 
              }
              .footer { 
                text-align: center; 
                margin-top: 40px; 
                padding-top: 24px; 
                border-top: 1px solid #e2e8f0; 
                color: #718096; 
                font-size: 14px; 
              }
              .note { 
                background: #fffbeb; 
                border: 1px solid #fbbf24; 
                border-radius: 6px; 
                padding: 16px; 
                margin-top: 24px; 
                color: #92400e; 
                font-size: 14px;
              }
              @media (max-width: 600px) {
                .container { 
                  margin: 10px; 
                  border-radius: 8px; 
                }
                .header, .content { 
                  padding: 24px 20px; 
                }
                .invite-details { 
                  padding: 16px; 
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎯 TaskSync</h1>
                <p>Você foi convidado para colaborar!</p>
              </div>
              
              <div class="content">
                <h2>Olá!</h2>
                <p><strong>${inviterName}</strong> convidou você para participar do projeto <strong>"${projectName}"</strong> no TaskSync.</p>
                
                <div class="invite-details">
                  <h3>📋 Detalhes do Convite</h3>
                  <div class="detail-row">
                    <span class="detail-label">Projeto:</span>
                    <span><strong>${projectName}</strong></span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Convidado por:</span>
                    <span>${inviterName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Sua função:</span>
                    <span class="role-badge">
                      ${role === 'admin' ? '🛡️ Administrador' : 
                        role === 'member' ? '👤 Membro' : 
                        '👁️ Visualizador'}
                    </span>
                  </div>
                </div>

                <p>Para aceitar este convite e começar a colaborar, clique no botão abaixo:</p>
                
                <div style="text-align: center;">
                  <a href="${inviteLink}" class="button">✨ Aceitar Convite</a>
                </div>

                <div class="note">
                  <strong>📌 Importante:</strong> Este convite expira em 7 dias. Se você ainda não possui uma conta no TaskSync, será necessário criar uma antes de aceitar o convite.
                </div>
              </div>
              
              <div class="footer">
                <p>Este é um email automático do TaskSync.</p>
                <p>Se você não esperava receber este convite, pode ignorar este email com segurança.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', {
        status: emailResponse.status,
        statusText: emailResponse.statusText,
        error: errorText
      });
      
      if (emailResponse.status === 401) {
        throw new Error('Chave da API Resend inválida. Verifique a configuração RESEND_API_KEY.');
      } else if (emailResponse.status === 422) {
        throw new Error('Erro de validação no Resend. Verifique se o domínio está configurado corretamente.');
      } else {
        throw new Error(`Erro ao enviar email: ${emailResponse.status} - ${errorText}`);
      }
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResult.id,
        message: 'Email enviado com sucesso!'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in send-invite-email function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        details: error.toString(),
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
