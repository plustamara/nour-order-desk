import { NextResponse } from "next/server";
import {
  deleteOrder,
  getOrder,
  updateOrder,
  validateUpdate,
} from "../../../../lib/orders";
import { errorResponse, readJson } from "../../../../lib/http";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  const order = getOrder(id);
  if (!order) {
    return errorResponse("Order not found", 404);
  }
  return NextResponse.json(order);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!getOrder(id)) {
    return errorResponse("Order not found", 404);
  }

  const parsed = await readJson(request);
  if (!parsed.ok) {
    return errorResponse("Request body must be valid JSON", 400);
  }

  const result = validateUpdate(parsed.data);
  if (!result.ok) {
    return errorResponse(result.error, 400);
  }

  const updated = updateOrder(id, result.data);
  if (!updated) {
    return errorResponse("Order not found", 404);
  }
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  const deleted = deleteOrder(id);
  if (!deleted) {
    return errorResponse("Order not found", 404);
  }
  return new Response(null, { status: 204 });
}