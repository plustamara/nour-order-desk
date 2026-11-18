import { NextResponse } from "next/server";
import { createOrder, listOrders, validateNewOrder } from "../../../lib/orders";
import { errorResponse, readJson } from "../../../lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(listOrders());
}

export async function POST(request: Request) {
  const parsed = await readJson(request);
  if (!parsed.ok) {
    return errorResponse("Request body must be valid JSON", 400);
  }

  const result = validateNewOrder(parsed.data);
  if (!result.ok) {
    return errorResponse(result.error, 400);
  }

  const order = createOrder(result.data);
  return NextResponse.json(order, { status: 201 });
}