import { useEffect } from 'react';
import LegalPageLayout from '../components/landing/LegalPageLayout';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <h2 className="text-xl font-bold text-slate-900 mb-3">{title}</h2>
    {children}
  </section>
);

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalPageLayout title="Terms & Conditions" lastUpdated="May 31, 2026">
      <Section title="1. Agreement to terms">
        <p>
          By accessing or using ClientScout (the website, web application, and related services), you agree to these Terms
          &amp; Conditions. If you do not agree, do not use the service.
        </p>
      </Section>

      <Section title="2. Description of service">
        <p>
          ClientScout provides tools for lead discovery (including Google Maps-based search), CRM, AI-powered analysis,
          website layout generation, design sharing, and outreach features. Features and availability may change as we
          improve the product.
        </p>
      </Section>

      <Section title="3. Account registration">
        <ul className="list-disc pl-6 space-y-2">
          <li>You must provide accurate registration information and keep your account secure.</li>
          <li>You are responsible for all activity under your account.</li>
          <li>You must be at least 18 years old to use the service.</li>
          <li>One person or legal entity may not maintain multiple free-trial accounts to abuse limits.</li>
        </ul>
      </Section>

      <Section title="4. Credits and payments">
        <p className="mb-3">
          ClientScout uses a credit-based model for certain features (e.g., map searches, AI actions, email sends). By
          purchasing credits or bundles:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You agree to pay the displayed price and applicable taxes where required.</li>
          <li>Credits are consumed per use as described in the product; unused credits may expire according to plan terms shown at purchase.</li>
          <li>Refunds are handled on a case-by-case basis unless otherwise required by law.</li>
          <li>We reserve the right to adjust pricing with notice on the website.</li>
        </ul>
      </Section>

      <Section title="5. Acceptable use">
        <p className="mb-3">You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Use the service for spam, harassment, or illegal outreach.</li>
          <li>Scrape or export data in violation of third-party terms (including Google Maps / Places policies).</li>
          <li>Attempt to reverse engineer, overload, or disrupt the platform.</li>
          <li>Upload malicious code or impersonate others.</li>
          <li>Resell or sublicense the service without written permission.</li>
        </ul>
      </Section>

      <Section title="6. Lead data and outreach">
        <p>
          You are solely responsible for how you use lead data and for complying with applicable laws (including data
          protection, anti-spam, and telemarketing regulations in your jurisdiction). ClientScout provides tools; we do
          not guarantee that any outreach will be lawful or successful for your use case.
        </p>
      </Section>

      <Section title="7. AI-generated content">
        <p>
          AI outputs (analysis, emails, website layouts) are provided for assistance only. You must review all content
          before sending to prospects or publishing. We do not warrant accuracy, uniqueness, or fitness for a particular
          purpose of AI-generated materials.
        </p>
      </Section>

      <Section title="8. Intellectual property">
        <p>
          The ClientScout platform, branding, and software are owned by us or our licensors. You retain rights to content
          you upload. You grant us a limited license to host and process your content solely to operate the service.
        </p>
      </Section>

      <Section title="9. Disclaimer of warranties">
        <p>
          The service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or
          implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee
          uninterrupted or error-free operation.
        </p>
      </Section>

      <Section title="10. Limitation of liability">
        <p>
          To the maximum extent permitted by law, ClientScout and its operators shall not be liable for indirect,
          incidental, special, consequential, or punitive damages, or loss of profits, data, or business opportunities
          arising from your use of the service. Our total liability for any claim shall not exceed the amount you paid us
          in the twelve (12) months before the claim.
        </p>
      </Section>

      <Section title="11. Termination">
        <p>
          We may suspend or terminate your account if you violate these terms or if required for security or legal reasons.
          You may stop using the service at any time. Provisions that by nature should survive termination will remain in
          effect.
        </p>
      </Section>

      <Section title="12. Governing law">
        <p>
          These terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of the
          courts in India, unless otherwise required by mandatory local law.
        </p>
      </Section>

      <Section title="13. Changes to terms">
        <p>
          We may update these Terms &amp; Conditions. Material changes will be indicated by updating the date on this
          page. Continued use after changes constitutes acceptance.
        </p>
      </Section>

      <Section title="14. Contact">
        <p>
          Questions about these terms? Email{' '}
          <a href="mailto:clientscoute@gmail.com" className="text-teal-600 font-medium hover:underline">
            clientscoute@gmail.com
          </a>{' '}
          or visit our{' '}
          <a href="/contact" className="text-teal-600 font-medium hover:underline">
            contact page
          </a>
          .
        </p>
      </Section>
    </LegalPageLayout>
  );
};

export default TermsOfService;
