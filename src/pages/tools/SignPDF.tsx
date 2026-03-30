import { useState, useRef, useEffect } from "react";
import { toolSeoData } from "@/data/toolSeoData";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2, Pen, Upload, Camera, Trash2, RotateCw, Save, GripVertical, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pipeline, env } from '@huggingface/transformers';
import { supabase } from "@/integrations/supabase/client";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

interface Signature {
  id: string;
  dataUrl: string;
  name: string;
}

interface PlacedSignature {
  id: string;
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  page: number;
}

const SignPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [placedSignatures, setPlacedSignatures] = useState<PlacedSignature[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#000000");
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null);
  const [draggingSignature, setDraggingSignature] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingSignature, setResizingSignature] = useState<{ id: string; handle: string } | null>(null);
  const [resizeStartData, setResizeStartData] = useState<{ x: number; y: number; width: number; height: number; mouseX: number; mouseY: number } | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [signingStatus, setSigningStatus] = useState<'idle' | 'signing' | 'success' | 'error'>('idle');
  const [signingError, setSigningError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Load saved signatures from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pdf-signatures");
    if (saved) {
      try {
        setSignatures(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load signatures:", e);
      }
    }
  }, []);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) {
      setFile(null);
      setPdfPages([]);
      setPlacedSignatures([]);
      return;
    }

    const selectedFile = files[0];

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
      }).promise;
      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          console.warn(`Failed to get context for page ${i}`);
          continue;
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        pages.push(canvas.toDataURL("image/png"));
      }

      if (pages.length === 0) {
        throw new Error("No pages could be rendered from the PDF");
      }

      setPdfPages(pages);
      setCurrentPage(0);
      toast({
        title: "PDF Loaded",
        description: `${pdf.numPages} pages ready for signing`,
      });
    } catch (error: any) {
      console.error("Error loading PDF:", error);
      let errorMessage = "Failed to load PDF. Please try again.";

      if (error.message?.includes("Invalid PDF")) {
        errorMessage = "This PDF file appears to be corrupted or invalid.";
      } else if (error.message?.includes("password")) {
        errorMessage = "This PDF is password protected. Please remove the password first.";
      } else if (error.name === "PasswordException") {
        errorMessage = "This PDF is password protected. Please use an unprotected PDF.";
      }

      toast({
        title: "Error Loading PDF",
        description: errorMessage,
        variant: "destructive",
      });
      setFile(null);
      setPdfPages([]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Drawing signature functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawnSignature = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const newSig: Signature = {
      id: Date.now().toString(),
      dataUrl,
      name: `Drawn Signature ${signatures.length + 1}`,
    };

    const updated = [...signatures, newSig];
    setSignatures(updated);
    localStorage.setItem("pdf-signatures", JSON.stringify(updated));
    clearDrawing();
    toast({
      title: "Signature Saved",
      description: "Your drawn signature has been saved",
    });
  };

  // Background removal
  const removeBackground = async (imageDataUrl: string): Promise<string> => {
    setIsRemovingBg(true);
    try {
      const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
        device: 'webgpu',
      });

      const result = await segmenter(imageDataUrl);

      if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
        throw new Error('Invalid segmentation result');
      }

      // Create canvas to process image
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageDataUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not get canvas context');

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Apply inverted mask to alpha channel
      for (let i = 0; i < result[0].mask.data.length; i++) {
        const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
        data[i * 4 + 3] = alpha;
      }

      ctx.putImageData(imageData, 0, 0);
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error removing background:", error);
      toast({
        title: "Background Removal Failed",
        description: "Using original image instead",
        variant: "destructive",
      });
      
      // Convert to PNG even if background removal fails
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageDataUrl;
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL("image/png");
      }
      
      return imageDataUrl;
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleUploadSignature = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const processedDataUrl = await removeBackground(dataUrl);

      const newSig: Signature = {
        id: Date.now().toString(),
        dataUrl: processedDataUrl,
        name: `Uploaded Signature ${signatures.length + 1}`,
      };

      const updated = [...signatures, newSig];
      setSignatures(updated);
      localStorage.setItem("pdf-signatures", JSON.stringify(updated));
      toast({
        title: "Signature Uploaded",
        description: "Background removed and signature saved",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCameraSignature = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const processedDataUrl = await removeBackground(dataUrl);

      const newSig: Signature = {
        id: Date.now().toString(),
        dataUrl: processedDataUrl,
        name: `Scanned Signature ${signatures.length + 1}`,
      };

      const updated = [...signatures, newSig];
      setSignatures(updated);
      localStorage.setItem("pdf-signatures", JSON.stringify(updated));
      toast({
        title: "Signature Scanned",
        description: "Background removed and signature saved",
      });
    };
    reader.readAsDataURL(file);
  };

  const deleteSignature = (id: string) => {
    const updated = signatures.filter((sig) => sig.id !== id);
    setSignatures(updated);
    localStorage.setItem("pdf-signatures", JSON.stringify(updated));
    toast({
      title: "Signature Deleted",
      description: "Signature removed from library",
    });
  };

  // Place signature on page
  const placeSignature = (signatureId: string) => {
    const signature = signatures.find((sig) => sig.id === signatureId);
    if (!signature) return;

    const newPlaced: PlacedSignature = {
      id: `${Date.now()}-${Math.random()}`,
      dataUrl: signature.dataUrl,
      x: 100,
      y: 100,
      width: 150,
      height: 75,
      rotation: 0,
      page: currentPage,
    };

    setPlacedSignatures([...placedSignatures, newPlaced]);
  };

  const applyToAllPages = (signatureId: string) => {
    const signature = signatures.find((sig) => sig.id === signatureId);
    if (!signature) return;

    const newPlaced: PlacedSignature[] = pdfPages.map((_, index) => ({
      id: `${Date.now()}-${Math.random()}-${index}`,
      dataUrl: signature.dataUrl,
      x: 100,
      y: 100,
      width: 150,
      height: 75,
      rotation: 0,
      page: index,
    }));

    setPlacedSignatures([...placedSignatures, ...newPlaced]);
    toast({
      title: "Signature Applied",
      description: `Signature added to all ${pdfPages.length} pages`,
    });
  };

  const removeSignature = (id: string) => {
    setPlacedSignatures(placedSignatures.filter((sig) => sig.id !== id));
  };

  const rotateSignature = (id: string) => {
    setPlacedSignatures(
      placedSignatures.map((sig) =>
        sig.id === id ? { ...sig, rotation: (sig.rotation + 90) % 360 } : sig
      )
    );
  };

  // Unified position getter for mouse and touch events
  const getEventPosition = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: (e as React.MouseEvent).clientX, clientY: (e as React.MouseEvent).clientY };
  };

  // Move handler for signatures
  const handleMoveStart = (e: React.MouseEvent | React.TouchEvent, sig: PlacedSignature) => {
    e.preventDefault();
    e.stopPropagation();
    const container = pageContainerRef.current?.parentElement;
    if (!container) return;

    const { clientX, clientY } = getEventPosition(e);
    const rect = container.getBoundingClientRect();
    const offsetX = clientX - rect.left - sig.x * zoom;
    const offsetY = clientY - rect.top - sig.y * zoom;

    setDraggingSignature(sig.id);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  // Resize handler for signatures
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, sig: PlacedSignature, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    const container = pageContainerRef.current?.parentElement;
    if (!container) return;

    const { clientX, clientY } = getEventPosition(e);
    setResizingSignature({ id: sig.id, handle });
    setResizeStartData({
      x: sig.x,
      y: sig.y,
      width: sig.width,
      height: sig.height,
      mouseX: clientX,
      mouseY: clientY,
    });
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggingSignature && !resizingSignature) return;

    const { clientX, clientY } = getEventPosition(e);

    if (draggingSignature) {
      const container = pageContainerRef.current?.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const newX = (clientX - rect.left - dragOffset.x) / zoom;
      const newY = (clientY - rect.top - dragOffset.y) / zoom;

      setPlacedSignatures(
        placedSignatures.map((sig) =>
          sig.id === draggingSignature ? { ...sig, x: Math.max(0, newX), y: Math.max(0, newY) } : sig
        )
      );
    } else if (resizingSignature && resizeStartData) {
      const deltaX = (clientX - resizeStartData.mouseX) / zoom;
      const deltaY = (clientY - resizeStartData.mouseY) / zoom;

      setPlacedSignatures(
        placedSignatures.map((sig) => {
          if (sig.id !== resizingSignature.id) return sig;

          let newX = resizeStartData.x;
          let newY = resizeStartData.y;
          let newWidth = resizeStartData.width;
          let newHeight = resizeStartData.height;

          const minWidth = 50;
          const minHeight = 25;

          switch (resizingSignature.handle) {
            case 'nw':
              newWidth = Math.max(minWidth, resizeStartData.width - deltaX);
              newHeight = Math.max(minHeight, resizeStartData.height - deltaY);
              newX = resizeStartData.x + (resizeStartData.width - newWidth);
              newY = resizeStartData.y + (resizeStartData.height - newHeight);
              break;
            case 'ne':
              newWidth = Math.max(minWidth, resizeStartData.width + deltaX);
              newHeight = Math.max(minHeight, resizeStartData.height - deltaY);
              newY = resizeStartData.y + (resizeStartData.height - newHeight);
              break;
            case 'sw':
              newWidth = Math.max(minWidth, resizeStartData.width - deltaX);
              newHeight = Math.max(minHeight, resizeStartData.height + deltaY);
              newX = resizeStartData.x + (resizeStartData.width - newWidth);
              break;
            case 'se':
              newWidth = Math.max(minWidth, resizeStartData.width + deltaX);
              newHeight = Math.max(minHeight, resizeStartData.height + deltaY);
              break;
          }

          return { ...sig, x: Math.max(0, newX), y: Math.max(0, newY), width: newWidth, height: newHeight };
        })
      );
    }
  };

  const handleEnd = () => {
    setDraggingSignature(null);
    setResizingSignature(null);
    setResizeStartData(null);
  };

  // Export signed PDF via edge function
  const exportSignedPDF = async () => {
    if (!file) return;

    if (placedSignatures.length === 0) {
      toast({
        title: "No Signatures",
        description: "Please place at least one signature on the document before downloading.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setSigningStatus('signing');
    setSigningError(null);

    try {
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binaryString = '';
      const chunkSize = 8192;
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        binaryString += String.fromCharCode(...chunk);
      }
      
      const pdfBase64 = btoa(binaryString);

      // Prepare signatures for the edge function
      const signaturesData = placedSignatures.map(sig => ({
        dataUrl: sig.dataUrl,
        x: sig.x,
        y: sig.y,
        width: sig.width,
        height: sig.height,
        rotation: sig.rotation,
        page: sig.page,
      }));

      console.log("Calling sign-pdf edge function with", signaturesData.length, "signatures");

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('sign-pdf', {
        body: {
          pdfBase64,
          signatures: signaturesData,
          fileName: `signed-${file.name}`,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to sign PDF");
      }

      if (!data?.success) {
        console.error("Signing failed:", data?.error);
        throw new Error(data?.error || "Failed to sign PDF");
      }

      // Download the signed PDF
      const signedBinaryString = atob(data.pdfBase64);
      const signedBytes = new Uint8Array(signedBinaryString.length);
      for (let i = 0; i < signedBinaryString.length; i++) {
        signedBytes[i] = signedBinaryString.charCodeAt(i);
      }

      const blob = new Blob([signedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ToolsCrush_${data.fileName || `signed-${file.name}`}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSigningStatus('success');
      toast({
        title: "PDF Signed Successfully",
        description: `Your signed PDF with ${data.signatureCount} signature(s) has been downloaded.`,
      });
    } catch (error: any) {
      console.error("Error signing PDF:", error);
      const errorMessage = error?.message || "Failed to sign PDF. Please try again.";
      setSigningStatus('error');
      setSigningError(errorMessage);
      toast({
        title: "Signing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const howToSteps = [
    {
      name: "Upload PDF",
      text: "Select and upload the PDF document you need to sign."
    },
    {
      name: "Create Signature",
      text: "Draw your signature, upload an image, or capture it with your camera. Background removal is applied automatically."
    },
    {
      name: "Place Signature",
      text: "Drag and drop your signature onto the PDF pages, resize, rotate, and position it as needed."
    },
    {
      name: "Download Signed PDF",
      text: "Click 'Download Signed PDF' to save your signed document with all signatures embedded."
    }
  ];

  return (
    <ToolPage title="Sign PDF" description="Add your signature to PDF documents" keywords="sign pdf, digital signature, esign pdf, sign documents online" canonicalUrl="https://toolhub.com/tools/sign-pdf" howToSteps={howToSteps}>
      <div className="space-y-6">
        <FileUploader
          accept={{ 
            "application/pdf": [".pdf"],
            "application/x-pdf": [".pdf"],
            "application/acrobat": [".pdf"],
            "application/vnd.pdf": [".pdf"],
            "text/pdf": [".pdf"],
            "text/x-pdf": [".pdf"]
          }}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          acceptedFileTypes="PDF files"
        />

        {file && pdfPages.length > 0 && (
          <>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Signature Library</h3>
              <Tabs defaultValue="draw" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="draw">
                    <Pen className="mr-2 h-4 w-4" />
                    Draw
                  </TabsTrigger>
                  <TabsTrigger value="upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="camera">
                    <Camera className="mr-2 h-4 w-4" />
                    Scan
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="draw" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <label className="text-sm">Pen Color:</label>
                      <Button
                        size="sm"
                        variant={penColor === "#000000" ? "default" : "outline"}
                        onClick={() => setPenColor("#000000")}
                      >
                        Black
                      </Button>
                      <Button
                        size="sm"
                        variant={penColor === "#0000FF" ? "default" : "outline"}
                        onClick={() => setPenColor("#0000FF")}
                      >
                        Blue
                      </Button>
                    </div>
                    <canvas
                      ref={drawCanvasRef}
                      width={500}
                      height={200}
                      className="border border-border rounded-md w-full cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                    <div className="flex gap-2">
                      <Button onClick={clearDrawing} variant="outline" size="sm">
                        Clear
                      </Button>
                      <Button onClick={saveDrawnSignature} size="sm">
                        <Save className="mr-2 h-4 w-4" />
                        Save Signature
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleUploadSignature}
                    className="hidden"
                  />
                  <Button onClick={() => fileInputRef.current?.click()} disabled={isRemovingBg}>
                    {isRemovingBg ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Background will be automatically removed
                  </p>
                </TabsContent>

                <TabsContent value="camera" className="space-y-4">
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCameraSignature}
                    className="hidden"
                  />
                  <Button onClick={() => cameraInputRef.current?.click()} disabled={isRemovingBg}>
                    {isRemovingBg ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Take Photo
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Background will be automatically removed and cropped
                  </p>
                </TabsContent>
              </Tabs>

              {signatures.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Saved Signatures</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {signatures.map((sig) => (
                      <div key={sig.id} className="border border-border rounded-md p-2 space-y-2">
                        <img src={sig.dataUrl} alt={sig.name} className="w-full h-20 object-contain bg-muted" />
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => placeSignature(sig.id)} className="flex-1">
                            Place
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => applyToAllPages(sig.id)}>
                            All Pages
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteSignature(sig.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Page {currentPage + 1} of {pdfPages.length}
                  </h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
                      -
                    </Button>
                    <span className="text-sm px-2 py-1">{Math.round(zoom * 100)}%</span>
                    <Button size="sm" variant="outline" onClick={() => setZoom(Math.min(2, zoom + 0.25))}>
                      +
                    </Button>
                  </div>
                </div>

                <div 
                  className="relative border border-border rounded-md overflow-auto max-h-[600px]"
                  onMouseMove={handleMove}
                  onMouseUp={handleEnd}
                  onMouseLeave={handleEnd}
                  onTouchMove={handleMove}
                  onTouchEnd={handleEnd}
                >
                  <div 
                    ref={pageContainerRef}
                    className="relative inline-block" 
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                  >
                    <img src={pdfPages[currentPage]} alt={`Page ${currentPage + 1}`} className="w-full" />
                    {placedSignatures
                      .filter((sig) => sig.page === currentPage)
                      .map((sig) => (
                        <div
                          key={sig.id}
                          className="absolute border-2 border-primary group"
                          style={{
                            left: sig.x,
                            top: sig.y,
                            width: sig.width,
                            height: sig.height,
                            transform: `rotate(${sig.rotation}deg)`,
                          }}
                        >
                          <img src={sig.dataUrl} alt="Signature" className="w-full h-full object-contain pointer-events-none" />
                          
                          {/* Move handle at top-center - larger for mobile */}
                          <div 
                            className="absolute -top-8 left-1/2 -translate-x-1/2 w-10 h-8 bg-primary rounded-t-md flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity touch-none"
                            onMouseDown={(e) => handleMoveStart(e, sig)}
                            onTouchStart={(e) => handleMoveStart(e, sig)}
                          >
                            <GripVertical className="h-5 w-5 text-primary-foreground" />
                          </div>
                          
                          {/* Corner resize handles - larger for mobile */}
                          <div 
                            className="absolute -top-2 -left-2 w-6 h-6 bg-background border-2 border-primary rounded-full cursor-nwse-resize opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity touch-none flex items-center justify-center"
                            onMouseDown={(e) => handleResizeStart(e, sig, 'nw')}
                            onTouchStart={(e) => handleResizeStart(e, sig, 'nw')}
                          />
                          <div 
                            className="absolute -top-2 -right-2 w-6 h-6 bg-background border-2 border-primary rounded-full cursor-nesw-resize opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity touch-none flex items-center justify-center"
                            onMouseDown={(e) => handleResizeStart(e, sig, 'ne')}
                            onTouchStart={(e) => handleResizeStart(e, sig, 'ne')}
                          />
                          <div 
                            className="absolute -bottom-2 -left-2 w-6 h-6 bg-background border-2 border-primary rounded-full cursor-nesw-resize opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity touch-none flex items-center justify-center"
                            onMouseDown={(e) => handleResizeStart(e, sig, 'sw')}
                            onTouchStart={(e) => handleResizeStart(e, sig, 'sw')}
                          />
                          <div 
                            className="absolute -bottom-2 -right-2 w-6 h-6 bg-background border-2 border-primary rounded-full cursor-nwse-resize opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity touch-none flex items-center justify-center"
                            onMouseDown={(e) => handleResizeStart(e, sig, 'se')}
                            onTouchStart={(e) => handleResizeStart(e, sig, 'se')}
                          />
                          
                          <div className="absolute -top-8 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="secondary" onClick={() => rotateSignature(sig.id)}>
                              <RotateCw className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => removeSignature(sig.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(pdfPages.length - 1, currentPage + 1))}
                    disabled={currentPage === pdfPages.length - 1}
                  >
                    Next
                  </Button>
                </div>

                {/* Signing Status */}
                {signingStatus === 'success' && (
                  <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-md">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-700 dark:text-green-300">
                      PDF signed successfully! Document has been flattened with embedded signatures.
                    </span>
                  </div>
                )}

                {signingStatus === 'error' && signingError && (
                  <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <span className="text-sm text-red-700 dark:text-red-300">
                      {signingError}
                    </span>
                  </div>
                )}

                <Button 
                  onClick={exportSignedPDF} 
                  disabled={isProcessing || placedSignatures.length === 0} 
                  size="lg" 
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing PDF...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Sign & Download PDF
                    </>
                  )}
                </Button>

                {placedSignatures.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Place at least one signature on the document to enable download
                  </p>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </ToolPage>
  );
};

export default SignPDF;
