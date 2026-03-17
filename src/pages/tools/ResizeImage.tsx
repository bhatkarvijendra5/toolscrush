import { useState, useEffect, useRef } from "react";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";

const ResizeImage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(100);
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);
  const [resizeMode, setResizeMode] = useState<"dimensions" | "percentage">("dimensions");
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<"image/jpeg" | "image/png">("image/jpeg");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (file) {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setWidth(img.width);
        setHeight(img.height);
        generatePreview(img, img.width, img.height);
      };
      img.src = URL.createObjectURL(file);
    }
  }, [file]);

  useEffect(() => {
    if (originalImage && resizeMode === "percentage") {
      const newWidth = Math.round(originalImage.width * (percentage / 100));
      const newHeight = Math.round(originalImage.height * (percentage / 100));
      setWidth(newWidth);
      setHeight(newHeight);
      generatePreview(originalImage, newWidth, newHeight);
    }
  }, [percentage, resizeMode, originalImage]);

  useEffect(() => {
    if (originalImage && resizeMode === "dimensions") {
      generatePreview(originalImage, width, height);
    }
  }, [width, height, resizeMode, originalImage]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleWidthChange = (value: number) => {
    if (!originalImage) return;
    
    setWidth(value);
    if (keepAspectRatio) {
      const aspectRatio = originalImage.width / originalImage.height;
      setHeight(Math.round(value / aspectRatio));
    }
    setResizeMode("dimensions");
  };

  const handleHeightChange = (value: number) => {
    if (!originalImage) return;
    
    setHeight(value);
    if (keepAspectRatio) {
      const aspectRatio = originalImage.width / originalImage.height;
      setWidth(Math.round(value * aspectRatio));
    }
    setResizeMode("dimensions");
  };

  const handlePercentageChange = (value: number) => {
    setPercentage(value);
    setResizeMode("percentage");
  };

  const generatePreview = (img: HTMLImageElement, newWidth: number, newHeight: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      setPreviewUrl(canvas.toDataURL(outputFormat, 0.95));
    }
  };

  const handleDownload = async () => {
    if (!originalImage || !canvasRef.current) return;

    setIsProcessing(true);
    try {
      const canvas = canvasRef.current;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(originalImage, 0, 0, width, height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create blob"));
          },
          outputFormat,
          0.95
        );
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = file?.name.replace(/\.[^/.]+$/, "") || "resized-image";
      const extension = outputFormat === "image/jpeg" ? "jpg" : "png";
      link.download = `ToolsCrush_${fileName}-${width}x${height}.${extension}`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`Image resized successfully to ${width}x${height}px!`);
    } catch (error) {
      console.error("Error resizing image:", error);
      toast.error("Failed to resize image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPage
      title="Resize Images"
      description="Change image dimensions while maintaining quality"
    >
      <div className="space-y-6">
        <FileUploader
          accept={{
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
          }}
          acceptedFileTypes="JPG, PNG, JPEG"
          maxFiles={1}
          onFilesSelected={handleFilesSelected}
        />

        {file && originalImage && (
          <Card className="space-y-6 p-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold">Original Size</h3>
              <p className="text-muted-foreground">
                {originalImage.width} x {originalImage.height} pixels
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="aspect-ratio">Keep Aspect Ratio</Label>
                <Switch
                  id="aspect-ratio"
                  checked={keepAspectRatio}
                  onCheckedChange={setKeepAspectRatio}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="width">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    min="1"
                    value={width}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    min="1"
                    value={height}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentage">Resize by Percentage</Label>
                <Input
                  id="percentage"
                  type="number"
                  min="1"
                  max="500"
                  value={percentage}
                  onChange={(e) => handlePercentageChange(Number(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Scale image by {percentage}%
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Output Format</Label>
                <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value as "image/jpeg" | "image/png")}>
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image/jpeg">JPG</SelectItem>
                    <SelectItem value="image/png">PNG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {previewUrl && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Preview</h3>
                <div className="max-h-96 overflow-auto rounded-lg border border-border bg-muted p-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mx-auto max-w-full"
                    style={{ maxHeight: "350px" }}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  New size: {width} x {height} pixels
                </p>
              </div>
            )}

            <Button
              onClick={handleDownload}
              disabled={isProcessing || !width || !height}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Resized Image
                </>
              )}
            </Button>
          </Card>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolPage>
  );
};

export default ResizeImage;
