import Header from "@/components/Header";
import AdBanner from "@/components/AdBanner";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import { FileText, Zap, Shield, Globe, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AboutUs = () => {
  const values = [
    {
      icon: Zap,
      title: "Fast & Efficient",
      description:
        "Lightning-fast processing speeds to get your work done quickly without compromising quality.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Your files are processed securely and automatically deleted after use. We respect your privacy.",
    },
    {
      icon: Globe,
      title: "Always Accessible",
      description:
        "Access our tools from anywhere, anytime. No software installation required, just your browser.",
    },
    {
      icon: FileText,
      title: "Professional Quality",
      description:
        "Industry-standard tools that deliver professional results for all your document needs.",
    },
  ];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SEO 
        title="About Us"
        description="Learn about ToolsCrush's mission to make document and image management simple and accessible for everyone. Discover our professional PDF and image tools."
        keywords="about ToolsCrush, document management, PDF tools, image tools, online tools"
        canonicalUrl="https://toolscrush.com/about"
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
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">About Us</h1>
              <p className="text-lg text-muted-foreground">
                Making document and image management simple and accessible for
                everyone
              </p>
            </div>

            <div className="space-y-12">
              <Card className="p-8">
                <h2 className="mb-4 text-2xl font-semibold">Our Story</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    ToolsCrush was born from a simple idea: everyone should have
                    access to professional-grade document and image tools without
                    the hassle of expensive software or complicated installations.
                  </p>
                  <p>
                    We noticed that people were struggling with basic tasks like
                    merging PDFs, converting file formats, or resizing images.
                    Existing solutions were either too expensive, too complicated,
                    or compromised on quality. We knew there had to be a better
                    way.
                  </p>
                  <p>
                    Our team of developers and designers came together to create
                    ToolsCrush—a platform that combines ease of use with powerful
                    functionality. We've built tools that work directly in your
                    browser, keeping your data secure and your workflow smooth.
                  </p>
                </div>
              </Card>

              <Card className="p-8">
                <h2 className="mb-4 text-2xl font-semibold">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our mission is to empower individuals and businesses with free,
                  fast, and secure tools that simplify document and image
                  management. We believe that powerful tools shouldn't be locked
                  behind paywalls or complicated interfaces. Whether you're a
                  student working on an assignment, a professional preparing
                  documents for a client, or anyone in between, ToolsCrush is here
                  to make your life easier.
                </p>
              </Card>

              <div>
                <h2 className="mb-8 text-center text-2xl font-semibold">
                  What Makes Us Unique
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {values.map((value, index) => (
                    <Card key={index} className="p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                        <value.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold">
                        {value.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {value.description}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>

              <Card className="p-8">
                <h2 className="mb-4 text-2xl font-semibold">Our Tools</h2>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  ToolsCrush offers a comprehensive suite of PDF and image tools
                  designed to handle your everyday document needs:
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 font-semibold">PDF Tools</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Merge multiple PDFs into one</li>
                      <li>• Split PDFs into separate files</li>
                      <li>• Compress PDFs to reduce file size</li>
                      <li>• Convert PDFs to Word, Excel, PowerPoint, and images</li>
                      <li>• Add watermarks and page numbers</li>
                      <li>• Protect PDFs with passwords</li>
                      <li>• Sign PDFs electronically</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">Image Tools</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Convert images between formats</li>
                      <li>• Resize images with precision</li>
                      <li>• Convert JPG to PDF</li>
                      <li>• Convert PDF to JPG</li>
                      <li>• Maintain image quality</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <h2 className="mb-4 text-2xl font-semibold">
                  How We Help You
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">For Students:</strong>{" "}
                    Combine research papers, convert lecture notes, and prepare
                    assignments without worrying about file format issues.
                  </p>
                  <p>
                    <strong className="text-foreground">
                      For Professionals:
                    </strong>{" "}
                    Create polished documents, secure sensitive files, and
                    convert formats to match client requirements—all in seconds.
                  </p>
                  <p>
                    <strong className="text-foreground">For Everyone:</strong>{" "}
                    Save time on tedious document tasks and focus on what really
                    matters. No learning curve, no installation, no hassle.
                  </p>
                </div>
              </Card>

              <Card className="p-8 text-center">
                <h2 className="mb-4 text-2xl font-semibold">Get in Touch</h2>
                <p className="mb-6 text-muted-foreground">
                  We're always here to help. If you have questions, feedback, or
                  just want to say hello, don't hesitate to reach out.
                </p>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Contact Us
                </a>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <AdBanner variant="bottom" />
      <Footer />
    </div>
  );
};

export default AboutUs;
