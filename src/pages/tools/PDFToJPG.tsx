import { useState } from "react";
import { toolSeoData } from "@/data/toolSeoData";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2, FileArchive } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface PageImage {
  dataUrl: string;
  pageNumber: number;
  width: number;
  height: number;
}

const PDFToJPG = () => {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<PageImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) {
      setFile(null);
      setImages([]);
      return;
    }
    setFile(files[0]);
    await convertPDFToImages(files[0]);
  };

  const convertPDFToImages = async (pdfFile: File) => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
      }).promise;

      const pageData: PageImage[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
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
          dataUrl: canvas.toDataURL("image/jpeg", 0.95),
          pageNumber: i,
          width: viewport.width,
          height: viewport.height,
        });
      }

      setImages(pageData);
      toast({
        title: "Conversion Complete",
        description: `${pageData.length} page${pageData.length > 1 ? "s" : ""} converted to JPG.`,
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

  const downloadSingleImage = (image: PageImage) => {
    const a = document.createElement("a");
    a.href = image.dataUrl;
    a.download = `ToolsCrush_page-${String(image.pageNumber).padStart(3, "0")}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllAsZip = async () => {
    if (images.length === 0) return;

    try {
      const zip = new JSZip();

      for (const image of images) {
        const base64Data = image.dataUrl.split(",")[1];
        zip.file(`page-${String(image.pageNumber).padStart(3, "0")}.jpg`, base64Data, {
          base64: true,
        });
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ToolsCrush_pdf-to-jpg-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: `${images.length} images downloaded as ZIP.`,
      });
    } catch (error) {
      console.error("Error creating ZIP:", error);
      toast({
        title: "Error",
        description: "Failed to create ZIP file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const seo = toolSeoData["pdf-to-jpg"];

  return (
    <ToolPage
      title={seo.title}
      description={seo.description}
      keywords={seo.keywords}
      canonicalUrl={seo.canonicalUrl}
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
              <p className="text-sm text-muted-foreground">Converting pages to JPG...</p>
            </div>
          </Card>
        )}

        {images.length > 0 && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Converted Images</h3>
                  <p className="text-sm text-muted-foreground">
                    {images.length} page{images.length > 1 ? "s" : ""} converted
                  </p>
                </div>
                <Button onClick={downloadAllAsZip} variant="outline">
                  <FileArchive className="mr-2 h-4 w-4" />
                  Download All as ZIP
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                {images.map((image) => (
                  <Card key={image.pageNumber} className="p-4">
                    <div className="space-y-3">
                      <img
                        src={image.dataUrl}
                        alt={`Page ${image.pageNumber}`}
                        className="w-full h-auto rounded border"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Page {image.pageNumber}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => downloadSingleImage(image)}
                        >
                          <Download className="mr-2 h-3 w-3" />
                          Download
                        </Button>
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

export default PDFToJPG;
