import { useState } from "react";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2, RotateCw, Trash2, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument, degrees } from "pdf-lib";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface PagePreview {
  pageNumber: number;
  thumbnail: string;
  rotation: number;
  selected: boolean;
}

const OrganizePDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) {
      setFile(null);
      setPages([]);
      return;
    }
    setFile(files[0]);
    await loadPDFPages(files[0]);
  };

  const loadPDFPages = async (pdfFile: File) => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
      }).promise;

      const pageData: PagePreview[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { alpha: false });

        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: context,
          viewport: viewport,
        } as any).promise;

        pageData.push({
          pageNumber: i,
          thumbnail: canvas.toDataURL("image/jpeg", 0.8),
          rotation: 0,
          selected: false,
        });
      }

      setPages(pageData);
      toast({
        title: "PDF Loaded",
        description: `${pageData.length} page${pageData.length > 1 ? "s" : ""} ready to organize.`,
      });
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast({
        title: "Error",
        description: "Failed to load PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const rotatePage = (index: number) => {
    setPages((prev) =>
      prev.map((page, i) =>
        i === index ? { ...page, rotation: (page.rotation + 90) % 360 } : page
      )
    );
  };

  const deletePage = (index: number) => {
    setPages((prev) => prev.filter((_, i) => i !== index));
    toast({
      title: "Page Deleted",
      description: "Page removed from PDF.",
    });
  };

  const togglePageSelection = (index: number) => {
    setPages((prev) =>
      prev.map((page, i) =>
        i === index ? { ...page, selected: !page.selected } : page
      )
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPages = [...pages];
    const draggedPage = newPages[draggedIndex];
    newPages.splice(draggedIndex, 1);
    newPages.splice(index, 0, draggedPage);

    setPages(newPages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const downloadOrganizedPDF = async () => {
    if (!file || pages.length === 0) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdfDoc = await PDFDocument.create();

      for (const page of pages) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [page.pageNumber - 1]);
        
        if (page.rotation !== 0) {
          copiedPage.setRotation(degrees(page.rotation));
        }
        
        newPdfDoc.addPage(copiedPage);
      }

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ToolsCrush_organized-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: "Organized PDF downloaded successfully.",
      });
    } catch (error) {
      console.error("Error creating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to create organized PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const extractSelectedPages = async () => {
    const selectedPages = pages.filter((p) => p.selected);
    if (!file || selectedPages.length === 0) {
      toast({
        title: "No Pages Selected",
        description: "Please select pages to extract.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdfDoc = await PDFDocument.create();

      for (const page of selectedPages) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [page.pageNumber - 1]);
        
        if (page.rotation !== 0) {
          copiedPage.setRotation(degrees(page.rotation));
        }
        
        newPdfDoc.addPage(copiedPage);
      }

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ToolsCrush_extracted-pages-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Extraction Complete",
        description: `${selectedPages.length} page${selectedPages.length > 1 ? "s" : ""} extracted.`,
      });
    } catch (error) {
      console.error("Error extracting pages:", error);
      toast({
        title: "Error",
        description: "Failed to extract pages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const howToSteps = [
    {
      name: "Upload PDF",
      text: "Upload the PDF file you want to organize using the file uploader."
    },
    {
      name: "Reorder Pages",
      text: "Drag and drop page thumbnails to rearrange the page order as desired."
    },
    {
      name: "Edit Pages",
      text: "Rotate individual pages 90 degrees, delete unwanted pages, or select specific pages for extraction."
    },
    {
      name: "Download Results",
      text: "Download the reorganized PDF or extract selected pages into a new PDF file."
    }
  ];

  const seo = (await import("@/data/toolSeoData")).toolSeoData["organize-pdf"];

  return (
    <ToolPage
      title={seo.title}
      description={seo.description}
      keywords={seo.keywords}
      canonicalUrl={seo.canonicalUrl}
      howToSteps={howToSteps}
      faqs={seo.faqs}
      relatedTools={seo.relatedTools}
      contentIntro={seo.contentIntro}
    >
      <div className="space-y-6">
        <FileUploader
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          acceptedFileTypes="PDF"
        />

        {isProcessing && (
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm text-muted-foreground">Processing PDF...</p>
            </div>
          </Card>
        )}

        {pages.length > 0 && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Organize Pages</h3>
                  <p className="text-sm text-muted-foreground">
                    {pages.length} page{pages.length > 1 ? "s" : ""} • Drag to reorder
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={extractSelectedPages} variant="outline" size="sm">
                    Extract Selected
                  </Button>
                  <Button onClick={downloadOrganizedPDF} disabled={isProcessing}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto">
                {pages.map((page, index) => (
                  <Card
                    key={`${page.pageNumber}-${index}`}
                    className={`p-3 cursor-move transition-all ${
                      draggedIndex === index ? "opacity-50 scale-95" : ""
                    } ${page.selected ? "ring-2 ring-primary" : ""}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="space-y-2">
                      <div className="relative">
                        <img
                          src={page.thumbnail}
                          alt={`Page ${page.pageNumber}`}
                          className="w-full h-auto rounded border"
                          style={{
                            transform: `rotate(${page.rotation}deg)`,
                          }}
                        />
                        <button
                          onClick={() => togglePageSelection(index)}
                          className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            page.selected
                              ? "bg-primary border-primary"
                              : "bg-background border-border"
                          }`}
                        >
                          {page.selected && <Check className="h-4 w-4 text-primary-foreground" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-medium">Page {index + 1}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => rotatePage(index)}
                            className="h-7 w-7 p-0"
                          >
                            <RotateCw className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deletePage(index)}
                            className="h-7 w-7 p-0 text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </ToolPage>
  );
};

export default OrganizePDF;
