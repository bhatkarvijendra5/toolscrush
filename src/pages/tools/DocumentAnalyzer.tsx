import { useState } from "react";
import ToolPage from "@/components/ToolPage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText, Camera } from "lucide-react";
import FileUploader from "@/components/FileUploader";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const DocumentAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [detectedLanguages, setDetectedLanguages] = useState<string[]>([]);
  const [outputFormat, setOutputFormat] = useState<string>("text");

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setExtractedText("");
      setDetectedLanguages([]);
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        setSelectedFile(target.files[0]);
        setExtractedText("");
        setDetectedLanguages([]);
      }
    };
    input.click();
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Please select or capture an image first");
      return;
    }

    setIsProcessing(true);
    try {
      const base64Image = await convertToBase64(selectedFile);

      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: { image: base64Image, outputFormat }
      });

      if (error) {
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          toast.error("Please sign in to use the Document Analyzer tool.");
          return;
        }
        throw error;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setExtractedText(data.text);
      setDetectedLanguages(data.languages || []);
      toast.success("Document analyzed successfully!");
    } catch (error) {
      console.error('Error analyzing document:', error);
      toast.error("Failed to analyze document. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!extractedText) {
      toast.error("No text to download");
      return;
    }

    const baseFileName = "pdftools-document-analyzer";

    try {
      if (outputFormat === "docx") {
        // Create DOCX with preserved formatting
        const lines = extractedText.split('\n');
        const paragraphs = lines.map(line => 
          new Paragraph({
            children: [new TextRun(line || " ")],
            spacing: { after: 200 }
          })
        );

        const doc = new Document({
          sections: [{
            properties: {},
            children: paragraphs
          }]
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ToolsCrush_${baseFileName}.docx`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Downloaded as DOCX");
        return;
      }

      if (outputFormat === "pdf") {
        // Create PDF with preserved formatting
        const pdfDoc = await PDFDocument.create();
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        
        const lines = extractedText.split('\n');
        const fontSize = 12;
        const lineHeight = fontSize * 1.5;
        const margin = 50;
        const pageWidth = 595; // A4 width
        const pageHeight = 842; // A4 height
        const maxWidth = pageWidth - (margin * 2);

        let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        let yPosition = pageHeight - margin;

        for (const line of lines) {
          if (yPosition < margin + lineHeight) {
            currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
            yPosition = pageHeight - margin;
          }

          // Handle empty lines
          if (!line.trim()) {
            yPosition -= lineHeight;
            continue;
          }

          // Simple word wrapping
          const words = line.split(' ');
          let currentLine = '';

          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const textWidth = timesRomanFont.widthOfTextAtSize(testLine, fontSize);

            if (textWidth > maxWidth && currentLine) {
              currentPage.drawText(currentLine, {
                x: margin,
                y: yPosition,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });
              yPosition -= lineHeight;
              currentLine = word;

              if (yPosition < margin + lineHeight) {
                currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
                yPosition = pageHeight - margin;
              }
            } else {
              currentLine = testLine;
            }
          }

          if (currentLine) {
            currentPage.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: fontSize,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });
            yPosition -= lineHeight;
          }
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ToolsCrush_${baseFileName}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Downloaded as PDF");
        return;
      }

      // Handle other formats
      let blob: Blob;
      let fileName: string;

      switch (outputFormat) {
        case "excel":
          const csvContent = extractedText.split('\n').map(line => `"${line.replace(/"/g, '""')}"`).join('\n');
          blob = new Blob([csvContent], { type: 'text/csv' });
          fileName = `ToolsCrush_${baseFileName}.csv`;
          break;
        default:
          blob = new Blob([extractedText], { type: 'text/plain' });
          fileName = `ToolsCrush_${baseFileName}.txt`;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded as ${outputFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error("Failed to create document. Please try again.");
    }
  };

  return (
    <ToolPage
      title="AI Document Analyzer"
      description="Scan and clean handwritten notes, extract text with OCR, and download as DOCX/PDF with preserved layout"
    >
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="outputFormat" className="mb-2 block">
              Output Format
            </Label>
            <Select value={outputFormat} onValueChange={setOutputFormat}>
              <SelectTrigger id="outputFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text File (.txt)</SelectItem>
                <SelectItem value="docx">Word Document (.docx)</SelectItem>
                <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
                <SelectItem value="excel">Excel/CSV (.csv)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={handleCameraCapture}
                variant="outline"
                className="flex-1"
              >
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>
            </div>

            <FileUploader
              accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'] }}
              maxFiles={1}
              onFilesSelected={handleFileSelect}
              acceptedFileTypes="Images (PNG, JPG, JPEG, GIF, WEBP, BMP)"
            />
          </div>

          {selectedFile && (
            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
              </div>
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Selected document"
                className="max-h-96 w-full rounded object-contain"
              />
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={!selectedFile || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Document"
            )}
          </Button>

          {extractedText && (
            <div className="space-y-4">
              {detectedLanguages.length > 0 && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <Label className="mb-2 block text-sm font-semibold">
                    Detected Languages:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {detectedLanguages.map((lang, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-lg border p-4">
                <Label className="mb-2 block">Extracted Text:</Label>
                <div className="max-h-96 overflow-y-auto rounded bg-muted p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {extractedText}
                  </pre>
                </div>
              </div>

              <Button onClick={handleDownload} className="w-full">
                Download as {outputFormat.toUpperCase()}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </ToolPage>
  );
};

export default DocumentAnalyzer;
