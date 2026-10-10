import { useEffect } from 'react';
import LegalPageLayout from '../components/landing/LegalPageLayout';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <h2 className="text-xl font-bold text-slate-900 mb-3">{title}</h2>
    {children}
  </section>
);

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="May 31, 2026">
      <Section title="1. Introduction">
        <p>
          ClientScout (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the website at clientscout.xyz and the
          application at app.clientscout.xyz. This Privacy Policy explains how we collect, use, store, and protect your
          information when you use our services.
        </p>
      </Section>

      <Section title="2. Information we collect">
        <p className="mb-3">We may collect the following types of information:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-slate-800">Account data:</strong> name, email address, password (stored securely), and
            profile preferences.
          </li>
          <li>
            <strong className="text-slate-800">Usage data:</strong> pages visited, features used, credit consumption, and
            interaction logs within the platform.
          </li>
          <li>
            <strong className="text-slate-800">Lead & business data:</strong> information you import or create (business
            names, addresses, phone numbers, websites, notes, CRM stages, outreach history).
          </li>
          <li>
            <strong className="text-slate-800">Payment data:</strong> transaction references and billing details processed
            through our payment partners (we do not store full card or UPI credentials on our servers).
          </li>
          <li>
            <strong className="text-slate-800">Technical data:</strong> IP address, browser type, device information, and
            cookies required for authentication and security.
          </li>
        </ul>
      </Section>

      <Section title="3. How we use your information">
        <ul className="list-disc pl-6 space-y-2">
          <li>To provide and maintain ClientScout (lead discovery, CRM, AI analysis, website generation, outreach).</li>
          <li>To process payments and manage credit balances.</li>
          <li>To improve our product, fix bugs, and develop new features.</li>
          <li>To send service-related communications (account, security, billing).</li>
          <li>To comply with legal obligations and prevent fraud or abuse.</li>
        </ul>
      </Section>

      <Section title="4. AI and third-party services">
        <p>
          Certain features use third-party services (for example, AI providers, email delivery, maps data, and payment
          gateways). Data sent to these providers is limited to what is necessary to perform the requested feature. We
          select providers that maintain appropriate security practices, but their handling of data is also governed by
          their own privacy policies.
        </p>
      </Section>

      <Section title="5. Data retention">
        <p>
          We retain your account and lead data for as long as your account is active or as needed to provide services. You
          may request deletion of your account by contacting us. Some data may be retained longer where required by law or
          for legitimate business purposes (e.g., payment records).
        </p>
      </Section>

      <Section title="6. Data security">
        <p>
          We implement reasonable technical and organizational measures to protect your data, including encryption in
          transit, access controls, and secure authentication. No method of transmission over the Internet is 100% secure;
          we cannot guarantee absolute security.
        </p>
      </Section>

      <Section title="7. Your rights">
        <p className="mb-3">Depending on your location, you may have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access, correct, or delete your personal data.</li>
          <li>Object to or restrict certain processing.</li>
          <li>Withdraw consent where processing is consent-based.</li>
          <li>Lodge a complaint with a data protection authority.</li>
        </ul>
        <p className="mt-3">
          To exercise these rights, contact us at{' '}
          <a href="mailto:clientscoute@gmail.com" className="text-teal-600 font-medium hover:underline">
            clientscoute@gmail.com
          </a>
          .
        </p>
      </Section>

      <Section title="8. Cookies">
        <p>
          We use essential cookies and similar technologies for login sessions, security, and core functionality. We do not
          use cookies for third-party advertising on the marketing site without your consent.
        </p>
      </Section>

      <Section title="9. Children">
        <p>
          ClientScout is not intended for users under 18. We do not knowingly collect personal data from children.
        </p>
      </Section>

      <Section title="10. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. We will post the revised version on this page with an
          updated &quot;Last updated&quot; date. Continued use of the service after changes constitutes acceptance of the
          updated policy.
        </p>
      </Section>

      <Section title="11. Contact us">
        <p>
          For privacy-related questions or requests, email{' '}
          <a href="mailto:clientscoute@gmail.com" className="text-teal-600 font-medium hover:underline">
            clientscoute@gmail.com
          </a>{' '}
          or use our{' '}
          <a href="/contact" className="text-teal-600 font-medium hover:underline">
            contact page
          </a>
          .
        </p>
      </Section>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
