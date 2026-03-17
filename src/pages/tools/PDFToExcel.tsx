import { useState } from "react";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";
import { supabase } from "@/integrations/supabase/client";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const PDFToExcel = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) {
      setFile(null);
      return;
    }
    setFile(files[0]);
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useSystemFonts: true 
      }).promise;
      
      let csvContent = "Page,Row,Content\n";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const textItems = textContent.items as any[];
        const totalText = textItems.map(item => item.str).join("").trim();
        
        let rowIndex = 1;
        
        if (totalText.length < 50) {
          // Likely a scanned page or image-based PDF, use OCR
          console.log(`Page ${i} has minimal text, using OCR...`);
          
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          
          if (context) {
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            await page.render({
              canvasContext: context,
              viewport: viewport,
            }).promise;
            
            const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
            
            try {
              const { data: ocrData, error: ocrError } = await supabase.functions.invoke(
                "analyze-document",
                {
                  body: { image: imageDataUrl, outputFormat: "excel" }
                }
              );

              if (ocrError) throw ocrError;
              
              if (ocrData?.text) {
                const lines = ocrData.text.split("\n").filter(line => line.trim());
                for (const line of lines) {
                  const escapedContent = `"${line.trim().replace(/"/g, '""')}"`;
                  csvContent += `${i},${rowIndex},${escapedContent}\n`;
                  rowIndex++;
                }
              }
            } catch (ocrError) {
              console.error(`OCR failed for page ${i}:`, ocrError);
            }
          }
        } else {
          // Extract text normally
          let lastY = null;
          let currentRow: string[] = [];
          
          for (const item of textItems) {
            const currentY = (item as any).transform[5];
            
            if (lastY !== null && Math.abs(currentY - lastY) > 5) {
              if (currentRow.length > 0) {
                const escapedContent = currentRow
                  .map(cell => `"${cell.replace(/"/g, '""')}"`)
                  .join(",");
                csvContent += `${i},${rowIndex},${escapedContent}\n`;
                rowIndex++;
                currentRow = [];
              }
            }
            
            currentRow.push(item.str.trim());
            lastY = currentY;
          }
          
          if (currentRow.length > 0) {
            const escapedContent = currentRow
              .map(cell => `"${cell.replace(/"/g, '""')}"`)
              .join(",");
            csvContent += `${i},${rowIndex},${escapedContent}\n`;
          }
        }
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ToolsCrush_${file.name.replace(".pdf", ".csv")}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Conversion Complete",
        description: "Tables and data extracted to CSV. Open in Excel or spreadsheet apps.",
      });
    } catch (error) {
      console.error("Error converting PDF:", error);
      toast({
        title: "Error",
        description: "Failed to convert PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPage
      title="PDF to Excel"
      description="Extract tables and data from PDF to CSV format"
    >
      <div className="space-y-6">
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
                <h3 className="text-lg font-semibold mb-2">Ready to Convert</h3>
                <p className="text-sm text-muted-foreground">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
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
                    Converting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Convert to CSV
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

export default PDFToExcel;
