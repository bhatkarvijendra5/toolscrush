import { useState } from "react";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Download, Type, Image as ImageIcon } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PagePreview {
  pageNumber: number;
  thumbnail: string;
  selected: boolean;
}

const WatermarkPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");
  
  // Text watermark settings
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  
  // Image watermark settings
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkImagePreview, setWatermarkImagePreview] = useState<string>("");
  
  // Common settings
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(45);
  const [position, setPosition] = useState<"center" | "top-left" | "top-right" | "bottom-left" | "bottom-right">("center");
  const [watermarkSize, setWatermarkSize] = useState(200);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    
    const selectedFile = files[0];
    setFile(selectedFile);
    await loadPDFPages(selectedFile);
  };

  const loadPDFPages = async (file: File) => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const pagePromises = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        pagePromises.push(renderPageThumbnail(pdf, i));
      }
      
      const thumbnails = await Promise.all(pagePromises);
      const pageData = thumbnails.map((thumbnail, index) => ({
        pageNumber: index + 1,
        thumbnail,
        selected: true,
      }));
      
      setPages(pageData);
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast.error("Failed to load PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPageThumbnail = async (pdf: pdfjsLib.PDFDocumentProxy, pageNumber: number): Promise<string> => {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 0.5 });
    
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not get canvas context");
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
    
    return canvas.toDataURL();
  };

  const togglePageSelection = (index: number) => {
    setPages(pages.map((page, i) => 
      i === index ? { ...page, selected: !page.selected } : page
    ));
  };

  const selectAllPages = () => {
    setPages(pages.map(page => ({ ...page, selected: true })));
  };

  const deselectAllPages = () => {
    setPages(pages.map(page => ({ ...page, selected: false })));
  };

  const handleImageUpload = (files: File[]) => {
    if (files.length === 0) return;
    const image = files[0];
    setWatermarkImage(image);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setWatermarkImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(image);
  };

  const applyWatermark = async () => {
    if (!file) {
      toast.error("Please upload a PDF file");
      return;
    }

    const selectedPages = pages.filter(p => p.selected);
    if (selectedPages.length === 0) {
      toast.error("Please select at least one page");
      return;
    }

    if (watermarkType === "text" && !watermarkText.trim()) {
      toast.error("Please enter watermark text");
      return;
    }

    if (watermarkType === "image" && !watermarkImage) {
      toast.error("Please upload a watermark image");
      return;
    }

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pdfPages = pdfDoc.getPages();

      let embeddedImage;
      if (watermarkType === "image" && watermarkImage) {
        const imageBytes = await watermarkImage.arrayBuffer();
        const imageType = watermarkImage.type;
        
        if (imageType === "image/png") {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } else if (imageType === "image/jpeg" || imageType === "image/jpg") {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        } else {
          toast.error("Only PNG and JPG images are supported");
          return;
        }
      }

      selectedPages.forEach(({ pageNumber }) => {
        const page = pdfPages[pageNumber - 1];
        const { width, height } = page.getSize();

        let x = width / 2;
        let y = height / 2;

        if (position === "top-left") {
          x = 50;
          y = height - 50;
        } else if (position === "top-right") {
          x = width - 50;
          y = height - 50;
        } else if (position === "bottom-left") {
          x = 50;
          y = 50;
        } else if (position === "bottom-right") {
          x = width - 50;
          y = 50;
        }

        if (watermarkType === "text") {
          page.drawText(watermarkText, {
            x: x,
            y: y,
            size: fontSize,
            color: rgb(0.5, 0.5, 0.5),
            opacity: opacity,
            rotate: degrees(rotation),
          });
        } else if (embeddedImage) {
          const scale = watermarkSize / Math.max(embeddedImage.width, embeddedImage.height);
          const imgWidth = embeddedImage.width * scale;
          const imgHeight = embeddedImage.height * scale;

          page.drawImage(embeddedImage, {
            x: x - imgWidth / 2,
            y: y - imgHeight / 2,
            width: imgWidth,
            height: imgHeight,
            opacity: opacity,
            rotate: degrees(rotation),
          });
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `ToolsCrush_watermarked-${file.name}`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success("Watermark applied successfully!");
    } catch (error) {
      console.error("Error applying watermark:", error);
      toast.error("Failed to apply watermark");
    } finally {
      setIsProcessing(false);
    }
  };

  const howToSteps = [
    {
      name: "Upload PDF",
      text: "Upload the PDF file you want to add a watermark to using the file uploader."
    },
    {
      name: "Choose Watermark Type",
      text: "Select between text watermark or image watermark. Customize text content, font size, or upload your watermark image."
    },
    {
      name: "Customize Settings",
      text: "Adjust watermark opacity, rotation angle, and position (center, corners) to fit your needs."
    },
    {
      name: "Select Pages",
      text: "Choose which pages to apply the watermark to - select all pages or specific pages only."
    },
    {
      name: "Apply and Download",
      text: "Click 'Apply Watermark & Download' to process your PDF and download the watermarked file."
    }
  ];

  const seo = (await import("@/data/toolSeoData")).toolSeoData["watermark-pdf"];

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
          acceptedFileTypes="PDF files"
        />

        {file && (
          <>
            <Card className="p-6 space-y-6">
              <Tabs value={watermarkType} onValueChange={(v) => setWatermarkType(v as "text" | "image")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Text Watermark
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Image Watermark
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="watermarkText">Watermark Text</Label>
                    <Input
                      id="watermarkText"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="Enter watermark text"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Font Size: {fontSize}px</Label>
                    <Slider
                      value={[fontSize]}
                      onValueChange={(v) => setFontSize(v[0])}
                      min={12}
                      max={120}
                      step={1}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="image" className="space-y-4 mt-4">
                  <FileUploader
                    accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
                    maxFiles={1}
                    onFilesSelected={handleImageUpload}
                    acceptedFileTypes="PNG, JPG, JPEG"
                  />
                  
                  {watermarkImagePreview && (
                    <div className="flex justify-center">
                      <img 
                        src={watermarkImagePreview} 
                        alt="Watermark preview" 
                        className="max-h-32 rounded border"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Watermark Size: {watermarkSize}px</Label>
                    <Slider
                      value={[watermarkSize]}
                      onValueChange={(v) => setWatermarkSize(v[0])}
                      min={50}
                      max={500}
                      step={10}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label>Opacity: {(opacity * 100).toFixed(0)}%</Label>
                <Slider
                  value={[opacity]}
                  onValueChange={(v) => setOpacity(v[0])}
                  min={0.1}
                  max={1}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <Label>Rotation: {rotation}°</Label>
                <Slider
                  value={[rotation]}
                  onValueChange={(v) => setRotation(v[0])}
                  min={0}
                  max={360}
                  step={15}
                />
              </div>

              <div className="space-y-2">
                <Label>Position</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["top-left", "center", "top-right", "bottom-left", "bottom-right"].map((pos) => (
                    <Button
                      key={pos}
                      variant={position === pos ? "default" : "outline"}
                      onClick={() => setPosition(pos as typeof position)}
                      className="capitalize"
                    >
                      {pos.replace("-", " ")}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {pages.length > 0 && (
              <Card className="p-6 space-y-4">
                <Label className="text-lg font-semibold">Preview</Label>
                <p className="text-sm text-muted-foreground">
                  See how the watermark will appear on sample pages
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[0, Math.floor(pages.length / 2), pages.length - 1]
                    .filter((idx, i, arr) => arr.indexOf(idx) === i)
                    .map((pageIndex) => {
                      const page = pages[pageIndex];
                      const getPositionStyles = () => {
                        const baseStyle: React.CSSProperties = {
                          position: 'absolute',
                          transform: `rotate(${rotation}deg)`,
                          opacity: opacity,
                        };

                        switch (position) {
                          case 'center':
                            return { ...baseStyle, top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${rotation}deg)` };
                          case 'top-left':
                            return { ...baseStyle, top: '10%', left: '10%' };
                          case 'top-right':
                            return { ...baseStyle, top: '10%', right: '10%' };
                          case 'bottom-left':
                            return { ...baseStyle, bottom: '10%', left: '10%' };
                          case 'bottom-right':
                            return { ...baseStyle, bottom: '10%', right: '10%' };
                          default:
                            return baseStyle;
                        }
                      };

                      return (
                        <div key={pageIndex} className="space-y-2">
                          <div className="relative border-2 border-border rounded-lg overflow-hidden">
                            <img
                              src={page.thumbnail}
                              alt={`Preview page ${page.pageNumber}`}
                              className="w-full"
                            />
                            <div style={getPositionStyles()}>
                              {watermarkType === 'text' && watermarkText && (
                                <div
                                  style={{
                                    fontSize: `${fontSize * 0.5}px`,
                                    color: 'rgba(128, 128, 128, 1)',
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                                  }}
                                >
                                  {watermarkText}
                                </div>
                              )}
                              {watermarkType === 'image' && watermarkImagePreview && (
                                <img
                                  src={watermarkImagePreview}
                                  alt="Watermark preview"
                                  style={{
                                    maxWidth: `${watermarkSize * 0.5}px`,
                                    maxHeight: `${watermarkSize * 0.5}px`,
                                  }}
                                />
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-center text-muted-foreground">
                            Page {page.pageNumber}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </Card>
            )}

            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Select Pages to Watermark</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllPages}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllPages}>
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {pages.map((page, index) => (
                  <div
                    key={page.pageNumber}
                    className="relative cursor-pointer"
                    onClick={() => togglePageSelection(index)}
                  >
                    <div className={`border-2 rounded-lg overflow-hidden transition-all ${
                      page.selected ? "border-primary ring-2 ring-primary" : "border-border"
                    }`}>
                      <img
                        src={page.thumbnail}
                        alt={`Page ${page.pageNumber}`}
                        className="w-full"
                      />
                      <div className="absolute top-2 left-2">
                        <Checkbox checked={page.selected} />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded text-xs">
                        Page {page.pageNumber}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Button
              onClick={applyWatermark}
              disabled={isProcessing}
              className="w-full gradient-primary"
              size="lg"
            >
              <Download className="mr-2 h-5 w-5" />
              {isProcessing ? "Applying Watermark..." : "Download Watermarked PDF"}
            </Button>
          </>
        )}
      </div>
    </ToolPage>
  );
};

export default WatermarkPDF;
