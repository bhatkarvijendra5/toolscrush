export interface FAQ {
  question: string;
  answer: string;
}

export interface RelatedTool {
  title: string;
  href: string;
  description: string;
}

export interface ToolSEO {
  title: string;
  metaTitle: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  faqs: FAQ[];
  relatedTools: RelatedTool[];
  contentIntro: string;
}

const BASE_URL = "https://toolscrush.com";

export const toolSeoData: Record<string, ToolSEO> = {
  "merge-pdf": {
    title: "Merge PDF",
    metaTitle: "Merge PDF Files Online Free – Combine PDFs Instantly | ToolsCrush",
    description: "Combine multiple PDF files into one document online for free. Drag and drop to reorder pages, merge PDFs quickly without losing quality. No signup required.",
    keywords: "merge PDF, combine PDF, PDF merger, join PDFs, merge PDF files online free, combine PDF documents, merge multiple PDFs",
    canonicalUrl: `${BASE_URL}/tools/merge-pdf`,
    contentIntro: "Merge PDF files online for free with ToolsCrush. Whether you need to combine contracts, reports, or presentations into a single document, our PDF merger handles it in seconds. Simply drag and drop your files, reorder pages as needed, and download your merged PDF — all without uploading to any server. Your files stay private and secure in your browser.",
    faqs: [
      { question: "How do I merge PDF files online for free?", answer: "Upload your PDF files to ToolsCrush's Merge PDF tool, drag and drop to reorder them, then click 'Merge & Download'. The entire process happens in your browser — no signup or payment required." },
      { question: "Can I rearrange pages before merging PDFs?", answer: "Yes! ToolsCrush lets you drag and drop PDF files to reorder them before merging. You can also remove individual PDFs from the list." },
      { question: "Is there a file size limit for merging PDFs?", answer: "Since all processing happens in your browser, the limit depends on your device's memory. Most users can merge PDFs up to 100MB+ without issues." },
      { question: "Are my files safe when merging PDFs online?", answer: "Absolutely. ToolsCrush processes everything locally in your browser. Your PDF files are never uploaded to any server, ensuring complete privacy." },
    ],
    relatedTools: [
      { title: "Split PDF", href: "/tools/split-pdf", description: "Extract pages from a PDF" },
      { title: "Compress PDF", href: "/tools/compress-pdf", description: "Reduce PDF file size" },
      { title: "Organize PDF", href: "/tools/organize-pdf", description: "Reorder and rotate pages" },
    ],
  },
  "split-pdf": {
    title: "Split PDF",
    metaTitle: "Split PDF Online Free – Extract Pages from PDF | ToolsCrush",
    description: "Split PDF files and extract specific pages online for free. Select page ranges or individual pages to create new PDF documents. Fast, secure, no signup needed.",
    keywords: "split PDF, extract PDF pages, separate PDF pages, divide PDF, split PDF online free, PDF page extractor, split PDF documents",
    canonicalUrl: `${BASE_URL}/tools/split-pdf`,
    contentIntro: "Split PDF documents into separate files with ToolsCrush. Extract specific pages, split by page ranges, or separate a large PDF into smaller documents. Preview each page before splitting, select exactly what you need, and download instantly. All processing happens locally in your browser for maximum privacy and speed.",
    faqs: [
      { question: "How can I split a PDF into separate pages?", answer: "Upload your PDF to ToolsCrush, select the pages you want to extract, set a page range, and click 'Split'. Each selected page or range becomes a new PDF file." },
      { question: "Can I extract specific pages from a PDF?", answer: "Yes! You can select individual pages or enter custom page ranges (e.g., 1-3, 5, 7-10) to extract exactly the pages you need." },
      { question: "Is splitting PDFs online safe?", answer: "Yes. ToolsCrush processes your PDF entirely in your browser. No files are uploaded to any server, keeping your documents private." },
      { question: "Can I split a large PDF with many pages?", answer: "Absolutely. ToolsCrush handles PDFs with hundreds of pages. You'll see thumbnail previews of each page to help you select the right ones." },
    ],
    relatedTools: [
      { title: "Merge PDF", href: "/tools/merge-pdf", description: "Combine multiple PDFs" },
      { title: "Organize PDF", href: "/tools/organize-pdf", description: "Reorder PDF pages" },
      { title: "PDF to JPG", href: "/tools/pdf-to-jpg", description: "Convert PDF pages to images" },
    ],
  },
  "compress-pdf": {
    title: "Compress PDF",
    metaTitle: "Compress PDF Online Free – Reduce PDF Size | ToolsCrush",
    description: "Compress PDF files online for free without losing quality. Reduce PDF file size for email, web upload, or storage. Fast compression, no signup required.",
    keywords: "compress PDF, reduce PDF size, PDF compressor online free, optimize PDF, shrink PDF file, PDF size reducer, compress PDF without losing quality",
    canonicalUrl: `${BASE_URL}/tools/compress-pdf`,
    contentIntro: "Compress PDF files online for free with ToolsCrush. Reduce your PDF file size without sacrificing document quality — perfect for email attachments, web uploads, and saving storage space. Our smart compression algorithm optimizes metadata, images, and content streams to deliver the smallest possible file size while keeping your document readable and professional.",
    faqs: [
      { question: "How do I compress a PDF without losing quality?", answer: "ToolsCrush uses smart compression that removes unnecessary metadata and optimizes content streams while preserving text clarity and image quality. Upload your PDF and click 'Compress & Download'." },
      { question: "How much can I reduce my PDF file size?", answer: "Typical compression reduces file size by 20-70%, depending on the original content. PDFs with embedded images see the largest reductions." },
      { question: "Is compressing PDF files online free?", answer: "Yes! ToolsCrush offers unlimited free PDF compression with no signup, watermarks, or file limits." },
      { question: "Can I compress multiple PDFs at once?", answer: "Currently, ToolsCrush compresses one PDF at a time for optimal quality. Simply upload your next file after downloading the compressed version." },
    ],
    relatedTools: [
      { title: "Merge PDF", href: "/tools/merge-pdf", description: "Combine PDFs into one" },
      { title: "Compress Images", href: "/tools/compress-image", description: "Reduce image file sizes" },
      { title: "PDF to Word", href: "/tools/pdf-to-word", description: "Convert PDF to editable text" },
    ],
  },
  "pdf-to-word": {
    title: "PDF to Word",
    metaTitle: "PDF to Word Converter Online Free – Convert PDF to DOCX | ToolsCrush",
    description: "Convert PDF to Word documents online for free. Extract text from PDFs and download as editable DOCX files. Supports scanned PDFs with OCR. No signup needed.",
    keywords: "PDF to Word, PDF to DOCX, convert PDF to Word free, PDF converter online, PDF to editable document, OCR PDF to Word",
    canonicalUrl: `${BASE_URL}/tools/pdf-to-word`,
    contentIntro: "Convert PDF to Word documents online for free with ToolsCrush. Our PDF to Word converter extracts text, preserves formatting, and creates editable DOCX files you can modify in Microsoft Word, Google Docs, or any word processor. For scanned PDFs and image-based documents, our built-in OCR technology accurately recognizes and extracts text.",
    faqs: [
      { question: "How do I convert a PDF to Word for free?", answer: "Upload your PDF to ToolsCrush's PDF to Word converter, click 'Convert to Word', and download the editable DOCX file. It's completely free with no signup required." },
      { question: "Can I convert scanned PDFs to Word?", answer: "Yes! ToolsCrush uses OCR (Optical Character Recognition) to detect and extract text from scanned documents and image-based PDFs." },
      { question: "Will the formatting be preserved when converting PDF to Word?", answer: "ToolsCrush preserves text content and basic formatting. Complex layouts with multiple columns or intricate designs may need minor adjustments after conversion." },
      { question: "Is the PDF to Word conversion secure?", answer: "Yes. All conversion happens in your browser. Your PDF files are never sent to any server, ensuring complete document privacy." },
    ],
    relatedTools: [
      { title: "Word to PDF", href: "/tools/word-to-pdf", description: "Convert Word to PDF" },
      { title: "PDF to Excel", href: "/tools/pdf-to-excel", description: "Extract tables from PDF" },
      { title: "PDF to PowerPoint", href: "/tools/pdf-to-ppt", description: "Convert PDF to slides" },
    ],
  },
  "pdf-to-excel": {
    title: "PDF to Excel",
    metaTitle: "PDF to Excel Converter Online Free – Extract Tables | ToolsCrush",
    description: "Convert PDF to Excel spreadsheet format online for free. Extract tables and data from PDF documents to CSV. Supports OCR for scanned documents.",
    keywords: "PDF to Excel, PDF to CSV, extract tables from PDF, PDF to spreadsheet, convert PDF data, PDF table extractor free",
    canonicalUrl: `${BASE_URL}/tools/pdf-to-excel`,
    contentIntro: "Extract tables and data from PDF files and convert them to Excel-compatible CSV format with ToolsCrush. Our PDF to Excel converter intelligently detects tabular data, preserves cell structure, and exports clean spreadsheets. For scanned PDFs, our OCR engine accurately reads and extracts data from image-based tables.",
    faqs: [
      { question: "How do I convert a PDF table to Excel?", answer: "Upload your PDF containing tables to ToolsCrush, click 'Convert to CSV', and download the spreadsheet. Open the CSV in Excel, Google Sheets, or any spreadsheet application." },
      { question: "Can I extract data from scanned PDF tables?", answer: "Yes! ToolsCrush uses AI-powered OCR to recognize and extract tabular data from scanned documents and image-based PDFs." },
      { question: "What format is the output file?", answer: "The output is in CSV format, which can be opened directly in Microsoft Excel, Google Sheets, LibreOffice Calc, and other spreadsheet applications." },
      { question: "Is PDF to Excel conversion accurate?", answer: "ToolsCrush extracts text-based tables with high accuracy. Scanned or handwritten tables use OCR which provides good results for clearly printed text." },
    ],
    relatedTools: [
      { title: "PDF to Word", href: "/tools/pdf-to-word", description: "Convert PDF to Word" },
      { title: "PDF to PowerPoint", href: "/tools/pdf-to-ppt", description: "Convert PDF to slides" },
      { title: "AI Document Analyzer", href: "/tools/document-analyzer", description: "OCR text extraction" },
    ],
  },
  "pdf-to-ppt": {
    title: "PDF to PowerPoint",
    metaTitle: "PDF to PowerPoint Converter Free – Convert PDF to PPTX | ToolsCrush",
    description: "Convert PDF pages to PowerPoint presentations online for free. Select pages, preview them, and download as editable PPTX slides. No signup required.",
    keywords: "PDF to PowerPoint, PDF to PPTX, convert PDF to slides, PDF presentation converter, PDF to PPT free online",
    canonicalUrl: `${BASE_URL}/tools/pdf-to-ppt`,
    contentIntro: "Convert PDF documents to PowerPoint presentations with ToolsCrush. Select specific pages from your PDF, preview each slide, and export as an editable PPTX file. Perfect for converting reports, proposals, and documents into presentation-ready slides. All conversion happens in your browser — fast, free, and secure.",
    faqs: [
      { question: "How do I convert a PDF to PowerPoint for free?", answer: "Upload your PDF, select the pages you want to include, and click 'Download as PPTX'. ToolsCrush converts each selected page into a PowerPoint slide." },
      { question: "Can I select specific pages to convert to slides?", answer: "Yes! After uploading, you'll see previews of all pages. Select or deselect individual pages before converting to PowerPoint." },
      { question: "Will the slides be editable in PowerPoint?", answer: "The slides contain high-quality images of each PDF page. For fully editable text, consider using PDF to Word first, then building your presentation." },
      { question: "What PowerPoint format is supported?", answer: "ToolsCrush exports in PPTX format, compatible with Microsoft PowerPoint, Google Slides, and other presentation software." },
    ],
    relatedTools: [
      { title: "PDF to Word", href: "/tools/pdf-to-word", description: "Convert PDF to Word" },
      { title: "PDF to JPG", href: "/tools/pdf-to-jpg", description: "Extract images from PDF" },
      { title: "PDF to Excel", href: "/tools/pdf-to-excel", description: "Extract tables from PDF" },
    ],
  },
  "word-to-pdf": {
    title: "Word to PDF",
    metaTitle: "Word to PDF Converter Online Free – Convert DOCX to PDF | ToolsCrush",
    description: "Convert Word documents to PDF format online for free. Support for DOC, DOCX, and TXT files. Fast conversion with preserved formatting. No signup needed.",
    keywords: "Word to PDF, DOCX to PDF, convert Word to PDF free, document to PDF, DOC to PDF converter online, text to PDF",
    canonicalUrl: `${BASE_URL}/tools/word-to-pdf`,
    contentIntro: "Convert Word documents to PDF format instantly with ToolsCrush. Our Word to PDF converter supports DOC, DOCX, and TXT files, preserving your text formatting and layout in the output PDF. Perfect for creating professional, non-editable versions of your documents for sharing, printing, or archiving. The entire conversion happens in your browser for maximum speed and privacy.",
    faqs: [
      { question: "How do I convert a Word document to PDF for free?", answer: "Upload your Word file (DOC, DOCX, or TXT) to ToolsCrush, click 'Convert to PDF', and download the resulting PDF. It's completely free and requires no signup." },
      { question: "Does the converter preserve Word formatting?", answer: "ToolsCrush preserves text content and basic formatting. Complex layouts with tables, images, and custom styles may appear slightly different in the PDF output." },
      { question: "What file types can I convert to PDF?", answer: "ToolsCrush supports DOC, DOCX, and TXT files for PDF conversion." },
      { question: "Are my documents secure during conversion?", answer: "Yes. All conversion happens locally in your browser. Your Word documents are never uploaded to any server." },
    ],
    relatedTools: [
      { title: "PDF to Word", href: "/tools/pdf-to-word", description: "Convert PDF to Word" },
      { title: "JPG to PDF", href: "/tools/jpg-to-pdf", description: "Convert images to PDF" },
      { title: "Compress PDF", href: "/tools/compress-pdf", description: "Reduce PDF file size" },
    ],
  },
  "jpg-to-pdf": {
    title: "JPG to PDF",
    metaTitle: "JPG to PDF Converter Online Free – Convert Images to PDF | ToolsCrush",
    description: "Convert JPG, PNG, and WEBP images to PDF documents online for free. Combine multiple images into one PDF, reorder pages. No signup required.",
    keywords: "JPG to PDF, image to PDF, convert images to PDF free, PNG to PDF, photo to PDF, combine images into PDF online",
    canonicalUrl: `${BASE_URL}/tools/jpg-to-pdf`,
    contentIntro: "Convert images to PDF documents with ToolsCrush. Upload JPG, PNG, or WEBP images, drag and drop to reorder them, and combine everything into a single, professional PDF document. Perfect for creating photo albums, document scans, portfolios, and multi-page image collections. All processing happens in your browser — your images stay private.",
    faqs: [
      { question: "How do I convert JPG images to PDF for free?", answer: "Upload your JPG images to ToolsCrush, arrange them in your preferred order by dragging and dropping, then click 'Download as PDF'. All images will be combined into one PDF." },
      { question: "Can I combine multiple images into one PDF?", answer: "Yes! Upload up to 50 images at once, reorder them as needed, and merge them into a single PDF document." },
      { question: "What image formats are supported?", answer: "ToolsCrush supports JPG, JPEG, PNG, and WEBP image formats for PDF conversion." },
      { question: "Can I reorder images before creating the PDF?", answer: "Absolutely! Use drag and drop to arrange your images in any order. You can also remove individual images before converting." },
    ],
    relatedTools: [
      { title: "PDF to JPG", href: "/tools/pdf-to-jpg", description: "Convert PDF to images" },
      { title: "Merge PDF", href: "/tools/merge-pdf", description: "Combine PDF files" },
      { title: "Compress Images", href: "/tools/compress-image", description: "Reduce image sizes" },
    ],
  },
  "pdf-to-jpg": {
    title: "PDF to JPG",
    metaTitle: "PDF to JPG Converter Online Free – Convert PDF Pages to Images | ToolsCrush",
    description: "Convert PDF pages to high-quality JPG images online for free. Download individual pages or all pages as a ZIP file. Fast, secure conversion.",
    keywords: "PDF to JPG, PDF to image, convert PDF to JPG free, extract images from PDF, PDF page to JPG, PDF to JPEG online",
    canonicalUrl: `${BASE_URL}/tools/pdf-to-jpg`,
    contentIntro: "Convert PDF documents to high-quality JPG images with ToolsCrush. Each page of your PDF is rendered at 2x resolution for crystal-clear images. Download individual pages or grab all pages at once in a convenient ZIP file. Ideal for creating thumbnails, extracting visuals, or sharing PDF content as images on social media.",
    faqs: [
      { question: "How do I convert a PDF to JPG images?", answer: "Upload your PDF to ToolsCrush's PDF to JPG converter. Each page is automatically rendered as a high-quality JPG image. Download individual pages or all pages as a ZIP." },
      { question: "What is the quality of the converted JPG images?", answer: "ToolsCrush renders each page at 2x scale for sharp, high-resolution images suitable for printing and professional use." },
      { question: "Can I download all pages at once?", answer: "Yes! Click 'Download All as ZIP' to get all converted pages in a single ZIP file for easy downloading." },
      { question: "Is the PDF to JPG conversion free?", answer: "Completely free with no watermarks, signup, or file limits. Process as many PDFs as you need." },
    ],
    relatedTools: [
      { title: "JPG to PDF", href: "/tools/jpg-to-pdf", description: "Convert images to PDF" },
      { title: "Convert Images", href: "/tools/convert-image", description: "Convert image formats" },
      { title: "Compress Images", href: "/tools/compress-image", description: "Reduce image sizes" },
    ],
  },
  "organize-pdf": {
    title: "Organize PDF",
    metaTitle: "Organize PDF Pages Online Free – Reorder, Rotate, Delete | ToolsCrush",
    description: "Reorder, rotate, delete, and extract PDF pages online for free. Drag and drop page thumbnails to reorganize your PDF. No signup required.",
    keywords: "organize PDF, reorder PDF pages, rotate PDF, delete PDF pages, rearrange PDF, extract PDF pages free online",
    canonicalUrl: `${BASE_URL}/tools/organize-pdf`,
    contentIntro: "Organize your PDF documents with ToolsCrush's powerful page management tool. Reorder pages by drag and drop, rotate individual pages, delete unwanted content, and extract specific pages into new documents. See thumbnail previews of every page for easy navigation. All editing happens in your browser — your documents never leave your device.",
    faqs: [
      { question: "How do I reorder pages in a PDF?", answer: "Upload your PDF to ToolsCrush, then drag and drop page thumbnails to rearrange them in your desired order. Click 'Download PDF' to save the reorganized document." },
      { question: "Can I delete specific pages from a PDF?", answer: "Yes! Click the delete button on any page thumbnail to remove it from the document. You can delete multiple pages before downloading." },
      { question: "How do I rotate a PDF page?", answer: "Click the rotate button on any page thumbnail to rotate it 90 degrees clockwise. Click multiple times for 180° or 270° rotation." },
      { question: "Can I extract certain pages from a PDF?", answer: "Yes! Select the pages you want to extract and click 'Extract Selected' to create a new PDF with only those pages." },
    ],
    relatedTools: [
      { title: "Merge PDF", href: "/tools/merge-pdf", description: "Combine multiple PDFs" },
      { title: "Split PDF", href: "/tools/split-pdf", description: "Split PDF into parts" },
      { title: "Add Page Numbers", href: "/tools/page-numbers", description: "Number your PDF pages" },
    ],
  },
  "watermark-pdf": {
    title: "Watermark PDF",
    metaTitle: "Add Watermark to PDF Online Free – Text & Image Watermarks | ToolsCrush",
    description: "Add text or image watermarks to your PDF documents online for free. Customize font, color, opacity, and position. Protect your PDFs from unauthorized use.",
    keywords: "watermark PDF, add watermark to PDF free, PDF watermark online, text watermark PDF, image watermark PDF, protect PDF with watermark",
    canonicalUrl: `${BASE_URL}/tools/watermark-pdf`,
    contentIntro: "Add professional watermarks to your PDF documents with ToolsCrush. Choose between text and image watermarks with full customization — adjust font size, color, opacity, rotation, and position. Apply watermarks to all pages or selected pages to protect your intellectual property, mark documents as confidential, or add branding. All processing happens securely in your browser.",
    faqs: [
      { question: "How do I add a watermark to a PDF for free?", answer: "Upload your PDF, choose text or image watermark, customize the appearance (font, color, opacity, position), select pages, and click 'Download'. ToolsCrush adds the watermark instantly." },
      { question: "Can I add an image as a watermark?", answer: "Yes! Upload any image (JPG, PNG, WEBP) to use as a watermark. Adjust its size, opacity, and position on the page." },
      { question: "Can I watermark only specific pages?", answer: "Absolutely! Select which pages should receive the watermark using the page selector. You can apply watermarks to all pages or just selected ones." },
      { question: "Does the watermark affect PDF quality?", answer: "No. ToolsCrush adds watermarks without re-compressing the PDF content, preserving the original document quality." },
    ],
    relatedTools: [
      { title: "Protect PDF", href: "/tools/protect-pdf", description: "Password protect your PDF" },
      { title: "Sign PDF", href: "/tools/sign-pdf", description: "Add signatures to PDF" },
      { title: "Add Page Numbers", href: "/tools/page-numbers", description: "Number your PDF pages" },
    ],
  },
  "page-numbers": {
    title: "Add Page Numbers",
    metaTitle: "Add Page Numbers to PDF Online Free – Customize Position | ToolsCrush",
    description: "Add page numbers to PDF documents online for free. Customize position, font style, and size. Preview before downloading. No signup required.",
    keywords: "add page numbers to PDF, PDF page numbering free, number PDF pages online, PDF page number tool, insert page numbers PDF",
    canonicalUrl: `${BASE_URL}/tools/page-numbers`,
    contentIntro: "Add professional page numbers to your PDF documents with ToolsCrush. Customize the position (top/bottom, left/center/right), font style, and size. Preview how your page numbers will look before downloading. Perfect for preparing reports, manuscripts, and multi-page documents for printing or professional presentation.",
    faqs: [
      { question: "How do I add page numbers to a PDF?", answer: "Upload your PDF to ToolsCrush, choose the position and style for your page numbers, preview the result, and click 'Download PDF'. Page numbers are added to every page automatically." },
      { question: "Can I choose where page numbers appear?", answer: "Yes! Place page numbers at the top or bottom of the page, and align them left, center, or right. You can also adjust font size and style." },
      { question: "Can I reorder pages before adding numbers?", answer: "Absolutely! Drag and drop page thumbnails to reorder them before adding page numbers. You can also rotate or delete pages." },
      { question: "Is adding page numbers to PDF free?", answer: "Yes, completely free with no watermarks or signup required. Process unlimited PDFs." },
    ],
    relatedTools: [
      { title: "Organize PDF", href: "/tools/organize-pdf", description: "Reorder PDF pages" },
      { title: "Merge PDF", href: "/tools/merge-pdf", description: "Combine multiple PDFs" },
      { title: "Watermark PDF", href: "/tools/watermark-pdf", description: "Add watermarks to PDF" },
    ],
  },
  "ocr": {
    title: "AI Document Analyzer",
    metaTitle: "Image to Text OCR Online Free – Extract Text from Images | ToolsCrush",
    description: "Extract text from images and scanned documents using AI-powered OCR. Support for handwritten notes, printed text, and multiple languages. Download as DOCX, PDF, or TXT.",
    keywords: "image to text, OCR online free, extract text from image, handwriting recognition, document scanner, convert image to text, AI OCR tool",
    canonicalUrl: `${BASE_URL}/tools/ocr`,
    contentIntro: "Extract text from images and scanned documents with ToolsCrush's AI-powered Document Analyzer. Our advanced OCR technology accurately recognizes printed text, handwritten notes, and documents in multiple languages. Upload an image or capture a photo, and download the extracted text as DOCX, PDF, CSV, or plain text. Perfect for digitizing notes, receipts, forms, and documents.",
    faqs: [
      { question: "How does the AI Document Analyzer work?", answer: "Upload an image or take a photo of your document. ToolsCrush's AI analyzes the image, detects text regions, and extracts the content with high accuracy. You can download the result in multiple formats." },
      { question: "Can it read handwritten text?", answer: "Yes! Our AI is trained to recognize both printed and handwritten text, including notes, forms, and annotations." },
      { question: "What languages are supported?", answer: "ToolsCrush supports text extraction in multiple languages. The AI automatically detects the language of your document." },
      { question: "What output formats are available?", answer: "Download extracted text as DOCX (Word), PDF, CSV (for tabular data), or plain text files." },
    ],
    relatedTools: [
      { title: "PDF to Word", href: "/tools/pdf-to-word", description: "Convert PDF to Word" },
      { title: "PDF to Excel", href: "/tools/pdf-to-excel", description: "Extract tables from PDF" },
      { title: "Convert Images", href: "/tools/convert-image", description: "Convert image formats" },
    ],
  },
  "convert-image": {
    title: "Convert Images",
    metaTitle: "Image Converter Online Free – JPG, PNG, WEBP | ToolsCrush",
    description: "Convert images between JPG, PNG, and WEBP formats online for free. Batch convert multiple images at once. Fast, secure, no signup required.",
    keywords: "image converter, convert JPG to PNG, PNG to WEBP, WEBP to JPG, image format converter free online, batch image conversion",
    canonicalUrl: `${BASE_URL}/tools/convert-image`,
    contentIntro: "Convert images between popular formats with ToolsCrush's free online image converter. Support for JPG, PNG, and WEBP formats with batch processing — convert multiple images at once. Whether you need PNG transparency, WEBP compression for web, or universal JPG compatibility, ToolsCrush handles it instantly in your browser.",
    faqs: [
      { question: "How do I convert image formats online?", answer: "Upload your images to ToolsCrush, select the desired output format (JPG, PNG, or WEBP), and click 'Convert'. All converted images download automatically." },
      { question: "Can I convert multiple images at once?", answer: "Yes! Upload multiple images and convert them all to the same format in one batch operation." },
      { question: "Which image format should I choose?", answer: "Use JPG for photos (smallest size), PNG for images needing transparency, and WEBP for web optimization (best compression with quality)." },
      { question: "Is the image quality preserved during conversion?", answer: "Yes. ToolsCrush converts images at high quality settings to minimize any quality loss during format conversion." },
    ],
    relatedTools: [
      { title: "Compress Images", href: "/tools/compress-image", description: "Reduce image file sizes" },
      { title: "Resize Images", href: "/tools/resize-image", description: "Change image dimensions" },
      { title: "JPG to PDF", href: "/tools/jpg-to-pdf", description: "Convert images to PDF" },
    ],
  },
  "compress-image": {
    title: "Compress Images",
    metaTitle: "Compress Images Online Free – Reduce Image Size | ToolsCrush",
    description: "Compress JPG, PNG, and WEBP images online for free. Reduce image file size without losing quality. Choose compression level for optimal results.",
    keywords: "compress images, reduce image size, image compressor online free, compress JPG, compress PNG, optimize images for web",
    canonicalUrl: `${BASE_URL}/tools/compress-image`,
    contentIntro: "Compress images online for free with ToolsCrush. Reduce JPG, PNG, and WEBP file sizes without noticeable quality loss. Choose your preferred quality level — 60%, 80%, or 90% — for the perfect balance between file size and visual quality. Ideal for web optimization, email attachments, and social media uploads. All compression happens locally in your browser.",
    faqs: [
      { question: "How do I compress images without losing quality?", answer: "Upload your images to ToolsCrush and select a quality level (90% for minimal loss, 80% for balanced, 60% for maximum compression). The tool preserves visual quality while significantly reducing file size." },
      { question: "What image formats can I compress?", answer: "ToolsCrush compresses JPG, JPEG, PNG, and WEBP images. Upload up to 10 images at once for batch compression." },
      { question: "How much can I reduce my image file size?", answer: "Typical compression reduces file size by 40-80% depending on the original image and quality setting chosen." },
      { question: "Is image compression free and secure?", answer: "Yes! Completely free with no watermarks. All processing happens in your browser — images are never uploaded to any server." },
    ],
    relatedTools: [
      { title: "Image Size Reducer", href: "/tools/image-resizer", description: "Compress to specific KB" },
      { title: "Resize Images", href: "/tools/resize-image", description: "Change image dimensions" },
      { title: "Convert Images", href: "/tools/convert-image", description: "Change image format" },
    ],
  },
  "resize-image": {
    title: "Resize Images",
    metaTitle: "Resize Images Online Free – Change Dimensions | ToolsCrush",
    description: "Resize images online for free. Change width, height, or scale by percentage. Maintain aspect ratio for perfect proportions. No signup required.",
    keywords: "resize image, change image size, image resizer online free, scale image, resize photo dimensions, crop image online",
    canonicalUrl: `${BASE_URL}/tools/resize-image`,
    contentIntro: "Resize images to exact dimensions with ToolsCrush's free online image resizer. Enter custom width and height, or scale by percentage. Lock aspect ratio to maintain perfect proportions, or unlock for custom dimensions. Preview your resized image before downloading. All processing happens locally — your images stay private.",
    faqs: [
      { question: "How do I resize an image online?", answer: "Upload your image to ToolsCrush, enter the desired width and height (or scale by percentage), and click 'Resize & Download'. The resized image downloads automatically." },
      { question: "Can I maintain the aspect ratio?", answer: "Yes! Toggle the 'Keep Aspect Ratio' switch to maintain proportions. When enabled, changing one dimension automatically adjusts the other." },
      { question: "What output formats are available?", answer: "Download your resized image as JPG or PNG. Choose JPG for smaller file sizes or PNG when you need transparency." },
      { question: "Is there a size limit for resizing?", answer: "Since processing happens in your browser, the limit depends on your device. Most images resize instantly regardless of size." },
    ],
    relatedTools: [
      { title: "Compress Images", href: "/tools/compress-image", description: "Reduce image file sizes" },
      { title: "Convert Images", href: "/tools/convert-image", description: "Change image format" },
      { title: "Image Size Reducer", href: "/tools/image-resizer", description: "Compress to target KB" },
    ],
  },
  "image-resizer": {
    title: "Image Size Reducer",
    metaTitle: "Reduce Image Size to KB Online Free – Image Compressor | ToolsCrush",
    description: "Reduce image file size to a specific KB target online for free. Compress images from MB to KB for web, email, and uploads. No signup required.",
    keywords: "reduce image size, image size reducer, compress image to KB, image compressor MB to KB, reduce photo size online free",
    canonicalUrl: `${BASE_URL}/tools/image-resizer`,
    contentIntro: "Reduce image file size to your exact target with ToolsCrush's Image Size Reducer. Specify a target size in KB, and our smart algorithm compresses your images to meet that requirement while preserving maximum visual quality. Perfect for meeting upload size limits on job portals, government forms, social media, and email attachments.",
    faqs: [
      { question: "How do I reduce an image to a specific KB size?", answer: "Upload your image, enter your target size in KB, and click 'Compress'. ToolsCrush uses smart algorithms to reach your target while preserving quality." },
      { question: "Can I compress multiple images at once?", answer: "Yes! Upload multiple images and compress them all to the same target KB size in one operation." },
      { question: "What's the minimum size I can compress to?", answer: "You can compress images down to as low as 10KB, though very small targets may result in visible quality reduction." },
      { question: "Does this work for passport photos and ID uploads?", answer: "Absolutely! Many users use ToolsCrush to meet specific size requirements for passport photos, ID uploads, and government forms." },
    ],
    relatedTools: [
      { title: "Compress Images", href: "/tools/compress-image", description: "Quality-based compression" },
      { title: "Resize Images", href: "/tools/resize-image", description: "Change image dimensions" },
      { title: "Convert Images", href: "/tools/convert-image", description: "Change image format" },
    ],
  },
  "sign-pdf": {
    title: "Sign PDF",
    metaTitle: "Sign PDF Online Free – Add Digital Signature to PDF | ToolsCrush",
    description: "Add your digital signature to PDF documents online for free. Draw, type, or upload your signature. Place signatures on any page. No signup required.",
    keywords: "sign PDF, digital signature PDF, e-sign PDF free, add signature to PDF online, electronic signature, sign documents online",
    canonicalUrl: `${BASE_URL}/tools/sign-pdf`,
    contentIntro: "Sign PDF documents online for free with ToolsCrush. Create your signature by drawing, typing, or uploading an image. Place your signature anywhere on any page of your PDF, resize and position it precisely, then download the signed document. Perfect for contracts, agreements, forms, and official documents. All signing happens securely in your browser.",
    faqs: [
      { question: "How do I add a signature to a PDF for free?", answer: "Upload your PDF, create a signature (draw, type, or upload), click on the page where you want to place it, adjust size and position, and download the signed PDF." },
      { question: "Is an electronic signature legally valid?", answer: "Electronic signatures created with ToolsCrush are suitable for most informal agreements and internal documents. For legally binding contracts, consult local regulations about digital signature requirements." },
      { question: "Can I sign multiple pages?", answer: "Yes! Navigate to any page in your PDF and place signatures on as many pages as needed." },
      { question: "Are my signed documents secure?", answer: "Yes. All signing happens in your browser. Your PDF and signature data are never uploaded to any server." },
    ],
    relatedTools: [
      { title: "Protect PDF", href: "/tools/protect-pdf", description: "Password protect PDF" },
      { title: "Watermark PDF", href: "/tools/watermark-pdf", description: "Add watermarks to PDF" },
      { title: "Organize PDF", href: "/tools/organize-pdf", description: "Reorder PDF pages" },
    ],
  },
  "protect-pdf": {
    title: "Protect PDF",
    metaTitle: "Password Protect PDF Online Free – Encrypt PDF Files | ToolsCrush",
    description: "Add password protection to your PDF files online for free. Encrypt PDFs to prevent unauthorized access. Secure and fast. No signup required.",
    keywords: "protect PDF, password protect PDF, encrypt PDF free, secure PDF with password, PDF encryption online, lock PDF file",
    canonicalUrl: `${BASE_URL}/tools/protect-pdf`,
    contentIntro: "Protect your PDF documents with password encryption using ToolsCrush. Add a strong password to prevent unauthorized access, copying, or printing. Our PDF protection tool encrypts your document with industry-standard security. Perfect for confidential reports, legal documents, financial statements, and personal files.",
    faqs: [
      { question: "How do I password protect a PDF?", answer: "Upload your PDF, enter a strong password, and click 'Protect & Download'. The encrypted PDF will require the password to open." },
      { question: "How strong is the PDF encryption?", answer: "ToolsCrush uses standard PDF encryption to protect your documents. Choose a strong, unique password for maximum security." },
      { question: "Can I remove the password later?", answer: "Yes! Use ToolsCrush's Unlock PDF tool to remove password protection from your PDF (you'll need to know the current password)." },
      { question: "Is the protection process secure?", answer: "Yes. Your PDF is encrypted in your browser and the password-protected file downloads directly. No data is sent to any server." },
    ],
    relatedTools: [
      { title: "Unlock PDF", href: "/tools/unlock-pdf", description: "Remove PDF password" },
      { title: "Sign PDF", href: "/tools/sign-pdf", description: "Add digital signature" },
      { title: "Watermark PDF", href: "/tools/watermark-pdf", description: "Add watermarks to PDF" },
    ],
  },
  "unlock-pdf": {
    title: "Unlock PDF",
    metaTitle: "Unlock PDF Online Free – Remove PDF Password | ToolsCrush",
    description: "Remove password protection from PDF files online for free. Enter the known password to unlock and download an unprotected version. Fast and secure.",
    keywords: "unlock PDF, remove PDF password, PDF password remover free, decrypt PDF online, unlock encrypted PDF, open locked PDF",
    canonicalUrl: `${BASE_URL}/tools/unlock-pdf`,
    contentIntro: "Remove password protection from your PDF files with ToolsCrush. If you know the password but want an unprotected version for easier sharing or editing, simply upload the locked PDF, enter the password, and download the unlocked file. ToolsCrush decrypts the document securely in your browser — your files and passwords are never sent to any server.",
    faqs: [
      { question: "How do I unlock a password-protected PDF?", answer: "Upload the locked PDF, enter the correct password, and click 'Unlock & Download'. You'll receive an unprotected version of the PDF." },
      { question: "Can I unlock a PDF without knowing the password?", answer: "No. For security reasons, you must enter the correct password to unlock a PDF. ToolsCrush does not bypass PDF security." },
      { question: "Is unlocking PDFs legal?", answer: "Unlocking PDFs you own or have authorized access to is completely legal. ToolsCrush is designed for legitimate use cases like removing passwords from your own documents." },
      { question: "Does unlocking change the PDF content?", answer: "No. The content remains exactly the same — only the password protection is removed." },
    ],
    relatedTools: [
      { title: "Protect PDF", href: "/tools/protect-pdf", description: "Add password protection" },
      { title: "Compress PDF", href: "/tools/compress-pdf", description: "Reduce PDF file size" },
      { title: "Merge PDF", href: "/tools/merge-pdf", description: "Combine multiple PDFs" },
    ],
  },
  "document-analyzer": {
    title: "AI Document Analyzer",
    metaTitle: "AI Document Scanner & OCR Free – Handwriting to Text | ToolsCrush",
    description: "Scan handwritten notes and documents with AI-powered OCR. Extract text from images, convert to DOCX, PDF, or CSV. Supports multiple languages.",
    keywords: "AI document analyzer, OCR free, handwriting to text, scan documents online, image to text converter, AI document scanner",
    canonicalUrl: `${BASE_URL}/tools/document-analyzer`,
    contentIntro: "Digitize handwritten notes and scanned documents with ToolsCrush's AI Document Analyzer. Our advanced AI accurately reads printed text, handwritten notes, and documents in multiple languages. Upload an image or take a photo, and instantly extract text that you can download as DOCX, PDF, CSV, or plain text. Perfect for students, professionals, and anyone needing to convert physical documents to digital format.",
    faqs: [
      { question: "How does the AI Document Analyzer work?", answer: "Upload a photo or image of your document. Our AI analyzes the image using advanced OCR technology, detects text regions, recognizes characters, and extracts the content for download in your preferred format." },
      { question: "Can it read handwritten notes?", answer: "Yes! ToolsCrush's AI is trained to recognize both printed and handwritten text, including cursive writing and annotations." },
      { question: "What output formats are available?", answer: "Download extracted text as DOCX (Microsoft Word), PDF, CSV (for tabular data), or plain text files." },
      { question: "What languages does it support?", answer: "The AI Document Analyzer supports multiple languages and can automatically detect the language of your document." },
    ],
    relatedTools: [
      { title: "PDF to Word", href: "/tools/pdf-to-word", description: "Convert PDF to Word" },
      { title: "PDF to Excel", href: "/tools/pdf-to-excel", description: "Extract tables from PDF" },
      { title: "Image to Text", href: "/tools/ocr", description: "OCR text extraction" },
    ],
  },
};

export const getToolSeo = (toolSlug: string): ToolSEO | undefined => {
  return toolSeoData[toolSlug];
};
