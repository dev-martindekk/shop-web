import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, handleApiError } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireUser();
    const orders = await db.order.findMany({
      where: { userId: session.uid },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();
    const { items, name, phone, address, note } = await req.json();

    if (!Array.isArray(items) || items.length === 0 || !name || !phone || !address) {
      return NextResponse.json({ error: "invalid input" }, { status: 400 });
    }

    const order = await db.$transaction(async (tx) => {
      let total = new Prisma.Decimal(0);
      const orderItems: { productId: number; productName: string; price: Prisma.Decimal; quantity: number }[] = [];

      for (const item of items) {
        const qty = parseInt(item.quantity);
        const pid = parseInt(item.productId);
        if (isNaN(qty) || qty < 1 || isNaN(pid)) throw new Error("invalid item");

        const product = await tx.product.findFirst({ where: { id: pid, isActive: true } });
        if (!product) throw new Error("product not found");
        if (product.stock < qty) throw new Error("notEnoughStock:" + product.name);

        await tx.product.update({
          where: { id: pid },
          data: { stock: { decrement: qty } },
        });

        total = total.add(product.price.mul(qty));
        orderItems.push({
          productId: pid,
          productName: product.name,
          price: product.price,
          quantity: qty,
        });
      }

      return tx.order.create({
        data: {
          userId: session.uid,
          total,
          name,
          phone,
          address,
          note: note || null,
          items: { create: orderItems },
        },
      });
    });

    // save shipping info to profile for next time
    await db.user.update({
      where: { id: session.uid },
      data: { phone, address },
    });

    return NextResponse.json({ order });
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("notEnoughStock")) {
      return NextResponse.json(
        { error: "notEnoughStock", product: e.message.split(":")[1] },
        { status: 409 }
      );
    }
    return handleApiError(e);
  }
}
