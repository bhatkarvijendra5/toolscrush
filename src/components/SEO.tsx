import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  articleMeta?: {
    publishedTime: string;
    modifiedTime?: string;
    author: string;
    section?: string;
  };
}

const SEO = ({
  title,
  description,
  keywords = "PDF tools, image tools, online PDF converter, merge PDF, split PDF, compress PDF, PDF to Word, Word to PDF, image converter, document tools, free PDF tools, ToolsCrush",
  canonicalUrl,
  ogImage = "https://toolscrush.com/og-image.png",
  ogType = "website",
  noindex = false,
  articleMeta,
}: SEOProps) => {
  const fullTitle = title.includes("ToolsCrush") ? title : `${title} - Free Online Tool | ToolsCrush`;
  const url = canonicalUrl || window.location.href;
  const truncatedDesc = description.length > 160 ? description.slice(0, 157) + "..." : description;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={truncatedDesc} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Robots */}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow"} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={articleMeta ? "article" : ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={truncatedDesc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content="ToolsCrush" />
      <meta property="og:locale" content="en_US" />

      {/* Article-specific OG */}
      {articleMeta && (
        <>
          <meta property="article:published_time" content={articleMeta.publishedTime} />
          {articleMeta.modifiedTime && <meta property="article:modified_time" content={articleMeta.modifiedTime} />}
          <meta property="article:author" content={articleMeta.author} />
          {articleMeta.section && <meta property="article:section" content={articleMeta.section} />}
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={truncatedDesc} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={fullTitle} />
      <meta name="twitter:site" content="@ToolsCrush" />

      {/* Additional SEO */}
      <meta name="language" content="English" />
      <meta name="revisit-after" content="3 days" />
      <meta name="author" content="ToolsCrush" />
      <meta httpEquiv="content-language" content="en" />
    </Helmet>
  );
};

export default SEO;
