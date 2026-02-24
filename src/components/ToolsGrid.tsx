import { useState } from "react";
import ToolCard from "./ToolCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import {
  FileText, Combine, Scissors, Minimize2, FileSpreadsheet, Presentation,
  Image, FileImage, Settings, Droplet, Hash, ScanText, RefreshCw,
  Maximize2, PenTool, Lock, Unlock, Sparkles,
} from "lucide-react";

const tools = [
  { title: "Merge PDF", description: "Combine multiple PDFs into a single document", icon: Combine, href: "/tools/merge-pdf", category: "PDF Tools" },
  { title: "Split PDF", description: "Extract pages or split PDF into multiple files", icon: Scissors, href: "/tools/split-pdf", category: "PDF Tools" },
  { title: "Compress PDF", description: "Reduce PDF file size without losing quality", icon: Minimize2, href: "/tools/compress-pdf", category: "PDF Tools" },
  { title: "PDF to Word", description: "Convert PDF documents to editable Word files", icon: FileText, href: "/tools/pdf-to-word", category: "PDF Convert" },
  { title: "PDF to Excel", description: "Extract tables from PDF to Excel spreadsheets", icon: FileSpreadsheet, href: "/tools/pdf-to-excel", category: "PDF Convert" },
  { title: "PDF to PowerPoint", description: "Transform PDF pages into editable slides", icon: Presentation, href: "/tools/pdf-to-ppt", category: "PDF Convert" },
  { title: "Word to PDF", description: "Convert Word documents to PDF format", icon: FileText, href: "/tools/word-to-pdf", category: "PDF Convert" },
  { title: "JPG to PDF", description: "Convert images to PDF documents", icon: FileImage, href: "/tools/jpg-to-pdf", category: "PDF Convert" },
  { title: "PDF to JPG", description: "Extract images from PDF files", icon: Image, href: "/tools/pdf-to-jpg", category: "PDF Convert" },
  { title: "Organize PDF", description: "Reorder, rotate, and delete PDF pages", icon: Settings, href: "/tools/organize-pdf", category: "PDF Tools" },
  { title: "Watermark PDF", description: "Add text or image watermarks to PDF", icon: Droplet, href: "/tools/watermark-pdf", category: "PDF Tools" },
  { title: "Add Page Numbers", description: "Insert page numbers to your PDF", icon: Hash, href: "/tools/page-numbers", category: "PDF Tools" },
  { title: "Image to Text", description: "Extract text from images using OCR", icon: ScanText, href: "/tools/ocr", category: "Image Tools" },
  { title: "Convert Images", description: "Convert between JPG, PNG, WEBP, and HEIC", icon: RefreshCw, href: "/tools/convert-image", category: "Image Tools" },
  { title: "Compress Images", description: "Reduce image file size efficiently", icon: Minimize2, href: "/tools/compress-image", category: "Image Tools" },
  { title: "Resize Images", description: "Change image dimensions and resolution", icon: Maximize2, href: "/tools/resize-image", category: "Image Tools" },
  { title: "Sign PDF", description: "Add your signature to PDF documents", icon: PenTool, href: "/tools/sign-pdf", category: "PDF Tools" },
  { title: "Protect PDF", description: "Secure your PDF with password protection", icon: Lock, href: "/tools/protect-pdf", category: "PDF Tools" },
  { title: "Unlock PDF", description: "Remove password protection from PDF", icon: Unlock, href: "/tools/unlock-pdf", category: "PDF Tools" },
  { title: "AI Document Analyzer", description: "Scan handwritten notes and convert to text", icon: Sparkles, href: "/tools/document-analyzer", category: "AI Tools" },
];

const categories = ["All Tools", "PDF Tools", "PDF Convert", "Image Tools", "AI Tools"];

const ToolsGrid = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Tools");

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Tools" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="tools" className="pt-4 pb-12 md:pt-6 md:pb-24 px-4" aria-labelledby="tools-heading">
      <h2 id="tools-heading" className="sr-only">All PDF and Image Tools</h2>
      <div className="container mx-auto">
        <div className="mb-6 md:mb-8 space-y-4">
          <div className="relative mx-auto max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search tools..."
              className="pl-10 h-10 md:h-11 text-sm md:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search tools"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mx-auto w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-1 p-1" aria-label="Filter tools by category">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="text-xs md:text-sm px-2 py-2 md:px-3">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list">
          {filteredTools.map((tool) => (
            <div key={tool.title} role="listitem">
              <ToolCard {...tool} />
            </div>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-base md:text-lg text-muted-foreground">No tools found matching your search.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ToolsGrid;
