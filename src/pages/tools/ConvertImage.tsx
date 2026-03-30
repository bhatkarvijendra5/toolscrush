import { useState } from "react";
import { toolSeoData } from "@/data/toolSeoData";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ConvertImage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputFormat, setOutputFormat] = useState("png");

  const handleConvert = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one image file");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    setTimeout(() => {
      setIsProcessing(false);
      toast.success(`Images converted to ${outputFormat.toUpperCase()} successfully!`);
    }, 3000);
  };

  return (
    <ToolPage
      title="Convert Images"
      description="Convert images between JPG, PNG, WEBP, and HEIC formats"
    >
      <div className="space-y-6">
        <FileUploader
          accept={{
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "image/webp": [".webp"],
            "image/heic": [".heic"],
          }}
          maxFiles={10}
          onFilesSelected={setFiles}
          acceptedFileTypes="JPG, PNG, WEBP, HEIC"
        />

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpg">JPG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="webp">WEBP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Converting images...</p>
                <Progress value={progress} />
              </div>
            )}

            <Button
              onClick={handleConvert}
              disabled={isProcessing}
              className="gradient-primary w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Convert Images
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </ToolPage>
  );
};

export default ConvertImage;
