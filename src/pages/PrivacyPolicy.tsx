import Header from "@/components/Header";
import AdBanner from "@/components/AdBanner";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Privacy Policy", url: "/privacy" }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SEO 
        title="Privacy Policy"
        description="Read ToolsCrush's privacy policy. Learn how we protect your data and ensure your privacy when using our PDF and image tools."
        keywords="privacy policy, data protection, user privacy, ToolsCrush privacy"
        canonicalUrl="https://toolscrush.com/privacy"
      />
      <StructuredData 
        type="breadcrumb"
        breadcrumbs={breadcrumbs}
      />
      <Header />
      <AdBanner variant="banner" />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">
                Privacy Policy
              </h1>
              <p className="text-lg text-muted-foreground">
                Last updated: January 2025
              </p>
            </div>

            <Card className="p-8">
              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    At ToolsCrush, we take your privacy seriously. This Privacy
                    Policy explains how we collect, use, store, and protect your
                    personal information when you use our website and services.
                    By using ToolsCrush, you agree to the practices described in
                    this policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">
                    Information We Collect
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We collect information that you provide directly to us,
                    including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>
                      Account information (name, email address) when you create
                      an account
                    </li>
                    <li>Files and documents you upload to use our tools</li>
                    <li>
                      Communications you send to us (contact forms, emails)
                    </li>
                    <li>
                      Usage data, including IP address, browser type, and device
                      information
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">
                    How We Use Your Information
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process your files and documents</li>
                    <li>Respond to your inquiries and support requests</li>
                    <li>Send you technical notices and updates</li>
                    <li>Analyze usage patterns to enhance user experience</li>
                    <li>Protect against fraud and abuse</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">
                    Cookies and Tracking
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We use cookies and similar tracking technologies to improve
                    your experience on our website. Cookies are small text files
                    stored on your device that help us remember your preferences
                    and understand how you use our services. You can control
                    cookies through your browser settings, but disabling them may
                    affect functionality.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">
                    Third-Party Services
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may use third-party services for analytics, payment
                    processing, and hosting. These services have their own
                    privacy policies and may collect information about you. We
                    carefully select partners who maintain high standards of data
                    protection. We do not sell your personal information to third
                    parties.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Data Storage</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Files you upload for processing are temporarily stored on our
                    servers only for the duration needed to complete the
                    requested operation. We automatically delete processed files
                    within 24 hours. Your account information is stored securely
                    on encrypted servers.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">
                    Data Retention
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We retain your personal information only for as long as
                    necessary to provide our services and comply with legal
                    obligations. Uploaded files are automatically deleted after
                    processing. Account data is retained until you request
                    deletion or close your account.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Access the personal information we hold about you</li>
                    <li>Request correction of inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Object to processing of your information</li>
                    <li>Export your data in a portable format</li>
                    <li>Withdraw consent at any time</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Security</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We implement industry-standard security measures to protect
                    your information, including encryption, secure connections
                    (HTTPS), and regular security audits. However, no method of
                    transmission over the internet is 100% secure, and we cannot
                    guarantee absolute security.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">
                    Children's Privacy
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our services are not intended for children under 13 years of
                    age. We do not knowingly collect personal information from
                    children. If you believe we have collected information from a
                    child, please contact us immediately.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">
                    Changes to This Policy
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may update this Privacy Policy from time to time. We will
                    notify you of significant changes by posting a notice on our
                    website or sending you an email. Your continued use of our
                    services after changes indicates acceptance of the updated
                    policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have questions about this Privacy Policy or how we
                    handle your data, please contact us at:
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    Email: privacy@toolscrush.com
                    <br />
                    Address: 123 Tech Street, San Francisco, CA 94105
                  </p>
                </section>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <AdBanner variant="bottom" />
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
