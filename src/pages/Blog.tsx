import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, User } from "lucide-react";
import { Link } from "react-router-dom";

const blogPosts = [
  {
    id: 1,
    title: "How to Merge PDF Files: A Complete Guide",
    excerpt: "Learn the best practices for combining multiple PDF documents into a single file. Discover tips for maintaining quality and organization.",
    author: "ToolsCrush Team",
    date: "2024-01-15",
    slug: "how-to-merge-pdf-files",
    category: "PDF Tips",
  },
  {
    id: 2,
    title: "Image Compression Techniques for Web Performance",
    excerpt: "Optimize your website's loading speed with effective image compression. Find out which formats and quality settings work best.",
    author: "ToolsCrush Team",
    date: "2024-01-10",
    slug: "image-compression-techniques",
    category: "Image Tools",
  },
  {
    id: 3,
    title: "PDF to Word Conversion: Maintaining Formatting",
    excerpt: "Converting PDFs to Word documents while preserving layouts, fonts, and images. Tips for professional document conversion.",
    author: "ToolsCrush Team",
    date: "2024-01-05",
    slug: "pdf-to-word-conversion",
    category: "PDF Tips",
  },
  {
    id: 4,
    title: "Protecting Your PDFs: Security Best Practices",
    excerpt: "Secure your sensitive documents with password protection. Learn about encryption standards and document security.",
    author: "ToolHub Team",
    date: "2023-12-28",
    slug: "protecting-pdfs-security",
    category: "Security",
  },
  {
    id: 5,
    title: "Batch Processing: Working with Multiple PDFs",
    excerpt: "Save time by processing multiple PDF files at once. Discover efficient workflows for document management.",
    author: "ToolHub Team",
    date: "2023-12-20",
    slug: "batch-processing-pdfs",
    category: "Productivity",
  },
  {
    id: 6,
    title: "Image Format Guide: JPG vs PNG vs WEBP",
    excerpt: "Choose the right image format for your needs. Compare quality, file size, and browser support across different formats.",
    author: "ToolHub Team",
    date: "2023-12-15",
    slug: "image-format-guide",
    category: "Image Tools",
  },
];

const Blog = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <SEO
        title="Blog - PDF & Image Tools Tips & Tutorials"
        description="Discover tips, tutorials, and best practices for working with PDFs and images. Learn how to optimize your document workflow with ToolHub."
        keywords="PDF tips, image optimization, document management, file conversion, productivity tips"
        canonicalUrl="https://toolhub.com/blog"
      />
      <Header />
      <main className="flex-1">
        <section className="py-10 md:py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                ToolHub Blog
              </h1>
              <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Tips, tutorials, and insights for working with PDFs and images
              </p>
            </div>

            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-2 text-sm text-primary mb-2">
                        <span className="font-medium">{post.category}</span>
                      </div>
                      <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{post.author}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
