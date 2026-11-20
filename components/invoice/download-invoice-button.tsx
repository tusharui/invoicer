"use client";

import { useState } from "react";
import { Download } from "lucide-react";

type Party = {
  name: string;
  email: string;
  addressLine1: string;
  company?: string;
};

type Item = {
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
  amount: string;
};

type Props = {
  number: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  from: Party;
  to: Party;
  items: Item[];
  subtotal: string;
  taxAmount: string;
  discountAmount: string;
  total: string;
  notes: string | null;
  terms: string | null;
};

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function multiLine(text: string, x: number, y: number, extra = ""): string {
  const parts = String(text ?? "").split("\n");
  return `<text x="${x}" y="${y}" ${extra}>${parts
    .map(
      (part, index) =>
        `<tspan x="${x}" dy="${index === 0 ? 0 : 18}">${esc(part)}</tspan>`,
    )
    .join("")}</text>`;
}

function buildInvoiceSvg(props: Props): { svg: string; height: number } {
  const width = 800;
  const margin = 48;
  const right = width - margin;

  const rowsStart = 396;
  const rowsEnd = rowsStart + props.items.length * 34;
  const totalsTop = rowsEnd + 24;

  let bottom = totalsTop + 130;
  if (props.notes) bottom += 80;
  if (props.terms) bottom += 80;
  const height = Math.max(660, bottom + 60);

  const partyBlock = (party: Party, x: number) => `
    ${multiLine("BILL FROM", x, 214, 'class="lbl"')}
    ${multiLine(party.name, x, 240, 'class="name"')}
    ${multiLine([party.company, party.email].filter(Boolean).join(" · "), x, 262, 'class="muted"')}
    ${multiLine(party.addressLine1, x, 284, 'class="muted"')}
  `;

  const rows = props.items
    .map((item, index) => {
      const y = rowsStart + index * 34;
      return `
        ${multiLine(item.description, margin, y, 'class="cell"')}
        <text x="490" y="${y}" text-anchor="end" class="cell">${esc(item.quantity)}</text>
        <text x="575" y="${y}" text-anchor="end" class="cell">${esc(item.unitPrice)}</text>
        <text x="655" y="${y}" text-anchor="end" class="cell">${esc(item.taxRate)}%</text>
        <text x="${right}" y="${y}" text-anchor="end" class="cell strong">${esc(item.amount)}</text>
      `;
    })
    .join("");

  const totalRow = (label: string, value: string, y: number, strong = false) => `
    <text x="560" y="${y}" text-anchor="end" class="${strong ? "total" : "muted"}">${esc(label)}</text>
    <text x="${right}" y="${y}" text-anchor="end" class="${strong ? "total" : "cell"}">${esc(value)}</text>
  `;

  let notesY = totalsTop + 150;
  let notesBlock = "";
  if (props.notes) {
    notesBlock += `${multiLine("NOTES", margin, notesY, 'class="lbl"')}`;
    notesBlock += `${multiLine(props.notes, margin, notesY + 22, 'class="muted"')}`;
    notesY += 80;
  }
  if (props.terms) {
    notesBlock += `${multiLine("TERMS", margin, notesY, 'class="lbl"')}`;
    notesBlock += `${multiLine(props.terms, margin, notesY + 22, 'class="muted"')}`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <style>
      .lbl { font-family: 'Geist Mono', monospace; font-size: 14px; font-weight: bold; letter-spacing: 2px; fill: #000000; }
      .name { font-family: 'Geist Mono', monospace; font-size: 18px; font-weight: bold; fill: #000000; }
      .muted { font-family: 'Geist Mono', monospace; font-size: 15px; fill: #000000; }
      .cell { font-family: 'Geist Mono', monospace; font-size: 15px; fill: #000000; }
      .strong { font-weight: bold; fill: #000000; }
      .total { font-family: 'Geist Mono', monospace; font-size: 20px; font-weight: bold; fill: #000000; }
      .head { font-family: 'Geist Mono', monospace; font-size: 14px; font-weight: bold; letter-spacing: 1px; fill: #000000; }
    </style>
    <rect width="${width}" height="${height}" fill="#ffffff" />
    <text x="${margin}" y="70" font-family="Geist Mono, monospace" font-size="38" font-weight="bold" letter-spacing="2" fill="#000000">INVOICE</text>
    <text x="${margin}" y="104" font-family="Geist Mono, monospace" font-size="20" font-weight="bold" fill="#000000">${esc(props.number)}</text>
    <text x="${margin}" y="160" font-family="Geist Mono, monospace" font-size="15" fill="#000000">Issued ${esc(props.issueDate)}   ·   Due ${esc(props.dueDate)}</text>
    <line x1="${margin}" y1="182" x2="${right}" y2="182" stroke="#000000" stroke-width="1" />
    ${partyBlock(props.from, margin)}
    ${partyBlock(props.to, 430)}
    <line x1="${margin}" y1="320" x2="${right}" y2="320" stroke="#000000" stroke-width="1" />
    <text x="${margin}" y="350" class="head">DESCRIPTION</text>
    <text x="490" y="350" text-anchor="end" class="head">QTY</text>
    <text x="575" y="350" text-anchor="end" class="head">RATE</text>
    <text x="655" y="350" text-anchor="end" class="head">TAX %</text>
    <text x="${right}" y="350" text-anchor="end" class="head">AMOUNT</text>
    <line x1="${margin}" y1="366" x2="${right}" y2="366" stroke="#000000" stroke-width="1" />
    ${rows}
    <line x1="${margin}" y1="${rowsEnd + 4}" x2="${right}" y2="${rowsEnd + 4}" stroke="#000000" stroke-width="1" />
    ${totalRow("Subtotal", props.subtotal, totalsTop + 10)}
    ${totalRow("Tax amount", props.taxAmount, totalsTop + 40)}
    ${totalRow("Discount", `-${props.discountAmount}`, totalsTop + 70)}
    ${totalRow("Total", `${props.currency} ${props.total}`, totalsTop + 110, true)}
    ${notesBlock}
  </svg>`;

  return { svg, height };
}

export function DownloadInvoiceButton(props: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setBusy(true);
    setError(null);

    try {
      // Make sure Geist Mono is loaded before the SVG is rasterized to PNG,
      // otherwise the canvas falls back to a generic monospace font.
      if (document.fonts?.load) {
        try {
          await document.fonts.load("12px 'Geist Mono'");
          await document.fonts.load("700 12px 'Geist Mono'");
          await document.fonts.ready;
        } catch {
          // Fall back to the generic monospace stack.
        }
      }

      const { svg, height } = buildInvoiceSvg(props);
      const svgUrl = URL.createObjectURL(
        new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
      );
      const image = new window.Image();

      image.onload = () => {
        try {
          const scale = 2;
          const canvas = document.createElement("canvas");
          canvas.width = 800 * scale;
          canvas.height = height * scale;
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Canvas is unavailable");
          context.scale(scale, scale);
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, 800, height);
          context.drawImage(image, 0, 0);

          canvas.toBlob((blob) => {
            if (!blob) {
              setError("Could not create the image. Please try again.");
              setBusy(false);
              return;
            }
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${props.number.replace(/[^a-z0-9-_]+/gi, "_")}.png`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            setBusy(false);
          }, "image/png");
        } catch {
          setError("Could not save the image. Please try again.");
          setBusy(false);
        } finally {
          URL.revokeObjectURL(svgUrl);
        }
      };

      image.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        setError("Could not render the invoice. Please try again.");
        setBusy(false);
      };

      image.src = svgUrl;
    } catch {
      setError("Could not prepare the invoice. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="inline-flex h-11 items-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
      >
        <Download className="size-4" />
        {busy ? "Preparing…" : "Download invoice"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
