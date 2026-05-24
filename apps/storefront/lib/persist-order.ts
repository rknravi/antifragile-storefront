import "server-only";

import { prisma } from "@/lib/prisma";
import { awardPointsForOrder } from "@/lib/loyalty";

export type PersistOrderInput = {
  sourceOrderId: string;
  gateway: string;
  paymentRef?: string | null;
  razorpayOrderId?: string | null;
  customer: { name: string; email: string; mobile: string };
  shippingAddress: { address: string; city: string; pin: string; gstNumber?: string };
  items: { name: string; sku: string; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingFee: number;
  total: number;
};

export async function persistOrderRecord(
  input: PersistOrderInput
): Promise<{ persisted: boolean; pointsAwarded: number; pointsBalance: number }> {
  if (!process.env.DATABASE_URL) {
    return { persisted: false, pointsAwarded: 0, pointsBalance: 0 };
  }

  const email = input.customer.email.trim().toLowerCase();
  const status =
    input.gateway === "cod"
      ? "cod_pending"
      : input.gateway === "demo"
        ? "demo_completed"
        : "paid";

  try {
    await prisma.order.upsert({
      where: { sourceOrderId: input.sourceOrderId },
      create: {
        sourceOrderId: input.sourceOrderId,
        status,
        gateway: input.gateway,
        paymentRef: input.paymentRef ?? null,
        razorpayOrderId: input.razorpayOrderId ?? null,
        customerJson: JSON.stringify(input.customer),
        shippingJson: JSON.stringify(input.shippingAddress),
        itemsJson: JSON.stringify(input.items),
        totalsJson: JSON.stringify({
          subtotal: input.subtotal,
          discount: input.discount,
          tax: input.tax,
          shippingFee: input.shippingFee,
          total: input.total,
        }),
      },
      update: {
        status,
        paymentRef: input.paymentRef ?? null,
        customerJson: JSON.stringify(input.customer),
        shippingJson: JSON.stringify(input.shippingAddress),
        itemsJson: JSON.stringify(input.items),
        totalsJson: JSON.stringify({
          subtotal: input.subtotal,
          discount: input.discount,
          tax: input.tax,
          shippingFee: input.shippingFee,
          total: input.total,
        }),
      },
    });

    const loyalty = await awardPointsForOrder({
      email,
      sourceOrderId: input.sourceOrderId,
      orderTotal: input.total,
    });

    return {
      persisted: true,
      pointsAwarded: loyalty.awarded,
      pointsBalance: loyalty.balance,
    };
  } catch {
    return { persisted: false, pointsAwarded: 0, pointsBalance: 0 };
  }
}
