import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

const SEO = ({
  title,
  description,
  keywords = "PDF tools, image tools, online PDF converter, merge PDF, split PDF, compress PDF, PDF to Word, Word to PDF, image converter, document tools, free PDF tools, ToolsCrush",
  canonicalUrl,
  ogImage = "https://lovable.dev/opengraph-image-p98pqg.png",
  ogType = "website",
  noindex = false,
}: SEOProps) => {
  const fullTitle = title.includes("ToolsCrush") ? title : `${title} - Free Online Tool | ToolsCrush`;
  const url = canonicalUrl || window.location.href;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Robots */}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow"} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="ToolsCrush" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@ToolsCrush" />

      {/* Additional SEO */}
      <meta name="language" content="English" />
      <meta name="revisit-after" content="3 days" />
      <meta name="author" content="ToolHub" />
      <meta httpEquiv="content-language" content="en" />
    </Helmet>
  );
};

export default SEO;
