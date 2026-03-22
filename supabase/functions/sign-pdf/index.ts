import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument, degrees, rgb } from "npm:pdf-lib@^1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_REQUESTS;
}

interface PlacedSignature {
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  page: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);
  if (isRateLimited(clientIP)) {
    return new Response(JSON.stringify({ error: "Too many requests. Please wait and try again.", success: false }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    console.log("Sign PDF function called");
    
    const { pdfBase64, signatures, fileName } = await req.json();

    if (!pdfBase64) {
      return new Response(
        JSON.stringify({ error: "PDF file is required", success: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!signatures || !Array.isArray(signatures) || signatures.length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one signature is required", success: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate payload size
    if (typeof pdfBase64 === 'string' && pdfBase64.length > 70_000_000) {
      return new Response(JSON.stringify({ error: "File too large. Maximum size is 50MB.", success: false }), {
        status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing ${signatures.length} signatures`);

    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    console.log("Loading PDF document");
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();

    for (const sig of signatures as PlacedSignature[]) {
      const page = pages[sig.page];
      if (!page) {
        console.warn(`Page ${sig.page} not found, skipping signature`);
        continue;
      }

      try {
        const base64Data = sig.dataUrl.split(',')[1];
        if (!base64Data) {
          console.error("Invalid signature data URL format");
          continue;
        }

        const signatureBinaryString = atob(base64Data);
        const signatureBytes = new Uint8Array(signatureBinaryString.length);
        for (let i = 0; i < signatureBinaryString.length; i++) {
          signatureBytes[i] = signatureBinaryString.charCodeAt(i);
        }

        const isPng = sig.dataUrl.startsWith('data:image/png');
        let signatureImage;
        
        try {
          signatureImage = isPng 
            ? await pdfDoc.embedPng(signatureBytes)
            : await pdfDoc.embedJpg(signatureBytes);
        } catch (embedError) {
          console.error("Failed to embed signature image:", embedError);
          try {
            signatureImage = isPng 
              ? await pdfDoc.embedJpg(signatureBytes)
              : await pdfDoc.embedPng(signatureBytes);
          } catch (fallbackError) {
            console.error("Failed to embed signature with fallback format:", fallbackError);
            continue;
          }
        }

        const { height: pageHeight } = page.getSize();

        page.drawImage(signatureImage, {
          x: sig.x,
          y: pageHeight - sig.y - sig.height,
          width: sig.width,
          height: sig.height,
          rotate: degrees(-sig.rotation),
        });

        console.log(`Signature embedded on page ${sig.page + 1}`);
      } catch (sigError) {
        console.error(`Error processing signature on page ${sig.page}:`, sigError);
        throw new Error(`Failed to embed signature on page ${sig.page + 1}`);
      }
    }

    pdfDoc.setTitle(pdfDoc.getTitle() || 'Signed Document');
    pdfDoc.setSubject('Digitally Signed Document');
    pdfDoc.setKeywords(['signed', 'digital signature']);
    pdfDoc.setModificationDate(new Date());
    pdfDoc.setCreator('PDF Sign Tool');
    pdfDoc.setProducer(`Signed with ${signatures.length} signature(s) on ${new Date().toISOString()}`);

    console.log("Saving signed PDF");
    const signedPdfBytes = await pdfDoc.save({ useObjectStreams: false });

    console.log("Converting PDF to base64 for response");
    const uint8Array = new Uint8Array(signedPdfBytes);
    let outputBinaryString = '';
    const chunkSize = 8192;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      outputBinaryString += String.fromCharCode(...chunk);
    }
    
    const base64Output = btoa(outputBinaryString);

    console.log("Successfully signed PDF");
    return new Response(
      JSON.stringify({ 
        pdfBase64: base64Output,
        fileName: fileName || "signed.pdf",
        success: true,
        signatureCount: signatures.length,
        signedAt: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error signing PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to sign PDF";
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
