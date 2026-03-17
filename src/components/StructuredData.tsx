import { Helmet } from "react-helmet-async";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface HowToStep {
  name: string;
  text: string;
}

interface StructuredDataProps {
  type?: "organization" | "website" | "breadcrumb" | "tool" | "howto";
  breadcrumbs?: BreadcrumbItem[];
  toolName?: string;
  toolDescription?: string;
  howToSteps?: HowToStep[];
}

const StructuredData = ({ 
  type = "organization", 
  breadcrumbs,
  toolName,
  toolDescription,
  howToSteps
}: StructuredDataProps) => {
  const baseUrl = "https://toolscrush.com";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ToolsCrush",
    url: baseUrl,
    logo: `${baseUrl}/favicon.ico`,
    description: "Professional PDF and image tools for everyone. Free, fast, and secure document processing online.",
    sameAs: [
      "https://twitter.com/ToolsCrush",
      "https://facebook.com/ToolsCrush",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      url: `${baseUrl}/contact`,
      availableLanguage: ["English"]
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ToolsCrush",
    url: baseUrl,
    description: "Free online PDF and image tools. Merge, split, compress PDFs and convert images with professional-grade quality.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    publisher: {
      "@type": "Organization",
      name: "ToolsCrush",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/favicon.ico`
      }
    }
  };

  const breadcrumbSchema = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.url}`
    }))
  } : null;

  const toolSchema = toolName && toolDescription ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: toolName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: toolDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
      bestRating: "5",
      worstRating: "1"
    }
  } : null;

  const howToSchema = toolName && toolDescription && howToSteps ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to ${toolName}`,
    description: toolDescription,
    step: howToSteps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text
    })),
    totalTime: "PT2M"
  } : null;

  const getSchema = () => {
    switch (type) {
      case "organization":
        return organizationSchema;
      case "website":
        return websiteSchema;
      case "breadcrumb":
        return breadcrumbSchema;
      case "tool":
        return toolSchema;
      case "howto":
        return howToSchema;
      default:
        return organizationSchema;
    }
  };

  const schema = getSchema();

  if (!schema) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default StructuredData;
