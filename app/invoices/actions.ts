'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export type CreateInvoiceState = {
  error?: string;
};

type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
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

export async function createInvoice(
  _previousState: CreateInvoiceState,
  formData: FormData,
): Promise<CreateInvoiceState> {
  // Invoices are strictly for signed-in users — never trust the client here.
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { error: 'Please sign in before creating an invoice.' };
  }

  const clientName = text(formData.get('clientName'));
  if (!clientName) {
    return { error: 'Client name is required.' };
  }

  let lineItems: LineItem[] = [];
  try {
    const raw = JSON.parse(text(formData.get('items'), '[]'));
    if (Array.isArray(raw)) {
      lineItems = raw
        .map((item) => ({
          description: text(item?.description),
          quantity: number(item?.quantity, 0),
          unitPrice: number(item?.unitPrice, 0),
          taxRate: number(item?.taxRate, 0),
        }))
        .filter((item) => item.description.length > 0);
    }
  } catch {
    return { error: 'Line items could not be read. Please try again.' };
  }

  if (lineItems.length === 0) {
    return { error: 'Add at least one line item.' };
  }

  const subtotal = round2(
    lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
  );
  const taxAmount = round2(
    lineItems.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate) / 100,
      0,
    ),
  );
  const discount = round2(Math.min(Math.max(number(formData.get('discount'), 0), 0), subtotal + taxAmount));
  const total = round2(subtotal + taxAmount - discount);

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
    const fromAddress = text(formData.get('fromAddress'));

    let business = await prisma.business.findUnique({
      where: { userId: dbUser.id },
    });
    if (fromName) {
      business = await prisma.business.upsert({
        where: { userId: dbUser.id },
        update: {
          name: fromName,
          email: fromEmail || null,
          addressLine1: fromAddress || null,
        },
        create: {
          userId: dbUser.id,
          name: fromName,
          email: fromEmail || null,
          addressLine1: fromAddress || null,
        },
      });
    }

    const clientCompany = text(formData.get('clientCompany'));
    const clientEmail = text(formData.get('clientEmail'));
    const clientAddress = text(formData.get('clientAddress'));

    const client = await prisma.client.create({
      data: {
        userId: dbUser.id,
        name: clientName,
        company: clientCompany || null,
        email: clientEmail || null,
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
      return { error: `Invoice number "${invoiceNumber}" is already in use.` };
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
        notes: text(formData.get('notes')) || null,
        terms: text(formData.get('terms')) || null,
        fromSnapshot: business
          ? {
              name: business.name,
              email: business.email,
              addressLine1: business.addressLine1,
            }
          : { name: fromName, email: fromEmail, addressLine1: fromAddress },
        toSnapshot: {
          name: clientName,
          company: clientCompany,
          email: clientEmail,
          addressLine1: clientAddress,
        },
        items: {
          create: lineItems.map((item, index) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            taxAmount: round2(
              (item.quantity * item.unitPrice * item.taxRate) / 100,
            ),
            amount: round2(item.quantity * item.unitPrice),
            position: index,
          })),
        },
        activities: {
          create: { type: 'CREATED', message: 'Invoice created.' },
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
    return { error: 'Could not create the invoice. Please try again.' };
  }

  redirect(`/invoices/${invoiceId}`);
}
