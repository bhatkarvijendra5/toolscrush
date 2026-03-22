import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument } from "npm:pdf-lib@^1.17.1";

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);
  if (isRateLimited(clientIP)) {
    return new Response(JSON.stringify({ error: "Too many requests. Please wait and try again." }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    console.log("Unlock PDF function called");
    
    const { pdfBase64, password, fileName } = await req.json();

    if (!pdfBase64) {
      return new Response(
        JSON.stringify({ error: "PDF file is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate payload size
    if (typeof pdfBase64 === 'string' && pdfBase64.length > 70_000_000) {
      return new Response(JSON.stringify({ error: "File too large. Maximum size is 50MB." }), {
        status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Decoding PDF from base64");
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    console.log("Loading PDF document with password");
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

    console.log("Saving unlocked PDF");
    const unlockedPdfBytes = await pdfDoc.save();

    console.log("Converting unlocked PDF to base64");
    const uint8Array = new Uint8Array(unlockedPdfBytes);
    let outputBinaryString = '';
    const chunkSize = 8192;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      outputBinaryString += String.fromCharCode(...chunk);
    }
    
    const base64Output = btoa(outputBinaryString);

    console.log("Returning unlocked PDF");
    return new Response(
      JSON.stringify({ 
        pdfBase64: base64Output,
        fileName: fileName ? fileName.replace('.pdf', '-unlocked.pdf') : "unlocked.pdf"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error unlocking PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to unlock PDF";
    
    if (errorMessage.includes("password") || errorMessage.includes("encrypted")) {
      return new Response(
        JSON.stringify({ error: "Incorrect password or PDF cannot be unlocked" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
