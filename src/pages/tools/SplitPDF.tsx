import { useState } from "react";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileImage, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface PagePreview {
  pageNumber: number;
  thumbnail: string;
  selected: boolean;
}

const SplitPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [fromPage, setFromPage] = useState("");
  const [toPage, setToPage] = useState("");

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) {
      setFile(null);
      setPages([]);
      return;
    }

    const selectedFile = files[0];
    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useSystemFonts: true,
      }).promise;
      const totalPages = pdf.numPages;

      const pagePreviewsPromises: Promise<PagePreview>[] = [];

      for (let i = 1; i <= totalPages; i++) {
        pagePreviewsPromises.push(
          (async () => {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.5 });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            if (!context) {
              throw new Error("Failed to get canvas context");
            }

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
              canvasContext: context,
              viewport: viewport,
              canvas: canvas,
            } as any).promise;

            return {
              pageNumber: i,
              thumbnail: canvas.toDataURL("image/jpeg", 0.7),
              selected: true,
            };
          })()
        );
      }

      const pagePreviewsData = await Promise.all(pagePreviewsPromises);
      setPages(pagePreviewsData);

      toast({
        title: "PDF Loaded",
        description: `Found ${totalPages} page${totalPages > 1 ? "s" : ""} in the PDF.`,
      });
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast({
        title: "Error",
        description: "Failed to process PDF. Please try again.",
        variant: "destructive",
      });
      setFile(null);
      setPages([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePageSelection = (pageNumber: number) => {
    setPages((prev) =>
      prev.map((page) =>
        page.pageNumber === pageNumber
          ? { ...page, selected: !page.selected }
          : page
      )
    );
  };

  const selectAllPages = () => {
    setPages((prev) => prev.map((page) => ({ ...page, selected: true })));
  };

  const deselectAllPages = () => {
    setPages((prev) => prev.map((page) => ({ ...page, selected: false })));
  };

  const selectPageRange = () => {
    const from = parseInt(fromPage);
    const to = parseInt(toPage);

    if (!fromPage || !toPage) {
      toast({
        title: "Invalid Range",
        description: "Please enter both 'From Page' and 'To Page' values.",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(from) || isNaN(to)) {
      toast({
        title: "Invalid Range",
        description: "Please enter valid page numbers.",
        variant: "destructive",
      });
      return;
    }

    if (from < 1 || to < 1 || from > pages.length || to > pages.length) {
      toast({
        title: "Invalid Range",
        description: `Page numbers must be between 1 and ${pages.length}.`,
        variant: "destructive",
      });
      return;
    }

    if (from > to) {
      toast({
        title: "Invalid Range",
        description: "'From Page' must be less than or equal to 'To Page'.",
        variant: "destructive",
      });
      return;
    }

    setPages((prev) =>
      prev.map((page) => ({
        ...page,
        selected: page.pageNumber >= from && page.pageNumber <= to,
      }))
    );

    toast({
      title: "Range Selected",
      description: `Selected pages ${from} to ${to}.`,
    });
  };

  const splitPDF = async () => {
    if (!file || pages.length === 0) return;

    const selectedPages = pages.filter((page) => page.selected);
    if (selectedPages.length === 0) {
      toast({
        title: "No Pages Selected",
        description: "Please select at least one page to download.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);

      // Create a single new PDF document for all selected pages
      const newPdf = await PDFDocument.create();
      
      // Get the page indices (convert from 1-indexed to 0-indexed)
      const pageIndices = selectedPages.map(p => p.pageNumber - 1);
      
      // Copy all selected pages to the new document
      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
      
      // Add all copied pages to the new document
      copiedPages.forEach(page => {
        newPdf.addPage(page);
      });

      // Save the PDF
      const pdfBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement("a");
      a.href = url;
      
      // Generate filename with page range
      const pageNumbers = selectedPages.map(p => p.pageNumber);
      const fileName = selectedPages.length === pages.length 
        ? `ToolsCrush_split-all-pages.pdf`
        : `ToolsCrush_split-pages-${Math.min(...pageNumbers)}-to-${Math.max(...pageNumbers)}.pdf`;
      
      a.download = fileName;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast({
        title: "Download Complete",
        description: `Successfully downloaded PDF with ${selectedPages.length} page${
          selectedPages.length > 1 ? "s" : ""
        }.`,
      });
    } catch (error) {
      console.error("Error splitting PDF:", error);
      toast({
        title: "Error",
        description: "Failed to split PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  const howToSteps = [
    {
      name: "Upload PDF File",
      text: "Click or drag and drop a single PDF file into the upload area. The tool will automatically process all pages and generate preview thumbnails."
    },
    {
      name: "Select Pages to Extract",
      text: "Review the page thumbnails and select which pages you want to extract. You can select individual pages, use page range selection, or use 'Select All' to choose all pages at once."
    },
    {
      name: "Split PDF",
      text: "Click the 'Download Selected Pages' button. The tool will extract each selected page into a separate PDF file."
    },
    {
      name: "Download PDFs",
      text: "Your browser will automatically download all extracted PDF files. Each page will be saved as a separate PDF document in your downloads folder."
    }
  ];

  return (
    <ToolPage
      title="Split PDF"
      description="Extract and split PDF pages into separate PDF documents"
      keywords="split PDF, extract PDF pages, separate PDF pages, divide PDF, split PDF documents"
      canonicalUrl="https://toolhub.com/tools/split-pdf"
      howToSteps={howToSteps}
    >
      <div className="space-y-6">
        <FileUploader
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          acceptedFileTypes="PDF"
        />

        {isProcessing && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Processing PDF pages...
              </p>
            </div>
          </Card>
        )}

        {!isProcessing && pages.length > 0 && (
          <>
            <Card className="p-6">
              <div className="mb-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">
                    Select Pages to Extract
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCount} of {pages.length} page
                    {pages.length > 1 ? "s" : ""} selected
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="fromPage">From Page</Label>
                    <Input
                      id="fromPage"
                      type="number"
                      min="1"
                      max={pages.length}
                      placeholder="1"
                      value={fromPage}
                      onChange={(e) => setFromPage(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="toPage">To Page</Label>
                    <Input
                      id="toPage"
                      type="number"
                      min="1"
                      max={pages.length}
                      placeholder={pages.length.toString()}
                      value={toPage}
                      onChange={(e) => setToPage(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={selectPageRange}
                    className="w-full sm:w-auto"
                  >
                    Select Range
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllPages}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAllPages}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {pages.map((page) => (
                  <div
                    key={page.pageNumber}
                    className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                      page.selected
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => togglePageSelection(page.pageNumber)}
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-muted">
                      <img
                        src={page.thumbnail}
                        alt={`Page ${page.pageNumber}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                      <FileImage className="h-8 w-8 text-primary" />
                    </div>
                    <div className="bg-card p-2 text-center">
                      <p className="text-xs font-medium">
                        Page {page.pageNumber}
                      </p>
                    </div>
                    {page.selected && (
                      <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <span className="text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex justify-center">
              <Button
                onClick={splitPDF}
                disabled={selectedCount === 0 || isConverting}
                size="lg"
                className="w-full sm:w-auto"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download {selectedCount} Page
                    {selectedCount !== 1 ? "s" : ""} as PDF
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </ToolPage>
  );
};

export default SplitPDF;
