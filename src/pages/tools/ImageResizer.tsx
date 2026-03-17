import { useState, useEffect, useRef } from "react";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const ImageResizer = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scalePercent, setScalePercent] = useState(50);
  const [outputFormat, setOutputFormat] = useState("jpeg");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (files.length === 0) {
      setPreviewUrl(null);
      setOriginalDimensions(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({ w: img.width, h: img.height });
    };
    img.src = URL.createObjectURL(files[0]);
    return () => URL.revokeObjectURL(img.src);
  }, [files]);

  const newWidth = originalDimensions ? Math.round(originalDimensions.w * scalePercent / 100) : 0;
  const newHeight = originalDimensions ? Math.round(originalDimensions.h * scalePercent / 100) : 0;

  const handleResize = async () => {
    if (files.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    setIsProcessing(true);
    try {
      const results = await Promise.all(
        files.map(
          (file) =>
            new Promise<{ blob: Blob; name: string }>((resolve, reject) => {
              const img = new Image();
              img.onload = () => {
                const w = Math.round(img.width * scalePercent / 100);
                const h = Math.round(img.height * scalePercent / 100);
                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext("2d")!;
                ctx.drawImage(img, 0, 0, w, h);
                const mime = outputFormat === "png" ? "image/png" : "image/jpeg";
                const ext = outputFormat === "png" ? ".png" : ".jpg";
                canvas.toBlob(
                  (blob) => {
                    if (!blob) return reject(new Error("Failed to create blob"));
                    resolve({
                      blob,
                      name: file.name.replace(/\.[^/.]+$/, `_resized${ext}`),
                    });
                  },
                  mime,
                  0.9
                );
                URL.revokeObjectURL(img.src);
              };
              img.onerror = () => reject(new Error("Failed to load image"));
              img.src = URL.createObjectURL(file);
            })
        )
      );

      results.forEach(({ blob, name }) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });

      toast.success(`Successfully resized ${files.length} image(s)`);
    } catch (error) {
      console.error("Error resizing images:", error);
      toast.error("Failed to resize images");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPage
      title="Image Resizer"
      description="Reduce your image file size by scaling down dimensions. Perfect for sharing, uploading, and saving storage space."
      keywords="image resizer, reduce image size, scale image, shrink image, resize image online"
    >
      <FileUploader
        onFilesSelected={setFiles}
        accept={{
          "image/jpeg": [".jpg", ".jpeg"],
          "image/png": [".png"],
          "image/webp": [".webp"],
        }}
        acceptedFileTypes="JPG, PNG, WEBP images"
        maxFiles={10}
      />

      {files.length > 0 && (
        <Card className="p-6 space-y-5">
          {originalDimensions && (
            <div className="text-sm text-muted-foreground">
              Original: {originalDimensions.w} × {originalDimensions.h}px → New: {newWidth} × {newHeight}px
            </div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-medium">
              Scale: {scalePercent}%
            </label>
            <Slider
              value={[scalePercent]}
              onValueChange={(v) => setScalePercent(v[0])}
              min={10}
              max={100}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Output Format</label>
            <Select value={outputFormat} onValueChange={setOutputFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jpeg">JPG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {files.length} image(s) selected
            </p>
            {files.map((file, i) => (
              <p key={i} className="text-sm">
                {file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            ))}
          </div>

          <Button onClick={handleResize} disabled={isProcessing} className="w-full" size="lg">
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resizing...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Resize & Download
              </>
            )}
          </Button>
        </Card>
      )}
    </ToolPage>
  );
};

export default ImageResizer;
