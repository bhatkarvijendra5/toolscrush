import { useState } from "react";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CompressImage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState("80");

  const handleCompress = async () => {
    if (files.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsProcessing(true);

    try {
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          return new Promise<{ blob: Blob; name: string }>((resolve) => {
            const img = new Image();
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d")!;

            img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);

              canvas.toBlob(
                (blob) => {
                  resolve({
                    blob: blob!,
                    name: `ToolsCrush_${file.name.replace(/\.[^/.]+$/, "_compressed.jpg")}`,
                  });
                },
                "image/jpeg",
                parseInt(quality) / 100
              );
            };

            img.src = URL.createObjectURL(file);
          });
        })
      );

      // Download all compressed files
      compressedFiles.forEach(({ blob, name }) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });

      toast.success(`Successfully compressed ${files.length} image(s)`);
    } catch (error) {
      console.error("Error compressing images:", error);
      toast.error("Failed to compress images");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPage
      title="Compress Images"
      description="Reduce image file size while maintaining quality. Perfect for web optimization and faster loading times."
      keywords="compress image, reduce image size, optimize images, image compression, web optimization"
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
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Compression Quality</label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">Low (60%) - Smaller file size</SelectItem>
                <SelectItem value="80">Medium (80%) - Balanced</SelectItem>
                <SelectItem value="90">High (90%) - Better quality</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {files.length} image(s) selected
            </p>
            {files.map((file, index) => (
              <p key={index} className="text-sm">
                {file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            ))}
          </div>

          <Button
            onClick={handleCompress}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Compressing...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Compress & Download
              </>
            )}
          </Button>
        </Card>
      )}
    </ToolPage>
  );
};

export default CompressImage;
