import { useState, useCallback, useEffect, useRef } from "react";
import ToolPage from "@/components/ToolPage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload, Download, Loader2, X, Image as ImageIcon, Lock, Unlock,
  ArrowRight, GripVertical, Trash2, Shield, Zap, DownloadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  width: number;
  height: number;
  compressedBlob?: Blob;
  compressedSize?: number;
  compressedPreview?: string;
  customName?: string;
}

type Preset = "custom" | "social-square" | "social-landscape" | "web-banner" | "thumbnail";

const PRESETS: Record<Preset, { label: string; width: number; height: number; quality: number; desc: string }> = {
  custom: { label: "Custom", width: 0, height: 0, quality: 80, desc: "Set your own dimensions" },
  "social-square": { label: "Social Media (Square)", width: 1080, height: 1080, quality: 85, desc: "1080×1080 — Instagram, Facebook" },
  "social-landscape": { label: "Social Media (Landscape)", width: 1200, height: 630, quality: 85, desc: "1200×630 — Facebook, LinkedIn" },
  "web-banner": { label: "Web Banner", width: 1920, height: 600, quality: 80, desc: "1920×600 — Website hero" },
  thumbnail: { label: "Thumbnail", width: 300, height: 300, quality: 70, desc: "300×300 — Quick thumbnails" },
};

const ImageResizer = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState(80);
  const [resizeMode, setResizeMode] = useState<"pixels" | "percentage">("percentage");
  const [percentage, setPercentage] = useState(100);
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [outputFormat, setOutputFormat] = useState("jpeg");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<Preset>("custom");
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const selectedImage = images.find((i) => i.id === selectedImageId) ?? images[0] ?? null;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file) => {
      const id = crypto.randomUUID();
      return new Promise<ImageFile>((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            id,
            file,
            preview: img.src,
            originalSize: file.size,
            width: img.width,
            height: img.height,
          });
        };
        img.src = URL.createObjectURL(file);
      });
    });
    Promise.all(newImages).then((loaded) => {
      setImages((prev) => [...prev, ...loaded]);
      if (!selectedImageId && loaded.length > 0) {
        setSelectedImageId(loaded[0].id);
        setTargetWidth(loaded[0].width);
        setTargetHeight(loaded[0].height);
      }
    });
  }, [selectedImageId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
    },
    maxFiles: 20,
  });

  // When selecting a new image, update width/height
  useEffect(() => {
    if (selectedImage && resizeMode === "pixels" && selectedPreset === "custom") {
      setTargetWidth(selectedImage.width);
      setTargetHeight(selectedImage.height);
    }
  }, [selectedImageId]);

  // When preset changes
  useEffect(() => {
    if (selectedPreset !== "custom") {
      const p = PRESETS[selectedPreset];
      setTargetWidth(p.width);
      setTargetHeight(p.height);
      setQuality(p.quality);
      setResizeMode("pixels");
      setMaintainAspect(false);
    }
  }, [selectedPreset]);

  const handleWidthChange = (w: number) => {
    setTargetWidth(w);
    if (maintainAspect && selectedImage && selectedImage.width > 0) {
      setTargetHeight(Math.round((w / selectedImage.width) * selectedImage.height));
    }
  };

  const handleHeightChange = (h: number) => {
    setTargetHeight(h);
    if (maintainAspect && selectedImage && selectedImage.height > 0) {
      setTargetWidth(Math.round((h / selectedImage.height) * selectedImage.width));
    }
  };

  const getOutputDimensions = (img: ImageFile) => {
    if (resizeMode === "percentage") {
      return { w: Math.round(img.width * percentage / 100), h: Math.round(img.height * percentage / 100) };
    }
    return { w: targetWidth, h: targetHeight };
  };

  const estimatedReduction = () => {
    const qualityFactor = quality / 100;
    const sizeFactor = resizeMode === "percentage" ? (percentage / 100) ** 2 : 1;
    const est = Math.round((1 - qualityFactor * sizeFactor) * 100);
    return Math.max(0, Math.min(99, est));
  };

  const processImage = (img: ImageFile): Promise<ImageFile> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const { w, h } = getOutputDimensions(img);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, w);
        canvas.height = Math.max(1, h);
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        const mime = outputFormat === "png" ? "image/png" : outputFormat === "webp" ? "image/webp" : "image/jpeg";
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Blob creation failed"));
            const compressedPreview = URL.createObjectURL(blob);
            resolve({
              ...img,
              compressedBlob: blob,
              compressedSize: blob.size,
              compressedPreview,
            });
          },
          mime,
          quality / 100
        );
        URL.revokeObjectURL(image.src);
      };
      image.onerror = () => reject(new Error("Failed to load image"));
      image.src = img.preview;
    });
  };

  const handleProcess = async () => {
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    setIsProcessing(true);
    setProgress(0);
    try {
      const processed: ImageFile[] = [];
      for (let i = 0; i < images.length; i++) {
        const result = await processImage(images[i]);
        processed.push(result);
        setProgress(Math.round(((i + 1) / images.length) * 100));
      }
      setImages(processed);
      toast.success(`Processed ${processed.length} image(s) successfully`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to process images");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (img: ImageFile) => {
    if (!img.compressedBlob) return;
    const ext = outputFormat === "png" ? ".png" : outputFormat === "webp" ? ".webp" : ".jpg";
    const name = (img.customName || img.file.name.replace(/\.[^/.]+$/, "")) + `_resized${ext}`;
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
    setImages((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      if (selectedImageId === id) setSelectedImageId(updated[0]?.id ?? null);
      return updated;
    });
  };

  const handleDragStart = (index: number) => { dragItem.current = index; };
  const handleDragEnter = (index: number) => { dragOverItem.current = index; };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const copy = [...images];
    const dragged = copy.splice(dragItem.current, 1)[0];
    copy.splice(dragOverItem.current, 0, dragged);
    setImages(copy);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  const hasProcessed = images.some((i) => i.compressedBlob);

  return (
    <ToolPage
      title="Image Resizer"
      description="Resize, compress, and optimize your images — fast, secure, and entirely in your browser."
      keywords="image resizer, compress image, reduce image size, resize image online, optimize images, batch image resize"
    >
      {/* Upload Section */}
      {images.length === 0 ? (
        <Card
          {...getRootProps()}
          className={`glass-card cursor-pointer border-2 border-dashed p-8 md:p-12 text-center transition-all ${
            isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-primary/10 p-6">
              <Upload className="h-10 w-10 md:h-12 md:w-12 text-primary" />
            </div>
            <p className="text-lg font-medium">Drag & drop your images here, or click to select</p>
            <p className="text-sm text-muted-foreground">JPG, PNG, WEBP, GIF • Up to 20 files</p>
            <Button type="button" className="gradient-primary">Select Images</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* File List — Draggable */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">{images.length} image(s) selected</h3>
              <Button variant="outline" size="sm" {...getRootProps()}>
                <input {...getInputProps()} />
                <Upload className="h-3.5 w-3.5 mr-1.5" /> Add More
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragEnter={() => handleDragEnter(idx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => setSelectedImageId(img.id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedImageId === img.id ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/50"
                  }`}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
                  <img src={img.preview} alt="" className="h-10 w-10 rounded object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Input
                      value={img.customName ?? img.file.name.replace(/\.[^/.]+$/, "")}
                      onChange={(e) => {
                        setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, customName: e.target.value } : i));
                      }}
                      className="h-7 text-xs border-none bg-transparent p-0 focus-visible:ring-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <p className="text-xs text-muted-foreground">
                      {img.width}×{img.height} • {formatSize(img.originalSize)}
                      {img.compressedSize != null && (
                        <span className="text-green-600 dark:text-green-400 ml-2">
                          → {formatSize(img.compressedSize)} ({Math.round((1 - img.compressedSize / img.originalSize) * 100)}% smaller)
                        </span>
                      )}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                  {img.compressedBlob && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => { e.stopPropagation(); downloadFile(img); }}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Settings Panel */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5 space-y-5">
              <h3 className="font-semibold flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Settings</h3>

              {/* Presets */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Preset</label>
                <Select value={selectedPreset} onValueChange={(v) => setSelectedPreset(v as Preset)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRESETS).map(([key, p]) => (
                      <SelectItem key={key} value={key}>
                        <span>{p.label}</span>
                        <span className="text-muted-foreground text-xs ml-2">— {p.desc}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Compression Quality */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Compression Quality</label>
                  <Badge variant="secondary" className="text-xs">{quality}%</Badge>
                </div>
                <Slider value={[quality]} onValueChange={(v) => setQuality(v[0])} min={10} max={100} step={1} />
                <p className="text-xs text-muted-foreground">
                  Est. ~{estimatedReduction()}% file size reduction
                </p>
              </div>

              {/* Resize Mode */}
              <Tabs value={resizeMode} onValueChange={(v) => setResizeMode(v as "pixels" | "percentage")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="percentage">Percentage</TabsTrigger>
                  <TabsTrigger value="pixels">Width & Height</TabsTrigger>
                </TabsList>
                <TabsContent value="percentage" className="space-y-2 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Scale</label>
                    <Badge variant="secondary" className="text-xs">{percentage}%</Badge>
                  </div>
                  <Slider value={[percentage]} onValueChange={(v) => setPercentage(v[0])} min={5} max={200} step={5} />
                </TabsContent>
                <TabsContent value="pixels" className="space-y-3 pt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs text-muted-foreground">Width (px)</label>
                      <Input type="number" min={1} value={targetWidth || ""} onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-xs text-muted-foreground">Height (px)</label>
                      <Input type="number" min={1} value={targetHeight || ""} onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {maintainAspect ? <Lock className="h-4 w-4 text-primary" /> : <Unlock className="h-4 w-4 text-muted-foreground" />}
                    <label className="text-sm">Maintain aspect ratio</label>
                    <Switch checked={maintainAspect} onCheckedChange={setMaintainAspect} className="ml-auto" />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Output Format */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Output Format</label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpeg">JPG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="webp">WEBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Preview Section */}
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><ImageIcon className="h-4 w-4 text-primary" /> Preview</h3>

              {selectedImage ? (
                <>
                  {selectedImage.compressedPreview ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground text-center">Before</p>
                          <div className="aspect-square rounded-lg border border-border overflow-hidden bg-muted/30">
                            <img src={selectedImage.preview} alt="Original" className="h-full w-full object-contain" />
                          </div>
                          <p className="text-xs text-center text-muted-foreground">{selectedImage.width}×{selectedImage.height} • {formatSize(selectedImage.originalSize)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground text-center">After</p>
                          <div className="aspect-square rounded-lg border border-border overflow-hidden bg-muted/30">
                            <img src={selectedImage.compressedPreview} alt="Compressed" className="h-full w-full object-contain" />
                          </div>
                          <p className="text-xs text-center text-muted-foreground">
                            {getOutputDimensions(selectedImage).w}×{getOutputDimensions(selectedImage).h} • {formatSize(selectedImage.compressedSize!)}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-lg bg-green-500/10 p-3 text-center">
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                          {Math.round((1 - selectedImage.compressedSize! / selectedImage.originalSize) * 100)}% reduction
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatSize(selectedImage.originalSize)} → {formatSize(selectedImage.compressedSize!)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="aspect-video rounded-lg border border-border overflow-hidden bg-muted/30">
                        <img src={selectedImage.preview} alt="Preview" className="h-full w-full object-contain" />
                      </div>
                      <p className="text-xs text-center text-muted-foreground">
                        {selectedImage.width}×{selectedImage.height} • {formatSize(selectedImage.originalSize)}
                      </p>
                      <p className="text-xs text-center text-muted-foreground">
                        Output: {getOutputDimensions(selectedImage).w}×{getOutputDimensions(selectedImage).h}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center aspect-video rounded-lg border border-dashed border-border">
                  <p className="text-sm text-muted-foreground">Select an image to preview</p>
                </div>
              )}
            </Card>
          </div>

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">Processing... {progress}%</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleProcess} disabled={isProcessing} className="flex-1 gradient-primary" size="lg">
              {isProcessing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                <><Zap className="mr-2 h-4 w-4" /> Compress & Resize</>
              )}
            </Button>
            {hasProcessed && (
              <Button onClick={downloadAll} variant="outline" size="lg" className="flex-1">
                <DownloadCloud className="mr-2 h-4 w-4" /> Download All
              </Button>
            )}
          </div>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            <p>Your images are processed securely in your browser and are never stored on any server.</p>
          </div>
        </div>
      )}
    </ToolPage>
  );
};

export default ImageResizer;
