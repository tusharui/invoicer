'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { generateInvoicePdf } from '@/lib/invoice-pdf';

export type CreateInvoiceState = {
  error?: string;
};

export type SendInvoiceState = {
  error?: string;
  success?: string;
};

function jsonRecord(value: unknown): Record<string, string> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        entry == null ? '' : String(entry),
      ]),
    );
  }
  return {};
}

type LineItem = {
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxRate: number;
  taxName: string;
};

function text(value: FormDataEntryValue | null, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function number(value: FormDataEntryValue | null, fallback = 0): number {
  if (value == null) return fallback;
  const parsed = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toDate(value: FormDataEntryValue | null): Date {
  const raw = text(value);
  if (!raw) return new Date();
  const parsed = new Date(`${raw}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function parsePaymentUrl(value: FormDataEntryValue | null): string | null | undefined {
  const raw = text(value);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

export async function createInvoice(
  _previousState: CreateInvoiceState,
  formData: FormData,
): Promise<CreateInvoiceState> {
  // Invoices are strictly for signed-in users — never trust the client here.
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { error: 'Please sign in before creating an invoice' };
  }

  const clientName = text(formData.get('clientName'));
  if (!clientName) {
    return { error: 'Client name is required' };
  }

  let lineItems: LineItem[] = [];
  try {
    const raw = JSON.parse(text(formData.get('items'), '[]'));
    if (Array.isArray(raw)) {
      lineItems = raw
        .map((item) => {
          const quantity = number(item?.quantity, 0);
          const unitPrice = number(item?.unitPrice, 0);
          const base = quantity * unitPrice;
          return {
            description: text(item?.description),
            unit: text(item?.unit),
            quantity,
            unitPrice,
            discountAmount: Math.min(Math.max(number(item?.discount, 0), 0), Math.max(base, 0)),
            taxRate: number(item?.taxRate, 0),
            taxName: text(item?.taxName),
          };
        })
        .filter((item) => item.description.length > 0);
    }
  } catch {
    return { error: 'Line items could not be read. Please try again' };
  }

  if (lineItems.length === 0) {
    return { error: 'Add at least one line item' };
  }

  const subtotal = round2(lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
  const itemDiscount = round2(lineItems.reduce((sum, item) => sum + item.discountAmount, 0));
  const taxAmount = round2(
    lineItems.reduce((sum, item) => {
      const net = item.quantity * item.unitPrice - item.discountAmount;
      return sum + (net * item.taxRate) / 100;
    }, 0),
  );
  const discountPercent = Math.min(Math.max(number(formData.get('discount'), 0), 0), 100);
  const discount = round2(((subtotal - itemDiscount + taxAmount) * discountPercent) / 100);
  const total = round2(subtotal - itemDiscount + taxAmount - discount);

  const paymentUrl = parsePaymentUrl(formData.get('paymentUrl'));
  if (paymentUrl === undefined) {
    return { error: 'Enter a valid payment link (https://...)' };
  }
  const paymentInstructions = text(formData.get('paymentInstructions')) || null;
  const paymentLabel = text(formData.get('paymentLabel')) || null;
  const saveDefaults = formData.get('saveDefaults') === 'on';

  const clerkUser = await currentUser();
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses?.[0]?.emailAddress ??
    '';

  let invoiceId: string;

  try {
    // First invoice for this account: mirror the Clerk user into our database.
    const dbUser = await prisma.user.upsert({
      where: { clerkId },
      update: {
        firstName: clerkUser?.firstName ?? null,
        lastName: clerkUser?.lastName ?? null,
        imageUrl: clerkUser?.imageUrl ?? null,
      },
      create: {
        clerkId,
        email: email || `${clerkId}@users.invalid`,
        firstName: clerkUser?.firstName ?? null,
        lastName: clerkUser?.lastName ?? null,
        imageUrl: clerkUser?.imageUrl ?? null,
      },
    });

    const fromName = text(formData.get('fromName'));
    const fromEmail = text(formData.get('fromEmail'));
    const fromPhone = text(formData.get('fromPhone'));
    const fromTaxId = text(formData.get('fromTaxId'));
    const fromWebsite = text(formData.get('fromWebsite'));
    const fromAddress = text(formData.get('fromAddress'));
    const fromAddressLine2 = text(formData.get('fromAddressLine2'));
    const invoiceNotes = text(formData.get('notes')) || null;
    const invoiceTerms = text(formData.get('terms')) || null;

    let business = await prisma.business.findUnique({
      where: { userId: dbUser.id },
    });
    if (fromName) {
      const businessData = {
        name: fromName,
        email: fromEmail || null,
        phone: fromPhone || null,
        taxId: fromTaxId || null,
        website: fromWebsite || null,
        addressLine1: fromAddress || null,
        addressLine2: fromAddressLine2 || null,
        ...(saveDefaults
          ? {
              defaultNotes: invoiceNotes,
              defaultTerms: invoiceTerms,
            }
          : {}),
      };
      business = await prisma.business.upsert({
        where: { userId: dbUser.id },
        update: businessData,
        create: {
          userId: dbUser.id,
          ...businessData,
        },
      });
    } else if (saveDefaults && business) {
      business = await prisma.business.update({
        where: { id: business.id },
        data: { defaultNotes: invoiceNotes, defaultTerms: invoiceTerms },
      });
    }

    const clientCompany = text(formData.get('clientCompany'));
    const clientEmail = text(formData.get('clientEmail'));
    const clientPhone = text(formData.get('clientPhone'));
    const clientTaxId = text(formData.get('clientTaxId'));
    const clientAddress = text(formData.get('clientAddress'));

    const client = await prisma.client.create({
      data: {
        userId: dbUser.id,
        name: clientName,
        company: clientCompany || null,
        email: clientEmail || null,
        phone: clientPhone || null,
        taxId: clientTaxId || null,
        addressLine1: clientAddress || null,
      },
    });

    const requestedNumber = text(formData.get('number'));
    const invoiceNumber =
      requestedNumber ||
      `${business?.invoicePrefix ?? 'INV'}-${business?.nextInvoiceNumber ?? 1}-${Date.now().toString().slice(-4)}`;

    const duplicate = await prisma.invoice.findUnique({
      where: { userId_number: { userId: dbUser.id, number: invoiceNumber } },
    });
    if (duplicate) {
      return { error: `Invoice number "${invoiceNumber}" is already in use` };
    }

    const invoice = await prisma.invoice.create({
      data: {
        userId: dbUser.id,
        businessId: business?.id ?? null,
        clientId: client.id,
        number: invoiceNumber,
        status: 'DRAFT',
        issueDate: toDate(formData.get('issueDate')),
        dueDate: toDate(formData.get('dueDate')),
        currency: text(formData.get('currency'), 'USD') || 'USD',
        subtotal,
        discountAmount: discount,
        taxAmount,
        total,
        amountPaid: 0,
        balanceDue: total,
        notes: invoiceNotes,
        terms: invoiceTerms,
        paymentUrl,
        paymentInstructions,
        paymentLabel,
        fromSnapshot: {
          name: fromName || business?.name || '',
          email: fromEmail || business?.email || '',
          phone: fromPhone || business?.phone || '',
          taxId: fromTaxId || business?.taxId || '',
          website: fromWebsite || business?.website || '',
          addressLine1: fromAddress || business?.addressLine1 || '',
          addressLine2: fromAddressLine2 || business?.addressLine2 || '',
        },
        toSnapshot: {
          name: clientName,
          company: clientCompany,
          email: clientEmail,
          phone: clientPhone,
          taxId: clientTaxId,
          addressLine1: clientAddress,
        },
        items: {
          create: lineItems.map((item, index) => {
            const base = item.quantity * item.unitPrice;
            const net = base - item.discountAmount;
            return {
              description: item.description,
              unit: item.unit || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountAmount: round2(item.discountAmount),
              taxRate: item.taxRate,
              taxName: item.taxName || null,
              taxAmount: round2((net * item.taxRate) / 100),
              amount: round2(base),
              position: index,
            };
          }),
        },
        activities: {
          create: { type: 'CREATED', message: 'Invoice created' },
        },
      },
    });

    if (business) {
      await prisma.business.update({
        where: { id: business.id },
        data: { nextInvoiceNumber: { increment: 1 } },
      });
    }

    invoiceId = invoice.id;
  } catch (error) {
    console.error('Failed to create invoice', error);
    return { error: 'Could not create the invoice. Please try again' };
  }

  redirect(`/invoices/${invoiceId}`);
}

export async function sendInvoice(
  _previousState: SendInvoiceState,
  formData: FormData,
): Promise<SendInvoiceState> {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { error: 'Please sign in to send an invoice' };
  }

  const invoiceId = text(formData.get('invoiceId'));
  const recipient = text(formData.get('email'));
  if (!invoiceId) {
    return { error: 'Invoice not found' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    return { error: 'Enter a valid recipient email address' };
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) {
    return { error: 'Account not found' };
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId: dbUser.id },
    include: { items: { orderBy: { position: 'asc' } } },
  });
  if (!invoice) {
    return { error: 'Invoice not found' };
  }
  if (['VOID', 'SUPERSEDED', 'PAID'].includes(invoice.status)) {
    return { error: 'This invoice cannot be sent' };
  }
  const isReminder = Boolean(invoice.lockedAt);

  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPassword) {
    return {
      error:
        'Email is not configured yet. Add GMAIL_USER and GMAIL_APP_PASSWORD to .env and restart the server',
    };
  }

  const from = jsonRecord(invoice.fromSnapshot);
  const to = jsonRecord(invoice.toSnapshot);
  const displayDate = (value: Date) =>
    value.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  try {
    const pdf = await generateInvoicePdf({
      number: invoice.number,
      issueDate: displayDate(invoice.issueDate),
      dueDate: displayDate(invoice.dueDate),
      currency: invoice.currency,
      from: {
        name: from.name,
        email: from.email,
        addressLine1: from.addressLine1,
      },
      to: {
        name: to.name,
        company: to.company,
        email: to.email,
        addressLine1: to.addressLine1,
      },
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
        taxRate: String(item.taxRate),
        amount: String(item.amount),
      })),
      subtotal: String(invoice.subtotal),
      taxAmount: String(invoice.taxAmount),
      discountAmount: String(invoice.discountAmount),
      total: String(invoice.total),
      notes: invoice.notes,
      terms: invoice.terms,
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    const balanceDue = Number(invoice.balanceDue ?? invoice.total);
    const safePaymentUrl = invoice.paymentUrl
      ? invoice.paymentUrl.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      : null;
    const payNowBlock = safePaymentUrl
      ? `
          <p style="margin:24px 0 8px">
            <a href="${safePaymentUrl}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px;font-weight:600">Pay now</a>
          </p>
          <p style="color:#555;font-size:13px;line-height:1.6;margin:0 0 24px">
            Or copy this link: <a href="${safePaymentUrl}" style="color:#111">${safePaymentUrl}</a>
          </p>
        `
      : "";

    await transporter.sendMail({
      from: `"Invoicer" <${gmailUser}>`,
      to: recipient,
      subject: `Invoice ${invoice.number} from ${from.name || 'Invoicer'}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#111;max-width:600px;margin:auto">
          <h1 style="font-size:24px;margin:0 0 8px">Invoice ${invoice.number}</h1>
          <p style="color:#555;font-size:14px;margin:0 0 24px">
            Issued ${displayDate(invoice.issueDate)} · Due ${displayDate(invoice.dueDate)}
          </p>
          <p style="font-size:14px;line-height:1.6">
            Hi ${to.name || 'there'},<br /><br />
            Please find invoice <strong>${invoice.number}</strong> attached.
            Balance due is <strong>${invoice.currency} ${balanceDue.toFixed(2)}</strong>,
            payable by ${displayDate(invoice.dueDate)}.
          </p>
          ${payNowBlock}
          <p style="color:#555;font-size:13px;margin-top:32px">
            Sent by ${from.name || 'Invoicer'}${from.email ? ` (${from.email})` : ''}.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${invoice.number}.pdf`,
          content: pdf,
          contentType: 'application/pdf',
        },
      ],
    });

    await prisma.$transaction(async (tx) => {
      if (!isReminder) {
        await tx.invoiceRevision.create({
          data: {
            invoiceId: invoice.id,
            version: invoice.version,
            action: "SENT",
            reason: `Sent to ${recipient}`,
            snapshot: {
              snapshotVersion: 1,
              capturedAt: new Date().toISOString(),
              invoice: {
                id: invoice.id,
                number: invoice.number,
                status: invoice.status,
                total: String(invoice.total),
                balanceDue: String(invoice.balanceDue),
                amountPaid: String(invoice.amountPaid),
                paymentUrl: invoice.paymentUrl,
              },
            } as object,
          },
        });
      }

      await tx.invoice.update({
        where: { id: invoice.id },
        data: isReminder
          ? { sentAt: new Date() }
          : { status: "SENT", sentAt: new Date(), lockedAt: invoice.lockedAt ?? new Date() },
      });
      await tx.invoiceActivity.create({
        data: {
          invoiceId: invoice.id,
          type: isReminder ? "REMINDER_SENT" : "SENT",
          message: isReminder ? `Reminder sent to ${recipient}.` : `Invoice sent to ${recipient}.`,
          metadata: { recipient },
        },
      });
    });

    revalidatePath('/dashboard');
    revalidatePath('/invoices');
    revalidatePath(`/invoices/${invoice.id}`);

    return { success: isReminder ? `Reminder sent to ${recipient}.` : `Invoice sent to ${recipient}.` };
  } catch (error) {
    console.error('Failed to send invoice', error);
    return { error: 'Could not send the invoice. Please try again' };
  }
}
