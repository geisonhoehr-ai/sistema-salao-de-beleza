
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY || 're_123456789'; // Fallback preventing build crash if env is missing
const resend = new Resend(apiKey);

// TODO: Trocar para domínio próprio quando verificado no Resend
const FROM_EMAIL = 'Tratto <onboarding@resend.dev>';

export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
    if (!process.env.RESEND_API_KEY) {
        console.log('⚠️ RESEND_API_KEY não configurada. Email não enviado.');
        console.log('--- EMAIL MOCK ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('--- END EMAIL MOCK ---');
        return { success: true, mock: true };
    }

    try {
        const data = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            html,
        });

        return { success: true, data };
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        return { success: false, error };
    }
}


