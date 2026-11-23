import { prisma } from "@/lib/prisma";

export function buildReplacementNumber(baseNumber: string, version: number): string {
  const root = baseNumber.replace(/-R\d+$/, "");
  return `${root}-R${version}`;
}

export async function getUniqueReplacementNumber(userId: string, baseNumber: string, version: number): Promise<string> {
  const base = buildReplacementNumber(baseNumber, version);
  let candidate = base;
  let i = 2;
  while (true) {
    const existing = await prisma.invoice.findUnique({
      where: { userId_number: { userId, number: candidate } },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${base}-${i}`;
    i += 1;
  }
}