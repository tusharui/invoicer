import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const overdueCandidates = await prisma.invoice.findMany({
    where: {
      status: { in: ["SENT", "VIEWED", "OVERDUE"] },
      balanceDue: { gt: 0 },
      dueDate: { lt: startOfToday },
    },
    select: { id: true, status: true },
  });

  let updated = 0;
  for (const invoice of overdueCandidates) {
    if (invoice.status === "OVERDUE") continue;
    await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: "OVERDUE" },
      });
      await tx.invoiceActivity.create({
        data: {
          invoiceId: invoice.id,
          type: "MARKED_OVERDUE",
          message: "Invoice marked overdue by scheduled check",
        },
      });
    });
    updated += 1;
  }

  return NextResponse.json({ ok: true, checked: overdueCandidates.length, updated });
}