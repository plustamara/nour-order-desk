import {
  STATUSES,
  type Order,
  type OrderInput,
  type OrderStatus,
  type OrderUpdate,
} from "../lib/types";


type Result<T> = { ok: true; data: T } | { ok: false; error: string };

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}


// Work in integer cents to avoid floating point 
export function calculateTotal(quantity: number, unitPrice: number): number {
  const cents = Math.round(unitPrice * 100);
  return (cents * quantity) / 100;
}


function checkText(value: unknown, label: string): Result<string> {
  if (typeof value !== "string" || value.trim() === "") {
    return fail(`${label} is required and cannot be blank`);
  }
  return { ok: true, data: value.trim() };
}

function checkQuantity(value: unknown): Result<number> {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    return fail("Quantity must be a positive integer");
  }
  return { ok: true, data: value };
}

function checkUnitPrice(value: unknown): Result<number> {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return fail("Unit price must be a number that is 0 or more");
  }
  const cents = value * 100;
  if (Math.abs(cents - Math.round(cents)) > 1e-6) {
    return fail("Unit price can have at most two decimal places");
  }
  return { ok: true, data: value };
}

function checkStatus(value: unknown): Result<OrderStatus> {
  if (typeof value !== "string" || !STATUSES.includes(value as OrderStatus)) {
    return fail(`Status must be one of: ${STATUSES.join(", ")}`);
  }
  return { ok: true, data: value as OrderStatus };
}

function isObject(body: unknown): body is Record<string, unknown> {
  return typeof body === "object" && body !== null && !Array.isArray(body);
}


export function validateNewOrder(body: unknown): Result<OrderInput> {
  if (!isObject(body)) return fail("Request body must be a JSON object");

  const customerName = checkText(body.customerName, "Customer name");
  if (!customerName.ok) return customerName;

  const phone = checkText(body.phone, "Phone");
  if (!phone.ok) return phone;

  const productName = checkText(body.productName, "Product name");
  if (!productName.ok) return productName;

  const quantity = checkQuantity(body.quantity);
  if (!quantity.ok) return quantity;

  const unitPrice = checkUnitPrice(body.unitPrice);
  if (!unitPrice.ok) return unitPrice;

  return {
    ok: true,
    data: {
      customerName: customerName.data,
      phone: phone.data,
      productName: productName.data,
      quantity: quantity.data,
      unitPrice: unitPrice.data,
    },
  };
}

export function validateUpdate(body: unknown): Result<OrderUpdate> {
  if (!isObject(body)) return fail("Request body must be a JSON object");

  const update: OrderUpdate = {};

  // Only these fields are allowed
  if ("customerName" in body) {
    const r = checkText(body.customerName, "Customer name");
    if (!r.ok) return r;
    update.customerName = r.data;
  }
  if ("phone" in body) {
    const r = checkText(body.phone, "Phone");
    if (!r.ok) return r;
    update.phone = r.data;
  }
  if ("productName" in body) {
    const r = checkText(body.productName, "Product name");
    if (!r.ok) return r;
    update.productName = r.data;
  }
  if ("quantity" in body) {
    const r = checkQuantity(body.quantity);
    if (!r.ok) return r;
    update.quantity = r.data;
  }
  if ("unitPrice" in body) {
    const r = checkUnitPrice(body.unitPrice);
    if (!r.ok) return r;
    update.unitPrice = r.data;
  }
  if ("status" in body) {
    const r = checkStatus(body.status);
    if (!r.ok) return r;
    update.status = r.data;
  }

  if (Object.keys(update).length === 0) {
    return fail(
      "Provide at least one editable field: customerName, phone, productName, quantity, unitPrice, status"
    );
  }

  return { ok: true, data: update };
}


function createSeed(): Order[] {
  return [
    {
      id: crypto.randomUUID(),
      customerName: "Demo Customer One",
      phone: "DEMO-001",
      productName: "Vanilla Candle",
      quantity: 3,
      unitPrice: 8,
      total: calculateTotal(3, 8),
      status: "Pending",
    },
    {
      id: crypto.randomUUID(),
      customerName: "Demo Customer Two",
      phone: "DEMO-002",
      productName: "Cedar Candle",
      quantity: 2,
      unitPrice: 10,
      total: calculateTotal(2, 10),
      status: "Preparing",
    },
    {
      id: crypto.randomUUID(),
      customerName: "Demo Customer Three",
      phone: "DEMO-003",
      productName: "Mini Gift Candle",
      quantity: 5,
      unitPrice: 6,
      total: calculateTotal(5, 6),
      status: "Delivered",
    },
  ];
}

const globalStore = globalThis as typeof globalThis & { __orders?: Order[] };
const orders: Order[] = (globalStore.__orders ??= createSeed());


export function listOrders(): Order[] {
  return orders;
}

export function getOrder(id: string): Order | undefined {
  return orders.find((order) => order.id === id);
}

export function createOrder(input: OrderInput): Order {
  const order: Order = {
    id: crypto.randomUUID(),
    ...input,
    total: calculateTotal(input.quantity, input.unitPrice),
    status: "Pending",
  };
  orders.push(order);
  return order;
}

export function updateOrder(id: string, update: OrderUpdate): Order | undefined {
  const index = orders.findIndex((order) => order.id === id);
  if (index === -1) return undefined;

  const next: Order = { ...orders[index], ...update };
  next.total = calculateTotal(next.quantity, next.unitPrice);

  orders[index] = next;
  return next;
}

export function deleteOrder(id: string): boolean {
  const index = orders.findIndex((order) => order.id === id);
  if (index === -1) return false;
  orders.splice(index, 1);
  return true;
}