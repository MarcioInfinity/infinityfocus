
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

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY não configurado');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, projectName, inviterName, role, inviteLink }: InviteData = await req.json();

    console.log('Sending invite email to:', email);

    // Enviar email usando Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TaskSync <noreply@tasksync.app>',
        to: [email],
        subject: `Convite para o projeto "${projectName}"`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Convite para Projeto</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .role-badge { background: #e3f2fd; color: #1976d2; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎯 Convite para Projeto</h1>
                <p>Você foi convidado para colaborar!</p>
              </div>
              <div class="content">
                <h2>Olá!</h2>
                <p><strong>${inviterName}</strong> convidou você para participar do projeto <strong>"${projectName}"</strong>.</p>
                
                <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                  <h3>Detalhes do Convite:</h3>
                  <p><strong>Projeto:</strong> ${projectName}</p>
                  <p><strong>Convidado por:</strong> ${inviterName}</p>
                  <p><strong>Sua função:</strong> <span class="role-badge">${role === 'admin' ? '🛡️ Admin' : role === 'member' ? '👤 Membro' : '👁️ Visualizador'}</span></p>
                </div>

                <p>Para aceitar este convite e começar a colaborar, clique no botão abaixo:</p>
                
                <div style="text-align: center;">
                  <a href="${inviteLink}" class="button">Aceitar Convite</a>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  <strong>Nota:</strong> Este convite expira em 7 dias. Se você não possui uma conta, será necessário criar uma antes de aceitar o convite.
                </p>
              </div>
              <div class="footer">
                <p>Este é um email automático do TaskSync. Por favor, não responda a este email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('Resend API error:', errorData);
      throw new Error(`Erro ao enviar email: ${errorData}`);
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
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
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
