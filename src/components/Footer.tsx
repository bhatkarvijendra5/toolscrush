import { FileText, Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-muted/30" role="contentinfo">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="mb-4 flex items-center space-x-2" aria-label="ToolsCrush Home">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-lg">
                <FileText className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold">ToolsCrush</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Professional PDF and image tools for everyone. Free, fast, and secure.
            </p>
          </div>

          <nav aria-label="PDF Tools">
            <h3 className="mb-3 md:mb-4 font-semibold text-sm md:text-base">PDF Tools</h3>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
              <li><Link to="/tools/merge-pdf" className="hover:text-primary">Merge PDF</Link></li>
              <li><Link to="/tools/split-pdf" className="hover:text-primary">Split PDF</Link></li>
              <li><Link to="/tools/compress-pdf" className="hover:text-primary">Compress PDF</Link></li>
              <li><Link to="/tools/pdf-to-word" className="hover:text-primary">PDF to Word</Link></li>
              <li><Link to="/tools/word-to-pdf" className="hover:text-primary">Word to PDF</Link></li>
              <li><Link to="/tools/pdf-to-excel" className="hover:text-primary">PDF to Excel</Link></li>
              <li><Link to="/tools/sign-pdf" className="hover:text-primary">Sign PDF</Link></li>
              <li><Link to="/tools/protect-pdf" className="hover:text-primary">Protect PDF</Link></li>
            </ul>
          </nav>

          <nav aria-label="Image Tools">
            <h3 className="mb-3 md:mb-4 font-semibold text-sm md:text-base">Image Tools</h3>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
              <li><Link to="/tools/convert-image" className="hover:text-primary">Convert Images</Link></li>
              <li><Link to="/tools/compress-image" className="hover:text-primary">Compress Images</Link></li>
              <li><Link to="/tools/resize-image" className="hover:text-primary">Resize Images</Link></li>
              <li><Link to="/tools/jpg-to-pdf" className="hover:text-primary">JPG to PDF</Link></li>
              <li><Link to="/tools/pdf-to-jpg" className="hover:text-primary">PDF to JPG</Link></li>
            </ul>
          </nav>

          <nav aria-label="Company Links">
            <h3 className="mb-3 md:mb-4 font-semibold text-sm md:text-base">Company</h3>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link to="/blog" className="hover:text-primary">Blog</Link></li>
              <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            </ul>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary" aria-label="Twitter">
                <Twitter className="h-5 w-5" aria-hidden="true" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary" aria-label="GitHub">
                <Github className="h-5 w-5" aria-hidden="true" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </nav>
        </div>

        <div className="mt-6 md:mt-8 border-t pt-6 md:pt-8 text-center text-xs md:text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ToolHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
