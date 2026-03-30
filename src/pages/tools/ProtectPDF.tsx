import { useState } from "react";
import { toolSeoData } from "@/data/toolSeoData";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Lock, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const ProtectPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) {
      setFile(null);
      return;
    }
    setFile(files[0]);
  };

  const handleProtect = async () => {
    if (!file || !password) {
      toast({
        title: "Missing Information",
        description: "Please upload a PDF and enter a password.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 4) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 4 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Convert file to base64 for edge function
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      const { data, error } = await supabase.functions.invoke("protect-pdf", {
        body: { 
          pdfBase64: base64,
          password: password,
          fileName: file.name 
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to protect PDF");
      }

      if (!data || !data.pdfBase64) {
        throw new Error("No PDF data received from server");
      }

      // Convert base64 back to blob
      const binaryString = atob(data.pdfBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ToolsCrush_protected-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Protected",
        description: "Your PDF is now password-protected and ready to download.",
      });

      // Reset form
      setFile(null);
      setPassword("");
    } catch (error) {
      console.error("Error protecting PDF:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to protect PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const howToSteps = [
    {
      name: "Upload PDF",
      text: "Select and upload the PDF file you want to protect with a password."
    },
    {
      name: "Set Password",
      text: "Enter a strong password (minimum 4 characters) that will be required to open the PDF file."
    },
    {
      name: "Protect and Download",
      text: "Click 'Protect & Download' to encrypt your PDF and download the password-protected file."
    }
  ];

  const seo = (await import("@/data/toolSeoData")).toolSeoData["protect-pdf"];

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
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your PDF will be encrypted with industry-standard protection. The password will be required to open the file.
          </AlertDescription>
        </Alert>

        <FileUploader
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          acceptedFileTypes="PDF"
        />

        {file && (
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Set Password</h3>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password (min. 4 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isProcessing}
                  />
                  <p className="text-sm text-muted-foreground">
                    This password will be required to open the PDF file.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleProtect}
                disabled={isProcessing || !password}
                size="lg"
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Protecting...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Protect & Download
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

export default ProtectPDF;
