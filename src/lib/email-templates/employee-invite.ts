interface EmployeeInviteEmailParams {
    employeeName: string
    tenantName: string
    inviteUrl: string
}

export function getEmployeeInviteHtml({ employeeName, tenantName, inviteUrl }: EmployeeInviteEmailParams): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8F9FF;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; background-color: #0D9488; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">
                    T
                </div>
                <span style="font-size: 24px; font-weight: 600; color: #0F172A;">Tratto</span>
            </div>
        </div>

        <!-- Card -->
        <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #E2E8F0;">
            <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: #0F172A; text-align: center;">
                Voce foi convidado!
            </h1>

            <p style="margin: 0 0 24px 0; color: #64748b; text-align: center; font-size: 16px;">
                ${tenantName} quer voce na equipe
            </p>

            <div style="background-color: #F8F9FF; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0; color: #0F172A; font-size: 16px;">
                    Ola <strong>${employeeName}</strong>,
                </p>
                <p style="margin: 16px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                    Voce foi convidado para fazer parte da equipe de profissionais do <strong>${tenantName}</strong> no sistema Tratto.
                </p>
                <p style="margin: 12px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                    Clique no botao abaixo para criar sua conta e comecar a gerenciar sua agenda.
                </p>
            </div>

            <div style="text-align: center; margin-bottom: 24px;">
                <a href="${inviteUrl}" style="display: inline-block; background-color: #0D9488; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 500; font-size: 16px;">
                    Aceitar Convite
                </a>
            </div>

            <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                Se o botao nao funcionar, copie e cole este link no navegador:
            </p>
            <p style="margin: 8px 0 0 0; color: #0D9488; font-size: 12px; text-align: center; word-break: break-all;">
                ${inviteUrl}
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 32px;">
            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                Este convite expira em 7 dias.
            </p>
            <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 12px;">
                Se voce nao esperava este email, pode ignora-lo com seguranca.
            </p>
        </div>
    </div>
</body>
</html>
    `.trim()
}
