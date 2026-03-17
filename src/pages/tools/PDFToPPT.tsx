import { useState } from "react";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";
import PptxGenJS from "pptxgenjs";
import { Checkbox } from "@/components/ui/checkbox";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface PagePreview {
  dataUrl: string;
  width: number;
  height: number;
  pageNumber: number;
  selected: boolean;
}

const PDFToPPT = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previews, setPreviews] = useState<PagePreview[]>([]);
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) {
      setFile(null);
      setPreviews([]);
      return;
    }
    setFile(files[0]);
    await generatePreviews(files[0]);
  };

  const generatePreviews = async (pdfFile: File) => {
    setIsGeneratingPreviews(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useSystemFonts: true 
      }).promise;
      
      const pageData: PagePreview[] = [];
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
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
          dataUrl: canvas.toDataURL("image/jpeg", 0.85),
          width: viewport.width,
          height: viewport.height,
          pageNumber: i,
          selected: true,
        });
      }

      setPreviews(pageData);
    } catch (error) {
      console.error("Error generating previews:", error);
      toast({
        title: "Error",
        description: "Failed to generate previews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPreviews(false);
    }
  };

  const togglePageSelection = (pageNumber: number) => {
    setPreviews(prev => 
      prev.map(p => 
        p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const toggleAll = () => {
    const allSelected = previews.every(p => p.selected);
    setPreviews(prev => prev.map(p => ({ ...p, selected: !allSelected })));
  };

  const handleConvert = async () => {
    if (!file) return;

    const selectedPages = previews.filter(p => p.selected);
    if (selectedPages.length === 0) {
      toast({
        title: "No Pages Selected",
        description: "Please select at least one page to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const pptx = new PptxGenJS();

      for (const page of selectedPages) {
        const slide = pptx.addSlide();
        
        // Calculate slide dimensions (16:9 aspect ratio)
        const slideWidth = 10;
        const slideHeight = 5.625;
        
        // Add image to slide
        slide.addImage({
          data: page.dataUrl,
          x: 0,
          y: 0,
          w: slideWidth,
          h: slideHeight,
          sizing: { type: "contain", w: slideWidth, h: slideHeight },
        });
      }

      await pptx.writeFile({ fileName: `ToolsCrush_${file.name.replace(".pdf", ".pptx")}` });

      toast({
        title: "Conversion Complete",
        description: `${selectedPages.length} slides converted to PowerPoint successfully.`,
      });
    } catch (error) {
      console.error("Error converting PDF:", error);
      toast({
        title: "Error",
        description: "Failed to convert PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPage
      title="PDF to PowerPoint"
      description="Convert PDF pages to presentation slides"
    >
      <div className="space-y-6">
        <FileUploader
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          acceptedFileTypes="PDF"
        />

        {isGeneratingPreviews && (
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm text-muted-foreground">Generating previews...</p>
            </div>
          </Card>
        )}

        {previews.length > 0 && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Select Pages</h3>
                  <p className="text-sm text-muted-foreground">
                    {previews.filter(p => p.selected).length} of {previews.length} pages selected
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAll}
                >
                  {previews.every(p => p.selected) ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto">
                {previews.map((preview) => (
                  <div
                    key={preview.pageNumber}
                    className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all ${
                      preview.selected ? "ring-2 ring-primary" : "opacity-60"
                    }`}
                    onClick={() => togglePageSelection(preview.pageNumber)}
                  >
                    <img
                      src={preview.dataUrl}
                      alt={`Page ${preview.pageNumber}`}
                      className="w-full h-auto"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-2">
                      <Checkbox
                        checked={preview.selected}
                        onCheckedChange={() => togglePageSelection(preview.pageNumber)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-background"
                      />
                      <span className="text-xs font-medium bg-background/90 px-2 py-1 rounded">
                        {preview.pageNumber}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleConvert}
                disabled={isProcessing || previews.filter(p => p.selected).length === 0}
                size="lg"
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Converting to PowerPoint...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download as PPTX ({previews.filter(p => p.selected).length} slides)
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </ToolPage>
  );
};

export default PDFToPPT;
