import { useState } from "react";
import { toolSeoData } from "@/data/toolSeoData";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Loader2, GripVertical, X, Trash2, FileStack, Upload } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PDFData {
  id: string;
  fileIndex: number;
  fileName: string;
  thumbnail: string;
  totalPages: number;
  file: File;
}

const MergePDF = () => {
  const [pdfs, setPdfs] = useState<PDFData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [progress, setProgress] = useState(0);
  const [draggedPdfId, setDraggedPdfId] = useState<string | null>(null);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    if (pdfs.length + selectedFiles.length > 15) {
      toast.error("You can upload only 15 PDFs at once");
      return;
    }
    if (selectedFiles.length > 0) {
      await extractFirstPages(selectedFiles);
    }
  };

  const extractFirstPages = async (selectedFiles: File[]) => {
    setIsLoadingPages(true);
    const newPdfs: PDFData[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          useSystemFonts: true 
        }).promise;

        // Only extract first page
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.8 });
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
          canvas: canvas,
        } as any).promise;

        const thumbnail = canvas.toDataURL("image/jpeg", 0.8);
        
        newPdfs.push({
          id: `${pdfs.length + i}-${Date.now()}-${Math.random()}`,
          fileIndex: pdfs.length + i,
          fileName: file.name,
          thumbnail,
          totalPages: pdf.numPages,
          file,
        });
      }

      setPdfs([...pdfs, ...newPdfs]);
      toast.success(`Added ${newPdfs.length} PDF(s)`);
    } catch (error) {
      console.error("Error extracting pages:", error);
      toast.error("Failed to extract pages from PDFs");
    } finally {
      setIsLoadingPages(false);
    }
  };


  const handlePdfDragStart = (pdfId: string) => {
    setDraggedPdfId(pdfId);
  };

  const handlePdfDragOver = (e: React.DragEvent, targetPdfId: string) => {
    e.preventDefault();
    if (!draggedPdfId || draggedPdfId === targetPdfId) return;

    const draggedIndex = pdfs.findIndex(p => p.id === draggedPdfId);
    const targetIndex = pdfs.findIndex(p => p.id === targetPdfId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newPdfs = [...pdfs];
    const [draggedPdf] = newPdfs.splice(draggedIndex, 1);
    newPdfs.splice(targetIndex, 0, draggedPdf);

    setPdfs(newPdfs);
  };

  const handlePdfDragEnd = () => {
    setDraggedPdfId(null);
  };

  const removePdf = (pdfId: string) => {
    setPdfs(pdfs.filter(p => p.id !== pdfId));
    toast.success("PDF removed");
  };

  const clearAllPdfs = () => {
    setPdfs([]);
    toast.success("All PDFs cleared");
  };

  const handleMerge = async () => {
    if (pdfs.length === 0) {
      toast.error("Please add PDF files to merge");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const mergedPdf = await PDFDocument.create();
      
      let processedPdfs = 0;
      
      // Process PDFs in the order they appear in the pdfs array
      for (const pdfData of pdfs) {
        const arrayBuffer = await pdfData.file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(arrayBuffer);
        
        // Copy all pages from each PDF
        const pageIndices = Array.from({ length: sourcePdf.getPageCount() }, (_, i) => i);
        const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);
        copiedPages.forEach(page => mergedPdf.addPage(page));
        
        processedPdfs++;
        setProgress(Math.round((processedPdfs / pdfs.length) * 90));
      }
      
      setProgress(95);
      
      const mergedPdfBytes = await mergedPdf.save();
      
      setProgress(100);
      
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ToolsCrush_merged-pdf-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsProcessing(false);
      toast.success(`${pdfs.length} PDFs merged successfully!`);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      setIsProcessing(false);
      setProgress(0);
      toast.error("Failed to merge PDFs. Please ensure all files are valid PDFs.");
    }
  };

  const howToSteps = [
    {
      name: "Upload PDF Files",
      text: "Upload up to 15 PDFs by clicking or dragging files, or import from Google Drive or Dropbox. Only the first page thumbnail will be shown for preview."
    },
    {
      name: "Reorder PDFs",
      text: "Drag and drop PDF thumbnails horizontally to arrange them in your desired merge order. The entire PDF will be merged in that sequence."
    },
    {
      name: "Remove Unwanted PDFs",
      text: "Hover over any PDF thumbnail and click the X button to remove it. You can also click 'Clear All' to start over."
    },
    {
      name: "Merge and Download",
      text: "Click the 'Merge PDFs' button. All PDFs will be combined in your chosen order and automatically downloaded as a single merged file."
    }
  ];

  const seo = toolSeoData["merge-pdf"];

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
        <Card className="p-6">
          <div className="space-y-4">
            <FileUploader
              accept={{ "application/pdf": [".pdf"] }}
              maxFiles={15 - pdfs.length}
              onFilesSelected={handleFilesSelected}
              acceptedFileTypes="PDF files"
            />
          </div>
        </Card>

        {isLoadingPages && (
          <Card className="p-6">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Extracting pages and generating thumbnails...
              </p>
            </div>
          </Card>
        )}

        {pdfs.length > 0 && !isLoadingPages && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileStack className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    PDFs ({pdfs.length}/15)
                  </h3>
                </div>
                <Button
                  onClick={clearAllPdfs}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Drag PDFs to reorder them. All pages from each PDF will be merged in this order.
              </p>
              
              {pdfs.length < 15 && (
                <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    You can upload {15 - pdfs.length} more PDF{15 - pdfs.length !== 1 ? 's' : ''} (max 15 total)
                  </p>
                </div>
              )}
              
              <div className="max-h-[420px] overflow-y-auto overflow-x-hidden pr-2">
                <div className="space-y-3">
                  {pdfs.map((pdf) => (
                    <div
                      key={pdf.id}
                      draggable
                      onDragStart={() => handlePdfDragStart(pdf.id)}
                      onDragOver={(e) => handlePdfDragOver(e, pdf.id)}
                      onDragEnd={handlePdfDragEnd}
                      className={`group relative flex gap-3 p-3 rounded-lg border-2 transition-all cursor-move ${
                        draggedPdfId === pdf.id
                          ? "border-primary bg-primary/5 scale-[1.02] shadow-lg"
                          : "border-border hover:border-primary/50 hover:shadow-md"
                      }`}
                    >
                      <div className="flex-shrink-0 w-20 h-28 relative overflow-hidden rounded bg-muted">
                        <img
                          src={pdf.thumbnail}
                          alt={`${pdf.fileName} - First page`}
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-1 left-1 flex items-center justify-center h-6 w-6 rounded-full bg-background/90 border border-border">
                          <GripVertical className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <p className="text-sm font-medium truncate" title={pdf.fileName}>
                            {pdf.fileName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {pdf.totalPages} page{pdf.totalPages !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePdf(pdf.id);
                          }}
                          size="icon"
                          variant="destructive"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <Button
                onClick={handleMerge}
                disabled={isProcessing || pdfs.length === 0}
                size="lg"
                className="w-full gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Merging PDFs...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Merge {pdfs.length} PDF{pdfs.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>

              {isProcessing && (
                <div className="mt-4 space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    {progress < 90
                      ? `Merging PDFs... ${progress}%`
                      : progress < 95
                      ? "Finalizing PDF..."
                      : "Almost done..."}
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </ToolPage>
  );
};

export default MergePDF;
