import { useState } from "react";
import { toolSeoData } from "@/data/toolSeoData";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { supabase } from "@/integrations/supabase/client";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const PDFToWord = () => {
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
        useSystemFonts: true,
      }).promise;

      const paragraphs: Paragraph[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        // Add page header
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Page ${i}`,
                bold: true,
                size: 28,
              }),
            ],
            spacing: { before: 240, after: 120 },
          })
        );

        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Check if page has minimal text (likely scanned/image-based)
        const textItems = textContent.items as any[];
        const totalText = textItems.map(item => item.str).join("").trim();
        
        let pageText = "";

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
                  body: { image: imageDataUrl, outputFormat: "word" }
                }
              );

              if (ocrError) throw ocrError;
              
              if (ocrData?.text) {
                pageText = ocrData.text;
                console.log(`OCR extracted ${pageText.length} characters from page ${i}`);
              }
            } catch (ocrError) {
              console.error(`OCR failed for page ${i}:`, ocrError);
              // Fall back to whatever text was available
              pageText = totalText;
            }
          }
        } else {
          // Extract text normally
          let lastY = null;
          let lineText = "";

          for (const item of textItems) {
            const currentY = (item as any).transform[5];
            
            if (lastY !== null && Math.abs(currentY - lastY) > 5) {
              if (lineText.trim()) {
                pageText += lineText.trim() + "\n";
              }
              lineText = "";
            }
            lineText += item.str + " ";
            lastY = currentY;
          }

          if (lineText.trim()) {
            pageText += lineText.trim();
          }
        }

        // Add extracted text as paragraphs
        if (pageText.trim()) {
          const lines = pageText.split("\n").filter(line => line.trim());
          for (const line of lines) {
            paragraphs.push(
              new Paragraph({
                children: [new TextRun(line.trim())],
                spacing: { after: 120 },
              })
            );
          }
        }
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ToolsCrush_${file.name.replace(".pdf", ".docx")}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Conversion Complete",
        description: "PDF converted to Word document successfully.",
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

  const howToSteps = [
    {
      name: "Upload PDF Document",
      text: "Click or drag and drop your PDF file into the upload area. The tool supports both text-based and scanned PDFs with OCR capability."
    },
    {
      name: "Review Document",
      text: "Once uploaded, you'll see the file name and size. The tool will prepare to extract text and formatting from your PDF."
    },
    {
      name: "Convert to Word",
      text: "Click the 'Convert to Word' button. The tool will extract text from each page, perform OCR on scanned pages if needed, and format it into a Word document."
    },
    {
      name: "Download DOCX File",
      text: "Your converted Word document (.docx) will automatically download. You can now edit the text in Microsoft Word or any compatible word processor."
    }
  ];

  const seo = (await import("@/data/toolSeoData")).toolSeoData["pdf-to-word"];

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
                    Convert to Word
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

export default PDFToWord;
