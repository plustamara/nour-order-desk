"use client";

import { useEffect, useState } from "react";
import type { Order } from "../../lib/types";

const STATUS_COLORS: Record<Order["status"], string> = {
  Pending: "text-amber-600",
  Preparing: "text-blue-600",
  Delivered: "text-green-600",
};

function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// Reads the API's error message, or falls back to a default.
async function readErrorMessage(response: Response, fallback: string) {
  try {
    const body = await response.json();
    return typeof body?.error === "string" ? body.error : fallback;
  } catch {
    return fallback;
  }
}

async function fetchOrders(): Promise<Order[]> {
  const response = await fetch("/api/orders");
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Could not load orders"));
  }
  return response.json();
}

export default function OrderDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Could not load orders"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function handleRetry() {
    setLoadError(null);
    setLoading(true);
    setReloadKey((key) => key + 1);
  }

  // Summary counts come from the real list, never typed in by hand.
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;

  if (loading) {
    return (
      <p role="status" className="mt-8">
        Loading orders...
      </p>
    );
  }

  if (loadError) {
    return (
      <div role="alert" className="mt-8 rounded border border-red-500 p-4">
        <p className="font-medium">Something went wrong</p>
        <p className="mt-1 text-sm">{loadError}</p>
        <button
          type="button"
          onClick={handleRetry}
          className="mt-3 rounded border border-current/40 px-3 py-2 text-sm font-medium focus:outline-2 focus:outline-offset-2"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <section aria-label="Order summary" className="grid grid-cols-3 gap-3">
        <div className="rounded border border-current/20 p-3">
          <p className="text-sm opacity-70">Total orders</p>
          <p className="text-2xl font-semibold">{totalCount}</p>
        </div>
        <div className="rounded border border-current/20 p-3">
          <p className="text-sm opacity-70">Pending</p>
          <p className="text-2xl font-semibold">{pendingCount}</p>
        </div>
        <div className="rounded border border-current/20 p-3">
          <p className="text-sm opacity-70">Delivered</p>
          <p className="text-2xl font-semibold">{deliveredCount}</p>
        </div>
      </section>

      <section aria-label="Orders" className="mt-8">
        <h2 className="text-lg font-semibold">Orders</h2>

        {orders.length === 0 ? (
          <p className="mt-4 opacity-70">
            No orders yet. Add the first one to get started.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-current/20 p-3"
              >
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm opacity-70">
                    {order.quantity} x {order.productName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatMoney(order.total)}</p>
                  <p
                    className={`text-sm font-medium ${STATUS_COLORS[order.status]}`}
                  >
                    {order.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}