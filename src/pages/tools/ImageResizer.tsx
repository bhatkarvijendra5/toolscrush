import { useState, useCallback } from "react";
import ToolPage from "@/components/ToolPage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, Loader2, X, ImageIcon, Shield } from "lucide-react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  compressedBlob?: Blob;
  compressedSize?: number;
  compressedPreview?: string;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
};

const compressToTarget = (file: File, targetKB: number): Promise<{ blob: Blob; preview: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0);

      const targetBytes = targetKB * 1024;
      const mime = file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";

      // For PNG, try scaling down since PNG doesn't support quality param well
      if (mime === "image/png") {
        let scale = 1;
        while (scale > 0.1) {
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * scale);
          c.height = Math.round(img.height * scale);
          const cx = c.getContext("2d")!;
          cx.imageSmoothingEnabled = true;
          cx.imageSmoothingQuality = "high";
          cx.drawImage(img, 0, 0, c.width, c.height);
          const blob = await new Promise<Blob | null>((r) => c.toBlob(r, mime));
          if (blob && blob.size <= targetBytes) {
            resolve({ blob, preview: URL.createObjectURL(blob) });
            return;
          }
          scale -= 0.05;
        }
        // Return best effort
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * 0.1);
        c.height = Math.round(img.height * 0.1);
        const cx = c.getContext("2d")!;
        cx.drawImage(img, 0, 0, c.width, c.height);
        const blob = await new Promise<Blob | null>((r) => c.toBlob(r, mime));
        if (blob) resolve({ blob, preview: URL.createObjectURL(blob) });
        else reject(new Error("Compression failed"));
        return;
      }

      // For JPEG/WEBP, binary search on quality
      let lo = 0.01, hi = 1.0, bestBlob: Blob | null = null;
      for (let i = 0; i < 15; i++) {
        const mid = (lo + hi) / 2;
        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, mime, mid));
        if (!blob) break;
        bestBlob = blob;
        if (blob.size > targetBytes) hi = mid;
        else lo = mid;
      }

      // If still too large, also scale down
      if (bestBlob && bestBlob.size > targetBytes) {
        let scale = 0.9;
        while (scale > 0.1) {
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * scale);
          c.height = Math.round(img.height * scale);
          const cx = c.getContext("2d")!;
          cx.imageSmoothingEnabled = true;
          cx.imageSmoothingQuality = "high";
          cx.drawImage(img, 0, 0, c.width, c.height);
          const blob = await new Promise<Blob | null>((r) => c.toBlob(r, mime, lo));
          if (blob && blob.size <= targetBytes) {
            bestBlob = blob;
            break;
          }
          scale -= 0.05;
        }
      }

      if (bestBlob) {
        resolve({ blob: bestBlob, preview: URL.createObjectURL(bestBlob) });
      } else {
        reject(new Error("Compression failed"));
      }
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

const ImageResizer = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [targetKB, setTargetKB] = useState(200);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages: ImageFile[] = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      originalSize: file.size,
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 20,
  });

  const handleCompress = async () => {
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    setIsProcessing(true);
    setProgress(0);
    try {
      const results: ImageFile[] = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const { blob, preview } = await compressToTarget(img.file, targetKB);
        results.push({
          ...img,
          compressedBlob: blob,
          compressedSize: blob.size,
          compressedPreview: preview,
        });
        setProgress(Math.round(((i + 1) / images.length) * 100));
      }
      setImages(results);
      toast.success(`Compressed ${results.length} image(s) successfully!`);
    } catch {
      toast.error("Failed to compress images");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (img: ImageFile) => {
    if (!img.compressedBlob) return;
    const ext = img.file.name.match(/\.[^/.]+$/)?.[0] || ".jpg";
    const name = `ToolsCrush_${img.file.name.replace(/\.[^/.]+$/, "")}_compressed${ext}`;
    const url = URL.createObjectURL(img.compressedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    images.filter((i) => i.compressedBlob).forEach(downloadFile);
    toast.success("All files downloaded");
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  const hasCompressed = images.some((i) => i.compressedBlob);

  return (
    <ToolPage
      title="Image Size Reducer"
      description="Compress images from MB to KB — fast, simple, and entirely in your browser. No uploads to any server."
      keywords="reduce image size, compress image to KB, image compressor, reduce file size, image size reducer online"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Upload */}
        <Card
          {...getRootProps()}
          className={`cursor-pointer border-2 border-dashed p-8 md:p-12 text-center transition-all ${
            isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-3">
            <div className="rounded-full bg-primary/10 p-5">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-semibold">Drop your images here, or click to browse</p>
            <p className="text-sm text-muted-foreground">JPG, PNG, WEBP supported</p>
          </div>
        </Card>

        {images.length > 0 && (
          <>
            {/* Target Size */}
            <Card className="p-5">
              <label className="text-sm font-medium mb-2 block">Target Size (KB)</label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={10}
                  max={5000}
                  value={targetKB}
                  onChange={(e) => setTargetKB(Math.max(10, parseInt(e.target.value) || 10))}
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">KB</span>
                <div className="flex gap-2 ml-auto flex-wrap">
                  {[50, 100, 200, 500].map((v) => (
                    <Button
                      key={v}
                      size="sm"
                      variant={targetKB === v ? "default" : "outline"}
                      onClick={() => setTargetKB(v)}
                      className="text-xs"
                    >
                      {v} KB
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* File List */}
            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-semibold">{images.length} image(s)</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {images.map((img) => (
                  <div key={img.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <img src={img.compressedPreview || img.preview} alt="" className="h-12 w-12 rounded object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{img.file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatSize(img.originalSize)}</span>
                        {img.compressedSize != null && (
                          <>
                            <span>→</span>
                            <span className="text-primary font-semibold">{formatSize(img.compressedSize)}</span>
                            <span className="text-primary font-semibold">
                              ({Math.round((1 - img.compressedSize / img.originalSize) * 100)}% smaller)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {img.compressedBlob && (
                      <Button variant="outline" size="sm" onClick={() => downloadFile(img)}>
                        <Download className="h-3.5 w-3.5 mr-1" /> Download
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeImage(img.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">Compressing... {progress}%</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleCompress}
                disabled={isProcessing}
                className="flex-1"
                size="lg"
              >
                {isProcessing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Compressing...</>
                ) : (
                  <><ImageIcon className="h-4 w-4 mr-2" /> Compress Images</>
                )}
              </Button>
              {hasCompressed && (
                <Button onClick={downloadAll} variant="outline" size="lg" className="flex-1">
                  <Download className="h-4 w-4 mr-2" /> Download All
                </Button>
              )}
            </div>
          </>
        )}

        {/* Privacy Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-4">
          <Shield className="h-4 w-4" />
          <span>Images are processed in your browser and not uploaded to any server</span>
        </div>
      </div>
    </ToolPage>
  );
};

export default ImageResizer;
