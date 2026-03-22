import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ToolsGrid from "@/components/ToolsGrid";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import AdBanner from "@/components/AdBanner";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <SEO 
        title="Professional PDF & Image Tools"
        description="Free online PDF and image tools. Merge, split, compress PDFs and convert images with professional-grade quality. Fast, secure, and easy to use."
        keywords="PDF tools, merge PDF, split PDF, compress PDF, PDF to Word, Word to PDF, image converter, PDF converter, online PDF tools"
        canonicalUrl="https://toolscrush.com/"
      />
      <StructuredData type="organization" />
      <StructuredData type="website" />
      <Header />
      <AdBanner variant="banner" />
      <main className="flex-1">
        <Hero />
        <ToolsGrid />
      </main>
      <AdBanner variant="bottom" />
      <Footer />
    </div>
  );
};

export default Index;
