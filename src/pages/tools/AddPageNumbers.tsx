import { useState } from "react";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, Loader2, RotateCw, Trash2, GripVertical } from "lucide-react";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type VerticalPosition = "top" | "bottom";
type HorizontalPosition = "left" | "center" | "right";
type FontStyle = "normal" | "bold" | "italic";

interface PagePreview {
  pageNumber: number;
  thumbnail: string;
  rotation: number;
}

const AddPageNumbers = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verticalPosition, setVerticalPosition] = useState<VerticalPosition>("bottom");
  const [horizontalPosition, setHorizontalPosition] = useState<HorizontalPosition>("center");
  const [fontSize, setFontSize] = useState([12]);
  const [fontStyle, setFontStyle] = useState<FontStyle>("normal");
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0 && files[0].type === "application/pdf") {
      setFile(files[0]);
      loadPDFPages(files[0]);
    } else {
      toast.error("Please upload a valid PDF file");
    }
  };

  const loadPDFPages = async (file: File) => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pagePromises: Promise<PagePreview>[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        pagePromises.push(
          (async () => {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.5 });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            if (!context) throw new Error("Could not get canvas context");

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;

            return {
              pageNumber: i,
              thumbnail: canvas.toDataURL(),
              rotation: 0,
            };
          })()
        );
      }

      const loadedPages = await Promise.all(pagePromises);
      setPages(loadedPages);
      toast.success(`Loaded ${pdf.numPages} pages`);
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast.error("Failed to load PDF pages");
    } finally {
      setIsProcessing(false);
    }
  };

  const rotatePage = (index: number) => {
    setPages(prev => 
      prev.map((page, i) => 
        i === index ? { ...page, rotation: (page.rotation + 90) % 360 } : page
      )
    );
  };

  const deletePage = (index: number) => {
    if (pages.length === 1) {
      toast.error("Cannot delete the last page");
      return;
    }
    setPages(prev => prev.filter((_, i) => i !== index));
    toast.success("Page deleted");
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

  const addPageNumbers = async () => {
    if (!file || pages.length === 0) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const allPages = pdfDoc.getPages();
      
      // Create new document with organized pages
      const newPdfDoc = await PDFDocument.create();
      
      for (const pagePreview of pages) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pagePreview.pageNumber - 1]);
        
        // Apply rotation if needed
        if (pagePreview.rotation !== 0) {
          copiedPage.setRotation(degrees(pagePreview.rotation));
        }
        
        newPdfDoc.addPage(copiedPage);
      }
      
      const finalPages = newPdfDoc.getPages();

      // Select font based on style
      let font;
      switch (fontStyle) {
        case "bold":
          font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
          break;
        case "italic":
          font = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
          break;
        default:
          font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }

      finalPages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const pageNumber = `${index + 1}`;
        const textWidth = font.widthOfTextAtSize(pageNumber, fontSize[0]);
        const margin = 30;
        
        // Get the page's rotation to orient the page number correctly
        const pageRotation = pages[index]?.rotation || 0;

        // Calculate horizontal position
        let x: number;
        switch (horizontalPosition) {
          case "left":
            x = margin;
            break;
          case "right":
            x = width - textWidth - margin;
            break;
          case "center":
          default:
            x = (width - textWidth) / 2;
        }

        // Calculate vertical position
        const y = verticalPosition === "top" ? height - margin : margin;

        page.drawText(pageNumber, {
          x,
          y,
          size: fontSize[0],
          font,
          color: rgb(0, 0, 0),
          rotate: degrees(pageRotation),
        });
      });

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ToolsCrush_${file.name.replace(".pdf", "_numbered.pdf")}`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Page numbers added successfully!");
    } catch (error) {
      console.error("Error adding page numbers:", error);
      toast.error("Failed to add page numbers to PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  const howToSteps = [
    {
      name: "Upload PDF",
      text: "Upload the PDF file you want to add page numbers to."
    },
    {
      name: "Customize Page Numbers",
      text: "Choose page number position (top/bottom, left/center/right), font style, and font size to match your document."
    },
    {
      name: "Preview and Adjust",
      text: "Review the page number placement on sample pages and adjust settings if needed."
    },
    {
      name: "Download PDF",
      text: "Click 'Download PDF with Page Numbers' to process and download your numbered PDF document."
    }
  ];

  return (
    <ToolPage
      title="Add Page Numbers"
      description="Upload a PDF and add page numbers with customizable position and style"
      keywords="add page numbers to pdf, pdf page numbering, number pdf pages"
      canonicalUrl="https://toolhub.com/tools/add-page-numbers"
      howToSteps={howToSteps}
    >
      <div className="space-y-6">
        <FileUploader
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
        />

        {isProcessing && !pages.length && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {pages.length > 0 && (
          <>
            <div className="space-y-4 rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold">Preview</h3>
              <p className="text-sm text-muted-foreground">
                See how page numbers will appear on your pages
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[0, Math.floor(pages.length / 2), pages.length - 1]
                  .filter((idx, i, arr) => arr.indexOf(idx) === i && pages[idx])
                  .slice(0, 3)
                  .map((pageIndex) => {
                    const page = pages[pageIndex];
                    const pageNumber = `${pageIndex + 1}`;
                    
                    // Calculate position based on settings
                    let positionClass = "";
                    if (verticalPosition === "top") {
                      positionClass += "top-4 ";
                    } else {
                      positionClass += "bottom-4 ";
                    }
                    
                    if (horizontalPosition === "left") {
                      positionClass += "left-4";
                    } else if (horizontalPosition === "right") {
                      positionClass += "right-4";
                    } else {
                      positionClass += "left-1/2 -translate-x-1/2";
                    }

                    return (
                      <div key={pageIndex} className="relative">
                        <div className="relative overflow-hidden rounded border border-border">
                          <img
                            src={page.thumbnail}
                            alt={`Preview page ${pageNumber}`}
                            className="h-auto w-full"
                            style={{ transform: `rotate(${page.rotation}deg)` }}
                          />
                          <div
                            className={`absolute ${positionClass} rounded bg-background/90 px-2 py-1 text-foreground shadow-md`}
                            style={{
                              fontSize: `${fontSize[0]}px`,
                              fontWeight: fontStyle === "bold" ? "bold" : "normal",
                              fontStyle: fontStyle === "italic" ? "italic" : "normal",
                              transform: `rotate(${page.rotation}deg) ${horizontalPosition === "center" ? "translateX(-50%)" : ""}`,
                              transformOrigin: "center",
                            }}
                          >
                            {pageNumber}
                          </div>
                        </div>
                        <div className="mt-1 text-center text-xs text-muted-foreground">
                          Page {pageNumber}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {pages.map((page, index) => (
                <div
                  key={`${page.pageNumber}-${index}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className="group relative cursor-move rounded-lg border border-border bg-card p-2 transition-all hover:border-primary hover:shadow-lg"
                >
                  <div className="absolute left-2 top-2 z-10 flex items-center gap-1">
                    <div className="rounded bg-background/90 p-1">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="absolute right-2 top-2 z-10 flex gap-1">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => rotatePage(index)}
                    >
                      <RotateCw className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => deletePage(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <img
                    src={page.thumbnail}
                    alt={`Page ${page.pageNumber}`}
                    className="h-auto w-full rounded"
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                  />

                  <div className="mt-2 text-center text-sm text-muted-foreground">
                    Page {index + 1}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6 rounded-lg border border-border bg-card p-6">
              <div className="space-y-2">
                <Label>Vertical Position</Label>
              <Select value={verticalPosition} onValueChange={(value: VerticalPosition) => setVerticalPosition(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Horizontal Position</Label>
              <Select value={horizontalPosition} onValueChange={(value: HorizontalPosition) => setHorizontalPosition(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Font Size: {fontSize[0]}pt</Label>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                min={8}
                max={24}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Font Style</Label>
              <Select value={fontStyle} onValueChange={(value: FontStyle) => setFontStyle(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="italic">Italic</SelectItem>
                </SelectContent>
              </Select>
            </div>

              <Button
                onClick={addPageNumbers}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Page Numbers...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF with Page Numbers
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

export default AddPageNumbers;
