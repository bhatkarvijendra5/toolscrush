import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import SEO from "./SEO";
import StructuredData from "./StructuredData";
import AdBanner from "./AdBanner";
import { FAQ, RelatedTool } from "@/data/toolSeoData";

interface HowToStep {
  name: string;
  text: string;
}

interface ToolPageProps {
  title: string;
  description: string;
  children: ReactNode;
  keywords?: string;
  canonicalUrl?: string;
  howToSteps?: HowToStep[];
  faqs?: FAQ[];
  relatedTools?: RelatedTool[];
  contentIntro?: string;
}

const ToolPage = ({ title, description, children, keywords, canonicalUrl, howToSteps, faqs, relatedTools, contentIntro }: ToolPageProps) => {
  const location = useLocation();
  const toolPath = location.pathname;
  
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Tools", url: "/#tools" },
    { name: title, url: toolPath }
  ];

  const faqSchema = faqs && faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return (
    <div className="flex min-h-screen flex-col">
      <SEO 
        title={title}
        description={description}
        keywords={keywords}
        canonicalUrl={canonicalUrl}
      />
      <StructuredData 
        type="breadcrumb"
        breadcrumbs={breadcrumbs}
      />
      <StructuredData 
        type="tool"
        toolName={title}
        toolDescription={description}
      />
      {howToSteps && (
        <StructuredData 
          type="howto"
          toolName={title}
          toolDescription={description}
          howToSteps={howToSteps}
        />
      )}
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <Header />
      <AdBanner variant="banner" />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
            <ol className="flex items-center space-x-2" itemScope itemType="https://schema.org/BreadcrumbList">
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link to="/" className="hover:text-primary" itemProp="item"><span itemProp="name">Home</span></Link>
                <meta itemProp="position" content="1" />
              </li>
              <li aria-hidden="true">/</li>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link to="/#tools" className="hover:text-primary" itemProp="item"><span itemProp="name">Tools</span></Link>
                <meta itemProp="position" content="2" />
              </li>
              <li aria-hidden="true">/</li>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" aria-current="page">
                <span itemProp="name" className="text-foreground font-medium">{title}</span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </nav>

          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tools
            </Button>
          </Link>

          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">{title}</h1>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          {contentIntro && (
            <div className="mx-auto max-w-3xl mb-8">
              <p className="text-muted-foreground leading-relaxed">{contentIntro}</p>
            </div>
          )}

          <div className="mx-auto max-w-4xl">{children}</div>

          <AdBanner variant="mid-content" className="mt-8" />

          {faqs && faqs.length > 0 && (
            <section className="mx-auto max-w-3xl mt-12" aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details key={index} className="group rounded-lg border bg-card p-4">
                    <summary className="cursor-pointer font-medium text-foreground list-none flex items-center justify-between">
                      <h3 className="text-sm md:text-base pr-4">{faq.question}</h3>
                      <span className="text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true">▼</span>
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {relatedTools && relatedTools.length > 0 && (
            <section className="mx-auto max-w-3xl mt-12" aria-labelledby="related-tools-heading">
              <h2 id="related-tools-heading" className="text-2xl font-bold mb-6 text-center">Related Tools</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {relatedTools.map((tool) => (
                  <Link key={tool.href} to={tool.href} className="group rounded-lg border bg-card p-4 hover:border-primary transition-colors">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <AdBanner variant="bottom" />
      <Footer />
    </div>
  );
};

export default ToolPage;
