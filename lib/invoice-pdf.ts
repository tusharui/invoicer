import PDFDocument from "pdfkit";

export type InvoicePdfData = {
  number: string;
  status: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  from: { name: string; email: string; addressLine1: string };
  to: {
    name: string;
    company: string;
    email: string;
    addressLine1: string;
  };
  items: {
    description: string;
    quantity: string;
    unitPrice: string;
    taxRate: string;
    amount: string;
  }[];
  subtotal: string;
  taxAmount: string;
  discountAmount: string;
  total: string;
  notes: string | null;
  terms: string | null;
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
    let y = 48;

    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(28);
    doc.text("INVOICE", left, y);
    y += 40;

    doc.font("Helvetica-Bold").fontSize(16);
    doc.text(data.number, left, y);
    y += 24;

    doc.font("Helvetica").fontSize(10).fillColor("#444444");
    doc.text(
      `STATUS: ${data.status.toUpperCase()}    |    Issued ${data.issueDate}    |    Due ${data.dueDate}`,
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
        addressLine1: string;
      },
      x: number,
    ) => {
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#666666");
      doc.text(title, x, y);
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#000000");
      doc.text(value.name || "-", x, y + 16);
      doc.font("Helvetica").fontSize(10).fillColor("#444444");
      const secondary = [value.company, value.email].filter(Boolean).join(" | ");
      if (secondary) doc.text(secondary, x, y + 34);
      if (value.addressLine1) doc.text(value.addressLine1, x, y + 50);
    };

    party("BILL FROM", data.from, left);
    party("BILL TO", data.to, 330);
    y += 84;

    doc.moveTo(left, y).lineTo(right, y).strokeColor("#dddddd").stroke();
    y += 20;

    const header = (atY: number) => {
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#666666");
      doc.text("DESCRIPTION", left, atY);
      doc.text("QTY", 390, atY, { width: 45, align: "right" });
      doc.text("RATE", 445, atY, { width: 55, align: "right" });
      doc.text("TAX", 510, atY, { width: 40, align: "right" });
      doc.text("AMOUNT", right - 70, atY, { width: 70, align: "right" });
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
      doc.text(item.description, left, y, { width: 320 });
      doc.text(String(item.quantity), 390, y, { width: 45, align: "right" });
      doc.text(amount(item.unitPrice), 445, y, {
        width: 55,
        align: "right",
      });
      doc.text(`${String(item.taxRate)}%`, 510, y, {
        width: 40,
        align: "right",
      });
      doc.font("Helvetica-Bold");
      doc.text(amount(item.amount), right - 70, y, {
        width: 70,
        align: "right",
      });
      y += 22;
    }

    y += 12;
    doc.moveTo(left, y).lineTo(right, y).strokeColor("#dddddd").stroke();
    y += 16;

    const totalLine = (label: string, value: string, bold = false) => {
      doc
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(bold ? 12 : 10)
        .fillColor("#000000");
      doc.text(label, 390, y, { width: 110, align: "right" });
      doc.text(value, right - 100, y, { width: 100, align: "right" });
      y += bold ? 24 : 18;
    };

    totalLine("Subtotal", amount(data.subtotal));
    totalLine("Tax", amount(data.taxAmount));
    totalLine("Discount", `-${amount(data.discountAmount)}`);
    totalLine(
      "Total",
      `${data.currency} ${amount(data.total)}`,
      true,
    );

    if (data.notes || data.terms) {
      y += 16;
      if (data.notes) {
        doc.font("Helvetica-Bold").fontSize(8).fillColor("#666666");
        doc.text("NOTES", left, y);
        doc.font("Helvetica").fontSize(10).fillColor("#444444");
        doc.text(data.notes, left, y + 14, { width: 470 });
        y += 46;
      }
      if (data.terms) {
        doc.font("Helvetica-Bold").fontSize(8).fillColor("#666666");
        doc.text("TERMS", left, y);
        doc.font("Helvetica").fontSize(10).fillColor("#444444");
        doc.text(data.terms, left, y + 14, { width: 470 });
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
