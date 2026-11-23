"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export type InvoiceDownloadData = {
  number: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  from: {
    name: string;
    email: string;
    phone?: string;
    taxId?: string;
    website?: string;
    addressLine1: string;
    addressLine2?: string;
    company?: string;
  };
  to: {
    name: string;
    email: string;
    phone?: string;
    taxId?: string;
    addressLine1: string;
    company?: string;
  };
  items: {
    description: string;
    unit?: string;
    quantity: string;
    unitPrice: string;
    discountAmount?: string;
    taxRate: string;
    taxName?: string;
    amount: string;
  }[];
  subtotal: string;
  taxAmount: string;
  discountAmount: string;
  shippingAmount?: string;
  depositAmount?: string;
  total: string;
  notes: string | null;
  terms: string | null;
  referenceNumber?: string | null;
  taxLabel?: string | null;
  paymentInstructions?: string | null;
  paymentLabel?: string | null;
  paymentUrl?: string | null;
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

export function buildInvoiceSvg(props: InvoiceDownloadData): { svg: string; height: number } {
  const width = 800;
  const margin = 48;
  const right = width - margin;

  const partyExtraLines = (party: InvoiceDownloadData["from"] | InvoiceDownloadData["to"]) => {
    const lines = [
      [party.company, party.email].filter(Boolean).join(" · "),
      [party.phone, (party as InvoiceDownloadData["from"]).website].filter(Boolean).join(" · "),
      party.taxId ? `Tax ID ${party.taxId}` : "",
      party.addressLine1,
      (party as InvoiceDownloadData["from"]).addressLine2 || "",
    ].filter(Boolean);
    return lines;
  };

  const fromLines = partyExtraLines(props.from);
  const toLines = partyExtraLines(props.to);
  const partyLineCount = Math.max(fromLines.length, toLines.length, 1);
  const partyTop = 214;
  const partyLinesStart = 262;
  const partyBlockBottom = partyLinesStart + partyLineCount * 20 + 10;
  const tableDividerY = partyBlockBottom + 8;
  const tableHeadY = tableDividerY + 30;
  const tableHeadLineY = tableHeadY + 16;
  const rowsStart = tableHeadLineY + 30;

  const rowsEnd = rowsStart + props.items.length * 34;
  const totalsTop = rowsEnd + 24;

  const extraTotalsHeight = (Number(props.shippingAmount ?? 0) > 0 ? 30 : 0) + (Number(props.depositAmount ?? 0) > 0 ? 30 : 0);
  let bottom = totalsTop + 130 + extraTotalsHeight;
  if (props.notes) bottom += 80;
  if (props.terms) bottom += 80;
  if (props.paymentInstructions || props.paymentUrl) bottom += 80;
  const height = Math.max(660, bottom + 60);

  const partyBlock = (party: InvoiceDownloadData["from"] | InvoiceDownloadData["to"], x: number, title: string) => {
    const lines = partyExtraLines(party);
    return `
    ${multiLine(title, x, partyTop, 'class="lbl"')}
    ${multiLine(party.name || "-", x, 240, 'class="name"')}
    ${lines.map((line, i) => multiLine(line, x, partyLinesStart + i * 20, 'class="muted"')).join("")}
  `;
  };

  const rows = props.items
    .map((item, index) => {
      const y = rowsStart + index * 34;
      const discountAmt = Number(item.discountAmount ?? 0);
      const desc = discountAmt > 0 ? `${item.description}\nDiscount: -${discountAmt.toFixed(2)}` : item.description;
      const qtyText = item.unit ? `${item.quantity} ${item.unit}` : item.quantity;
      const taxText = item.taxName ? `${item.taxRate}% ${item.taxName}` : `${item.taxRate}%`;
      return `
        ${multiLine(desc, margin, y, 'class="cell"')}
        <text x="490" y="${y}" text-anchor="end" class="cell">${esc(qtyText)}</text>
        <text x="575" y="${y}" text-anchor="end" class="cell">${esc(item.unitPrice)}</text>
        <text x="655" y="${y}" text-anchor="end" class="cell">${esc(taxText)}</text>
        <text x="${right}" y="${y}" text-anchor="end" class="cell strong">${esc(item.amount)}</text>
      `;
    })
    .join("");

  const totalRow = (label: string, value: string, y: number, strong = false) => `
    <text x="560" y="${y}" text-anchor="end" class="${strong ? "total" : "muted"}">${esc(label)}</text>
    <text x="${right}" y="${y}" text-anchor="end" class="${strong ? "total" : "cell"}">${esc(value)}</text>
  `;

  let notesY = totalsTop + 150 + (Number(props.shippingAmount ?? 0) > 0 ? 30 : 0) + (Number(props.depositAmount ?? 0) > 0 ? 30 : 0);
  let notesBlock = "";
  if (props.notes) {
    notesBlock += `${multiLine("NOTES", margin, notesY, 'class="lbl"')}`;
    notesBlock += `${multiLine(props.notes, margin, notesY + 22, 'class="muted"')}`;
    notesY += 80;
  }
  if (props.terms) {
    notesBlock += `${multiLine("TERMS", margin, notesY, 'class="lbl"')}`;
    notesBlock += `${multiLine(props.terms, margin, notesY + 22, 'class="muted"')}`;
    notesY += 80;
  }
  if (props.paymentInstructions || props.paymentUrl) {
    const paymentText = [props.paymentInstructions, props.paymentUrl ? `${props.paymentLabel || "Pay now"}: ${props.paymentUrl}` : ""].filter(Boolean).join("\n");
    notesBlock += `${multiLine("PAYMENT", margin, notesY, 'class="lbl"')}`;
    notesBlock += `${multiLine(paymentText, margin, notesY + 22, 'class="muted"')}`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <style>
      .lbl { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: bold; letter-spacing: 2px; fill: #000000; }
      .name { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: bold; fill: #000000; }
      .muted { font-family: 'Inter', sans-serif; font-size: 16px; fill: #000000; }
      .cell { font-family: 'Inter', sans-serif; font-size: 16px; fill: #000000; }
      .strong { font-weight: bold; fill: #000000; }
      .total { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: bold; fill: #000000; }
      .head { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: bold; letter-spacing: 1px; fill: #000000; }
    </style>
    <rect width="${width}" height="${height}" fill="#ffffff" />
    <text x="${margin}" y="70" font-family="Inter, sans-serif" font-size="24" font-weight="bold" letter-spacing="2" fill="#000000">INVOICE</text>
    <text x="${margin}" y="104" font-family="Inter, sans-serif" font-size="16" font-weight="bold" fill="#000000">${esc(props.number)}</text>
    <text x="${margin}" y="160" font-family="Inter, sans-serif" font-size="16" fill="#000000">Issued ${esc(props.issueDate)}    Due ${esc(props.dueDate)}${props.referenceNumber ? `    Ref ${esc(props.referenceNumber)}` : ""}</text>
    <line x1="${margin}" y1="182" x2="${right}" y2="182" stroke="#000000" stroke-width="1" />
    ${partyBlock(props.from, margin, "BILL FROM")}
    ${partyBlock(props.to, 430, "BILL TO")}
    <line x1="${margin}" y1="${tableDividerY}" x2="${right}" y2="${tableDividerY}" stroke="#000000" stroke-width="1" />
    <text x="${margin}" y="${tableHeadY}" class="head">DESCRIPTION</text>
    <text x="490" y="${tableHeadY}" text-anchor="end" class="head">QTY</text>
    <text x="575" y="${tableHeadY}" text-anchor="end" class="head">RATE</text>
    <text x="655" y="${tableHeadY}" text-anchor="end" class="head">TAX %</text>
    <text x="${right}" y="${tableHeadY}" text-anchor="end" class="head">AMOUNT</text>
    <line x1="${margin}" y1="${tableHeadLineY}" x2="${right}" y2="${tableHeadLineY}" stroke="#000000" stroke-width="1" />
    ${rows}
    <line x1="${margin}" y1="${rowsEnd + 4}" x2="${right}" y2="${rowsEnd + 4}" stroke="#000000" stroke-width="1" />
    ${(() => {
      const rows: string[] = [];
      let y = totalsTop + 10;
      rows.push(totalRow("Subtotal", props.subtotal, y)); y += 30;
      rows.push(totalRow(props.taxLabel ? `${props.taxLabel} amount` : "Tax amount", props.taxAmount, y)); y += 30;
      rows.push(totalRow("Discount", `-${props.discountAmount}`, y)); y += 30;
      if (Number(props.shippingAmount ?? 0) > 0) { rows.push(totalRow("Shipping and fees", String(props.shippingAmount), y)); y += 30; }
      rows.push(totalRow("Total", `${props.currency} ${props.total}`, y, true)); y += 40;
      if (Number(props.depositAmount ?? 0) > 0) { rows.push(totalRow("Deposit due", `${props.currency} ${props.depositAmount}`, y)); y += 30; }
      return rows.join("");
    })()}
    ${notesBlock}
  </svg>`;

  return { svg, height };
}

export async function downloadInvoicePng(props: InvoiceDownloadData): Promise<void> {
  if (document.fonts?.load) {
    try {
      await document.fonts.load("12px 'Inter'");
      await document.fonts.load("700 12px 'Inter'");
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

  await new Promise<void>((resolve, reject) => {
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
            reject(new Error("Could not create the image Please try again"));
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
          resolve();
        }, "image/png");
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Could not save the image Please try again"));
      } finally {
        URL.revokeObjectURL(svgUrl);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error("Could not render the invoice Please try again"));
    };

    image.src = svgUrl;
  });
}

export function DownloadInvoiceButton(props: InvoiceDownloadData) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setBusy(true);
    setError(null);
    try {
      await downloadInvoicePng(props);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not prepare the invoice Please try again");
    } finally {
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
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}