import PDFDocument from "pdfkit";

export type InvoicePdfData = {
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
  };
  to: {
    name: string;
    company: string;
    email: string;
    phone?: string;
    taxId?: string;
    addressLine1: string;
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

function amount(value: string): string {
  const parsed = Number(value ?? 0);
  return (Number.isFinite(parsed) ? parsed : 0).toFixed(2);
}

export function generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = 48;
    const right = doc.page.width - 48;
    // Fixed, non-overlapping column boxes (x + width). Every value is
    // right-aligned inside its own box so nothing runs into the next column.
    const col = {
      description: { x: left, width: 210 },
      qty: { x: 265, width: 55 },
      rate: { x: 330, width: 65 },
      tax: { x: 405, width: 65 },
      amount: { x: 480, width: right - 480 },
    };
    let y = 48;

    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(28);
    doc.text("INVOICE", left, y);
    y += 40;

    doc.font("Helvetica-Bold").fontSize(16);
    doc.text(data.number, left, y);
    y += 24;

    doc.font("Helvetica").fontSize(10).fillColor("#444444");
    doc.text(
      `Issued ${data.issueDate}    Due ${data.dueDate}${data.referenceNumber ? `    Ref ${data.referenceNumber}` : ""}`,
      left,
      y,
    );
    y += 20;

    doc.moveTo(left, y).lineTo(right, y).strokeColor("#dddddd").stroke();
    y += 24;

    const party = (
      title: string,
      value: {
        name: string;
        company?: string;
        email: string;
        phone?: string;
        taxId?: string;
        website?: string;
        addressLine1: string;
        addressLine2?: string;
      },
      x: number,
    ) => {
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#666666");
      doc.text(title, x, y);
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#000000");
      doc.text(value.name || "-", x, y + 16, { width: 250 });
      doc.font("Helvetica").fontSize(10).fillColor("#444444");
      const lines = [
        [value.company, value.email].filter(Boolean).join(" | "),
        [value.phone, value.website].filter(Boolean).join(" | "),
        value.taxId ? `Tax ID ${value.taxId}` : "",
        value.addressLine1,
        value.addressLine2,
      ].filter(Boolean) as string[];
      lines.slice(0, 4).forEach((line, i) => {
        doc.text(line, x, y + 34 + i * 14, { width: 250 });
      });
    };

    party("BILL FROM", data.from, left);
    party("BILL TO", data.to, 330);
    y += 100;

    doc.moveTo(left, y).lineTo(right, y).strokeColor("#dddddd").stroke();
    y += 20;

    const header = (atY: number) => {
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#666666");
      doc.text("DESCRIPTION", col.description.x, atY);
      doc.text("QTY", col.qty.x, atY, {
        width: col.qty.width,
        align: "right",
      });
      doc.text("RATE", col.rate.x, atY, {
        width: col.rate.width,
        align: "right",
      });
      doc.text("TAX %", col.tax.x, atY, {
        width: col.tax.width,
        align: "right",
      });
      doc.text("AMOUNT", col.amount.x, atY, {
        width: col.amount.width,
        align: "right",
      });
    };
    header(y);
    y += 16;
    doc.moveTo(left, y).lineTo(right, y).strokeColor("#000000").stroke();
    y += 14;

    for (const item of data.items) {
      if (y > 720) {
        doc.addPage();
        y = 48;
        header(y);
        y += 30;
      }
      doc.font("Helvetica").fontSize(10).fillColor("#000000");
      const descHeight = doc.heightOfString(item.description, { width: col.description.width });
      doc.text(item.description, col.description.x, y, {
        width: col.description.width,
      });
      const qtyText = item.unit ? `${String(item.quantity)} ${item.unit}` : String(item.quantity);
      doc.text(qtyText, col.qty.x, y, {
        width: col.qty.width,
        align: "right",
      });
      doc.text(amount(item.unitPrice), col.rate.x, y, {
        width: col.rate.width,
        align: "right",
      });
      const taxText = item.taxName ? `${String(item.taxRate)}% ${item.taxName}` : `${String(item.taxRate)}%`;
      doc.text(taxText, col.tax.x, y, {
        width: col.tax.width,
        align: "right",
      });
      doc.font("Helvetica-Bold");
      doc.text(amount(item.amount), col.amount.x, y, {
        width: col.amount.width,
        align: "right",
      });
      let rowHeight = Math.max(22, descHeight + 4);
      const discountAmt = Number(item.discountAmount ?? 0);
      if (discountAmt > 0) {
        doc.font("Helvetica").fontSize(8).fillColor("#666666");
        doc.text(`Discount -${amount(String(discountAmt))}`, col.description.x, y + descHeight + 2, {
          width: col.description.width,
        });
        rowHeight = Math.max(rowHeight, descHeight + 16);
      }
      y += rowHeight;
    }

    y += 12;
    doc.moveTo(left, y).lineTo(right, y).strokeColor("#dddddd").stroke();
    y += 16;

    const totalLine = (label: string, value: string, bold = false) => {
      doc
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(bold ? 12 : 10)
        .fillColor("#000000");
      // Label ends at 420, value starts at 430 — a fixed 10pt gap.
      doc.text(label, 280, y, { width: 140, align: "right" });
      doc.text(value, 430, y, { width: right - 430, align: "right" });
      y += bold ? 24 : 18;
    };

    totalLine("Subtotal", amount(data.subtotal));
    totalLine(data.taxLabel ? `${data.taxLabel} amount` : "Tax amount", amount(data.taxAmount));
    totalLine("Discount", `-${amount(data.discountAmount)}`);
    if (Number(data.shippingAmount ?? 0) > 0) totalLine("Shipping and fees", amount(String(data.shippingAmount)));
    totalLine("Total", `${data.currency} ${amount(data.total)}`, true);
    if (Number(data.depositAmount ?? 0) > 0) totalLine("Deposit due", `${data.currency} ${amount(String(data.depositAmount))}`);

    if (data.notes || data.terms || data.paymentInstructions || data.paymentUrl) {
      y += 16;
      if (data.notes) {
        if (y > 700) { doc.addPage(); y = 48; }
        doc.font("Helvetica-Bold").fontSize(8).fillColor("#666666");
        doc.text("NOTES", left, y);
        doc.font("Helvetica").fontSize(10).fillColor("#444444");
        doc.text(data.notes, left, y + 14, { width: 470 });
        y += Math.max(46, doc.heightOfString(data.notes, { width: 470 }) + 24);
      }
      if (data.terms) {
        if (y > 700) { doc.addPage(); y = 48; }
        doc.font("Helvetica-Bold").fontSize(8).fillColor("#666666");
        doc.text("TERMS", left, y);
        doc.font("Helvetica").fontSize(10).fillColor("#444444");
        doc.text(data.terms, left, y + 14, { width: 470 });
        y += Math.max(46, doc.heightOfString(data.terms, { width: 470 }) + 24);
      }
      if (data.paymentInstructions || data.paymentUrl) {
        if (y > 700) { doc.addPage(); y = 48; }
        doc.font("Helvetica-Bold").fontSize(8).fillColor("#666666");
        doc.text("PAYMENT", left, y);
        doc.font("Helvetica").fontSize(10).fillColor("#444444");
        const paymentText = [data.paymentInstructions, data.paymentUrl ? `${data.paymentLabel || "Pay now"}: ${data.paymentUrl}` : ""].filter(Boolean).join("\n");
        doc.text(paymentText, left, y + 14, { width: 470 });
      }
    }

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#999999")
      .text("Generated by Invoicer", left, doc.page.height - 48, {
        width: right - left,
        align: "center",
      });

    doc.end();
  });
}
