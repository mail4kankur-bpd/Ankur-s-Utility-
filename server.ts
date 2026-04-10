import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import multer from "multer";
import { createCanvas, loadImage } from "canvas";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import QRCode from 'qrcode';

const upload = multer({ storage: multer.memoryStorage() });

async function renderCard(ctx: any, bgImage: any, row: any, fields: any[], width: number, height: number) {
  // 1. Clear & Draw Template
  ctx.clearRect(0, 0, width, height);
  
  let bgW = bgImage.width;
  let bgH = bgImage.height;
  let drawX = 0;
  let drawY = 0;

  // Shrink to fit if it exceeds canvas dimensions
  if (bgW > width || bgH > height) {
    const ratio = Math.min(width / bgW, height / bgH);
    bgW = bgW * ratio;
    bgH = bgH * ratio;
  }
  
  // Center the background image
  drawX = (width - bgW) / 2;
  drawY = (height - bgH) / 2;

  ctx.drawImage(bgImage, drawX, drawY, bgW, bgH);

  // 2. Render Dynamic Fields
  for (const field of fields) {
    const value = String(row[field.name] || "");
    
    if (field.type === 'text') {
      ctx.fillStyle = field.fill;
      ctx.textAlign = field.align;
      
      let currentFontSize = field.fontSize;
      ctx.font = `${field.fontWeight} ${currentFontSize}px sans-serif`;

      if (field.shrinkToFit) {
        while (ctx.measureText(value).width > field.width && currentFontSize > 8) {
          currentFontSize -= 1;
          ctx.font = `${field.fontWeight} ${currentFontSize}px sans-serif`;
        }
      }

      let drawX = field.x;
      if (field.align === "center") drawX = field.x + field.width / 2;
      if (field.align === "right") drawX = field.x + field.width;

      if (field.wrap && field.wrap !== 'none') {
          const words = value.split(field.wrap === 'word' ? ' ' : '');
          let line = '';
          let lines = [];
          for (let n = 0; n < words.length; n++) {
              let testLine = line + words[n] + (field.wrap === 'word' ? ' ' : '');
              let metrics = ctx.measureText(testLine);
              let testWidth = metrics.width;
              if (testWidth > field.width && n > 0) {
                  lines.push(line);
                  line = words[n] + (field.wrap === 'word' ? ' ' : '');
              } else {
                  line = testLine;
              }
          }
          lines.push(line);
          
          const lineHeight = currentFontSize * 1.2;
          const totalHeight = lines.length * lineHeight;
          let startY = field.y + (field.height / 2) - (totalHeight / 2) + (currentFontSize * 0.8);

          lines.forEach((l, index) => {
              ctx.fillText(l.trim(), drawX, startY + (index * lineHeight));
          });
      } else {
          ctx.fillText(value, drawX, field.y + (field.height / 2) + (currentFontSize * 0.3));
      }
    } else if (field.type === 'image' && row[field.name]) {
      try {
          const fieldImg = await loadImage(row[field.name]);
          ctx.save();
          const r = field.cornerRadius || 0;
          const x = field.x;
          const y = field.y;
          const w = field.width;
          const h = field.height;

          if (r > 0) {
              ctx.beginPath();
              ctx.moveTo(x + r, y);
              ctx.lineTo(x + w - r, y);
              ctx.quadraticCurveTo(x + w, y, x + w, y + r);
              ctx.lineTo(x + w, y + h - r);
              ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
              ctx.lineTo(x + r, y + h);
              ctx.quadraticCurveTo(x, y + h, x, y + h - r);
              ctx.lineTo(x, y + r);
              ctx.quadraticCurveTo(x, y, x + r, y);
              ctx.closePath();
              ctx.clip();
          }
          ctx.drawImage(fieldImg, x, y, w, h);
          ctx.restore();

          if (field.strokeWidth && field.strokeWidth > 0) {
              ctx.strokeStyle = field.stroke || '#000000';
              ctx.lineWidth = field.strokeWidth;
              ctx.beginPath();
              ctx.moveTo(x + r, y);
              ctx.lineTo(x + w - r, y);
              ctx.quadraticCurveTo(x + w, y, x + w, y + r);
              ctx.lineTo(x + w, y + h - r);
              ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
              ctx.lineTo(x + r, y + h);
              ctx.quadraticCurveTo(x, y + h, x, y + h - r);
              ctx.lineTo(x, y + r);
              ctx.quadraticCurveTo(x, y, x + r, y);
              ctx.closePath();
              ctx.stroke();
          }
      } catch (e) {
          console.error("Failed to load field image", e);
      }
    } else if (field.type === 'qr') {
      try {
        const qrDataParts = (field.qrFields || []).map(f => row[f] || '').filter(Boolean);
        qrDataParts.push("Created with Ankur's ID Card Utility");
        const qrData = qrDataParts.join(' | ');
        
        const qrDataUrl = await QRCode.toDataURL(qrData, { margin: 1 });
        const qrImg = await loadImage(qrDataUrl);
        ctx.drawImage(qrImg, field.x, field.y, field.width, field.height);
      } catch (e) {
        console.error("Failed to generate QR code", e);
      }
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // API Route for single card generation (for ZIP export)
  app.post("/api/generate-single", async (req, res) => {
    try {
      const { layout, format } = req.body;
      const { width, height, templateUrl, fields, singleData } = JSON.parse(layout);
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      const bgImage = await loadImage(templateUrl);

      await renderCard(ctx, bgImage, singleData, fields, width, height);

      const buffer = canvas.toBuffer((format === 'png' ? 'image/png' : 'image/jpeg') as any);
      res.setHeader("Content-Type", format === 'png' ? 'image/png' : 'image/jpeg');
      res.send(buffer);
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to generate single card");
    }
  });

  // API Route for A4 grid generation
  app.post("/api/generate-a4", async (req, res) => {
    try {
      const { layout, a4Config } = req.body;
      const { width, height, templateUrl, fields, excelData } = JSON.parse(layout);
      const { orientation, columns, rows, gapCm } = JSON.parse(a4Config);

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      const bgImage = await loadImage(templateUrl);

      const doc = new jsPDF({
        orientation: orientation === 'portrait' ? 'p' : 'l',
        unit: 'mm',
        format: 'a4'
      });

      const a4W = orientation === 'portrait' ? 210 : 297;
      const a4H = orientation === 'portrait' ? 297 : 210;

      // Convert card size to mm
      // We assume the original layout width/height was calculated from cm * (dpi/2.54)
      // So width_px / (dpi/2.54) = width_cm. 1cm = 10mm.
      // But we can just use the aspect ratio and scale it to fit the grid.
      // Actually, the user provides canvasSizeCm in the store.
      // Let's assume the layout object has it or we can derive it.
      // For now, let's use a fixed conversion or pass it.
      const cardWMm = (width / 300) * 25.4; // Assuming 300 DPI for conversion back to mm
      const cardHMm = (height / 300) * 25.4;
      
      const gapMm = gapCm * 10;
      const cardsPerPage = columns * rows;

      for (let i = 0; i < excelData.length; i++) {
        if (i > 0 && i % cardsPerPage === 0) {
          doc.addPage();
        }

        const pageIdx = i % cardsPerPage;
        const col = pageIdx % columns;
        const row = Math.floor(pageIdx / columns);

        const x = gapMm + col * (cardWMm + gapMm);
        const y = gapMm + row * (cardHMm + gapMm);

        await renderCard(ctx, bgImage, excelData[i], fields, width, height);
        const imgData = canvas.toDataURL("image/jpeg", 0.9);
        doc.addImage(imgData, "JPEG", x, y, cardWMm, cardHMm);
      }

      const pdfBuffer = doc.output("arraybuffer");
      res.setHeader("Content-Type", "application/pdf");
      res.send(Buffer.from(pdfBuffer));
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to generate A4 PDF");
    }
  });

  app.post("/api/generate", upload.single("excel"), async (req: any, res) => {
    try {
      const { layout } = req.body;
      const parsedLayout = JSON.parse(layout);
      const excelBuffer = req.file?.buffer;

      if (!excelBuffer) {
        return res.status(400).json({ error: "Excel file is required" });
      }

      const workbook = XLSX.read(excelBuffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      const { width, height, templateUrl, fields } = parsedLayout;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      const doc = new jsPDF({
        orientation: width > height ? "l" : "p",
        unit: "px",
        format: [width, height],
      });

      const bgImage = await loadImage(templateUrl);

      for (let i = 0; i < data.length; i++) {
        const row = data[i] as any;
        await renderCard(ctx, bgImage, row, fields, width, height);

        // 3. Add to PDF
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        if (i > 0) doc.addPage([width, height], width > height ? "l" : "p");
        doc.addImage(imgData, "JPEG", 0, 0, width, height);
      }

      const pdfBuffer = doc.output("arraybuffer");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=generated_ids.pdf");
      res.send(Buffer.from(pdfBuffer));
    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({ error: "Failed to generate IDs" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
