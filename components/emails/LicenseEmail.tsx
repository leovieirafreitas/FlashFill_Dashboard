import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';

export interface LicenseEmailProps {
  licenseKey: string;
  downloadUrl: string;
}

export const LicenseEmail = ({ licenseKey, downloadUrl }: LicenseEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Sua Licença do FlashFill chegou!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>⚡ FlashFill</Heading>
          </Section>
          
          <Section style={content}>
            <Heading style={title}>Sua licença está pronta!</Heading>
            <Text style={text}>
              Obrigado por adquirir o FlashFill. Aqui está a sua chave de ativação exclusiva:
            </Text>
            
            <Section style={codeBox}>
              <Text style={codeText}>{licenseKey}</Text>
            </Section>
            
            <Text style={text}>
              Para ativar, basta instalar a extensão e colar a chave acima. Baixe o instalador oficial clicando no botão abaixo:
            </Text>

            <Section style={btnContainer}>
              <Link href={downloadUrl} style={button}>
                Baixar Instalador FlashFill
              </Link>
            </Section>

            <Hr style={hr} />
            <Text style={footer}>
              Se você tiver alguma dúvida, responda a este e-mail.
              <br />
              Equipe FlashFill © 2026
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Estilos do E-mail
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  maxWidth: '600px',
  overflow: 'hidden',
};

const header = {
  backgroundColor: '#7c3aed',
  padding: '32px 20px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  letterSpacing: '-0.5px',
};

const content = {
  padding: '32px 40px',
};

const title = {
  color: '#1a1a2e',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const text = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px',
};

const codeBox = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const codeText = {
  color: '#7c3aed',
  fontSize: '20px',
  fontWeight: 'bold',
  fontFamily: 'monospace',
  margin: '0',
  letterSpacing: '1px',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '32px 0 24px',
};

const footer = {
  color: '#94a3b8',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const btnContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
};

const button = {
  backgroundColor: '#7c3aed',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
};
