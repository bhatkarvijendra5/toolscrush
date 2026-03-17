import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import FileUploader from "@/components/FileUploader";
import ToolPage from "@/components/ToolPage";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lock, LockOpen } from "lucide-react";

const UnlockPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setPassword("");
    } else {
      setFile(null);
    }
  };

  const handleUnlock = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF file first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        try {
          const base64String = (reader.result as string).split(",")[1];

          // Call the unlock-pdf edge function
          const { data, error } = await supabase.functions.invoke("unlock-pdf", {
            body: {
              pdfBase64: base64String,
              password: password || null,
              fileName: file.name,
            },
          });

          if (error) {
            console.error("Edge function error:", error);
            throw new Error(error.message || "Failed to unlock PDF");
          }

          if (data.error) {
            throw new Error(data.error);
          }

          // Convert base64 back to blob and trigger download
          const binaryString = atob(data.pdfBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: "application/pdf" });

          // Create download link
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `ToolsCrush_${data.fileName}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          toast({
            title: "PDF Unlocked Successfully!",
            description: `Your unlocked PDF has been downloaded.`,
          });

          // Reset form
          setFile(null);
          setPassword("");
        } catch (error) {
          console.error("Unlock error:", error);
          toast({
            title: "Unlock Failed",
            description: error instanceof Error ? error.message : "Failed to unlock PDF. Please check the password and try again.",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      };

      reader.onerror = () => {
        setIsProcessing(false);
        toast({
          title: "File Read Error",
          description: "Failed to read the PDF file.",
          variant: "destructive",
        });
      };
    } catch (error) {
      setIsProcessing(false);
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const howToSteps = [
    {
      name: "Upload your password-protected PDF file",
      text: "Click or drag to upload the locked PDF you want to unlock",
    },
    {
      name: "Enter the password",
      text: "Provide the password required to unlock the PDF (if needed)",
    },
    {
      name: "Click 'Unlock & Download'",
      text: "Process the PDF and download the unlocked version",
    },
    {
      name: "Save your unlocked PDF",
      text: "Your unlocked PDF will be downloaded automatically",
    },
  ];

  return (
    <ToolPage
      title="Unlock PDF"
      description="Remove password protection from your PDF files. Upload a locked PDF, enter the password, and download the unlocked version."
      keywords="unlock PDF, remove PDF password, PDF password remover, decrypt PDF, unlock encrypted PDF"
      canonicalUrl="https://toolhub.com/tools/unlock-pdf"
      howToSteps={howToSteps}
    >
      <div className="space-y-6">
        <FileUploader
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          acceptedFileTypes="PDF"
        />

        {file && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="h-5 w-5" />
              <span className="text-sm font-medium">{file.name}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password (if required)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter PDF password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank if the PDF is not password-protected or to attempt unlocking without a password
              </p>
            </div>

            <Button
              onClick={handleUnlock}
              disabled={isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unlocking PDF...
                </>
              ) : (
                <>
                  <LockOpen className="mr-2 h-4 w-4" />
                  Unlock & Download
                </>
              )}
            </Button>
          </Card>
        )}
      </div>
    </ToolPage>
  );
};

export default UnlockPDF;
