import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"
import { getEmployeeInviteHtml } from "@/lib/email-templates/employee-invite"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { employeeEmail, employeeName, tenantName, tenantSlug, inviteToken } = body

        if (!employeeEmail || !employeeName || !tenantName || !tenantSlug || !inviteToken) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://tratto.app'}/${tenantSlug}/invite/${inviteToken}`

        const html = getEmployeeInviteHtml({
            employeeName,
            tenantName,
            inviteUrl,
        })

        const result = await sendEmail({
            to: employeeEmail,
            subject: `Voce foi convidado para fazer parte da equipe ${tenantName}`,
            html,
        })

        if (!result.success) {
            console.error("Email invite error:", result.error)
            return NextResponse.json(
                { error: "Failed to send email", details: result.error },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, data: result.data })
    } catch (err) {
        console.error("Email invite error:", err)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
