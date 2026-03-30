import { useState } from "react";
import { toolSeoData } from "@/data/toolSeoData";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2, GripVertical, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PDFDocument } from "pdf-lib";

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

const JPGToPDF = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFilesSelected = (files: File[]) => {
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) URL.revokeObjectURL(image.preview);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleConvert = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const image of images) {
        const arrayBuffer = await image.file.arrayBuffer();
        let embeddedImage;

        if (image.file.type === "image/jpeg" || image.file.type === "image/jpg") {
          embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
        } else if (image.file.type === "image/png") {
          embeddedImage = await pdfDoc.embedPng(arrayBuffer);
        } else {
          // Convert other formats to PNG using canvas
          const img = await createImageBitmap(image.file);
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), "image/png");
          });
          
          const pngArrayBuffer = await blob.arrayBuffer();
          embeddedImage = await pdfDoc.embedPng(pngArrayBuffer);
        }

        const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ToolsCrush_converted-images-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Conversion Complete",
        description: `${images.length} image${images.length > 1 ? "s" : ""} converted to PDF successfully.`,
      });
    } catch (error) {
      console.error("Error converting images:", error);
      toast({
        title: "Error",
        description: "Failed to convert images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPage
      title="JPG to PDF"
      description="Convert JPG images to a single PDF document"
    >
      <div className="space-y-6">
        <FileUploader
          accept={{
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "image/webp": [".webp"],
          }}
          maxFiles={50}
          onFilesSelected={handleFilesSelected}
          acceptedFileTypes="JPG, PNG, WEBP"
        />

        {images.length > 0 && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Images</h3>
                  <p className="text-sm text-muted-foreground">
                    {images.length} image{images.length > 1 ? "s" : ""} • Drag to reorder
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    images.forEach((img) => URL.revokeObjectURL(img.preview));
                    setImages([]);
                  }}
                >
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative border rounded-lg overflow-hidden cursor-move transition-all ${
                      draggedIndex === index ? "opacity-50 scale-95" : ""
                    }`}
                  >
                    <img
                      src={image.preview}
                      alt={`Image ${index + 1}`}
                      className="w-full h-auto"
                    />
                    <div className="absolute top-2 left-2 bg-background/90 px-2 py-1 rounded flex items-center gap-1">
                      <GripVertical className="h-3 w-3" />
                      <span className="text-xs font-medium">{index + 1}</span>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => removeImage(image.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleConvert}
                disabled={isProcessing}
                size="lg"
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Converting to PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download as PDF ({images.length} image{images.length > 1 ? "s" : ""})
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

export default JPGToPDF;
