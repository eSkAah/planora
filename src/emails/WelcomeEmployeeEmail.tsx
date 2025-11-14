import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface WelcomeEmployeeEmailProps {
  employeeName: string;
  companyName: string;
  magicLink: string;
}

export const WelcomeEmployeeEmail = ({
  employeeName,
  companyName,
  magicLink,
}: WelcomeEmployeeEmailProps) => (
  <Html>
    <Head />
    <Preview>Bienvenue chez {companyName} - Accédez à votre compte Planora</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with gradient */}
        <Section style={header}>
          <div style={logoContainer}>
            <div style={logo}>P</div>
          </div>
        </Section>

        {/* Main content */}
        <Section style={content}>
          <Heading style={h1}>Bienvenue dans votre équipe !</Heading>

          <Text style={greeting}>Bonjour {employeeName},</Text>

          <Text style={text}>
            Nous sommes ravis de vous accueillir chez <strong>{companyName}</strong>. Votre compte
            Planora est maintenant prêt à être utilisé.
          </Text>

          <Text style={text}>
            Pour commencer, cliquez sur le bouton ci-dessous afin d&apos;accéder à votre espace
            personnel en toute sécurité :
          </Text>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Button style={button} href={magicLink}>
              ✨ Accéder à mon espace Planora
            </Button>
          </Section>

          {/* Security notice */}
          <Section style={noticeBox}>
            <Text style={noticeText}>
              🔒 <strong>Lien sécurisé</strong>
              <br />
              Ce lien est valide pendant 24 heures et à usage unique pour votre sécurité.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Text style={footer}>
            Cet email a été envoyé par <strong>{companyName}</strong> via Planora.
          </Text>
          <Text style={footerSmall}>
            Si vous n&apos;avez pas demandé cet accès, veuillez ignorer cet email.
            Aucune action supplémentaire n&apos;est requise.
          </Text>
        </Section>

        {/* Brand footer */}
        <Section style={brandFooter}>
          <Text style={brandText}>Propulsé par Planora</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmployeeEmail;

// Styles - Premium Design
const main = {
  backgroundColor: '#f8fafc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: '40px 20px',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '24px',
  overflow: 'hidden' as const,
  boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)',
};

const header = {
  background: 'linear-gradient(135deg, #071427 0%, #0a1f3d 100%)',
  padding: '48px 40px',
  textAlign: 'center' as const,
};

const logoContainer = {
  display: 'inline-block',
};

const logo = {
  width: '64px',
  height: '64px',
  backgroundColor: '#F2E94E',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '32px',
  fontWeight: '800',
  color: '#071427',
  margin: '0 auto',
  lineHeight: '64px',
  textAlign: 'center' as const,
  boxShadow: '0 8px 24px rgba(242,233,78,0.25)',
};

const content = {
  padding: '48px 40px',
};

const h1 = {
  color: '#071427',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 24px',
  padding: '0',
  lineHeight: '1.3',
  textAlign: 'center' as const,
};

const greeting = {
  color: '#071427',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 24px',
  lineHeight: '1.5',
};

const text = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '1.7',
  margin: '16px 0',
};

const buttonContainer = {
  margin: '40px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#071427',
  borderRadius: '16px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '18px 48px',
  boxShadow: '0 8px 24px rgba(7,20,39,0.15), 0 4px 12px rgba(7,20,39,0.1)',
  transition: 'all 0.3s ease',
};

const noticeBox = {
  backgroundColor: '#f1f5f9',
  borderRadius: '16px',
  padding: '20px 24px',
  margin: '32px 0',
  borderLeft: '4px solid #F2E94E',
};

const noticeText = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '32px 0',
  borderWidth: '1px',
  borderStyle: 'solid',
};

const footer = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '16px 0 8px',
  textAlign: 'center' as const,
};

const footerSmall = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0',
  textAlign: 'center' as const,
};

const brandFooter = {
  backgroundColor: '#f8fafc',
  padding: '24px 40px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e2e8f0',
};

const brandText = {
  color: '#94a3b8',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0',
};
