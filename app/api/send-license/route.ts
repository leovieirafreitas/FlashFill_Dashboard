import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { LicenseEmail } from '@/components/emails/LicenseEmail';
import * as React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, licenseKey } = await req.json();

    if (!email || !licenseKey) {
      return NextResponse.json({ error: 'Email e chave são obrigatórios' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY não configurada no servidor.' }, { status: 500 });
    }

    const html = await render(React.createElement(LicenseEmail, { licenseKey }));

    const { data, error } = await resend.emails.send({
      from: 'FlashFill <onboarding@resend.dev>', // Usar o email de onboarding para contas novas
      to: [email],
      subject: '⚡ Sua chave de ativação do FlashFill',
      html: html,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
