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
    <Preview>Bienvenue chez {companyName} - Accédez à votre compte</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Bienvenue chez {companyName}</Heading>

        <Text style={text}>Bonjour {employeeName},</Text>

        <Text style={text}>
          Votre compte employé a été créé avec succès. Pour accéder à votre espace Planora,
          cliquez simplement sur le bouton ci-dessous :
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={magicLink}>
            Accéder à mon compte
          </Button>
        </Section>

        <Text style={textSmall}>
          Ce lien est valide pendant 24 heures et ne peut être utilisé qu&apos;une seule fois.
        </Text>

        <Hr style={hr} />

        <Text style={footer}>
          Cet email a été envoyé par {companyName} via Planora.
          <br />
          Si vous n&apos;avez pas demandé cet accès, vous pouvez ignorer cet email.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmployeeEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '600px',
};

const h1 = {
  color: '#071427',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0 0 30px',
  padding: '0',
  lineHeight: '1.3',
};

const text = {
  color: '#071427',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const textSmall = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '16px 0',
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#F2E94E',
  borderRadius: '12px',
  color: '#071427',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '30px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '20px 0 0',
};
