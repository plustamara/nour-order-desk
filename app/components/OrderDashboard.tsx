"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Order } from "../../lib/types";

const CATALOGUE = [
  { name: "Vanilla Candle", price: "8.00" },
  { name: "Cedar Candle", price: "10.00" },
  { name: "Mini Gift Candle", price: "6.00" },
];

type FormValues = {
  customerName: string;
  phone: string;
  productName: string;
  quantity: string;
  unitPrice: string;
};

const EMPTY_FORM: FormValues = {
  customerName: "",
  phone: "",
  productName: "",
  quantity: "1",
  unitPrice: "",
};

const INPUT_CLASS =
  "mt-1 w-full rounded border border-gray-400 bg-white px-3 py-2 text-black";

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

  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  // Re-fetch the list from the server. Returns false if that fails.
  async function refreshOrders(): Promise<boolean> {
    try {
      setOrders(await fetchOrders());
      return true;
    } catch {
      return false;
    }
  }

  function updateField(field: keyof FormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  // Choosing a product fills in its suggested price, which stays editable.
  function handleProductChange(value: string) {
    const match = CATALOGUE.find((item) => item.name === value);
    setForm((current) => ({
      ...current,
      productName: value,
      unitPrice: match ? match.price : current.unitPrice,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          phone: form.phone,
          productName: form.productName,
          quantity: Number(form.quantity),
          unitPrice: Number(form.unitPrice),
        }),
      });

      if (!response.ok) {
        // Keep the form as it is so nothing the user typed is lost.
        setFormError(
          await readErrorMessage(response, "Could not save the order")
        );
        return;
      }

      setForm(EMPTY_FORM);
      const refreshed = await refreshOrders();
      if (!refreshed) {
        setFormError(
          "The order was saved, but the list could not be refreshed. Reload the page."
        );
      }
    } catch {
      setFormError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
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

      <section aria-label="Add order" className="mt-8">
        <h2 className="text-lg font-semibold">Add an order</h2>

        <form
          onSubmit={handleSubmit}
          className="mt-4 grid gap-4 rounded border border-current/20 p-4 sm:grid-cols-2"
        >
          <div>
            <label htmlFor="customerName" className="text-sm font-medium">
              Customer name
            </label>
            <input
              id="customerName"
              type="text"
              required
              value={form.customerName}
              onChange={(e) => updateField("customerName", e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="phone" className="text-sm font-medium">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="productName" className="text-sm font-medium">
              Product
            </label>
            <select
              id="productName"
              required
              value={form.productName}
              onChange={(e) => handleProductChange(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">Choose a product</option>
              {CATALOGUE.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                required
                value={form.quantity}
                onChange={(e) => updateField("quantity", e.target.value)}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label htmlFor="unitPrice" className="text-sm font-medium">
                Unit price (USD)
              </label>
              <input
                id="unitPrice"
                type="number"
                inputMode="decimal"
                min={0}
                step={0.01}
                required
                value={form.unitPrice}
                onChange={(e) => updateField("unitPrice", e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          {formError && (
            <p
              role="alert"
              className="rounded border border-red-500 p-3 text-sm sm:col-span-2"
            >
              {formError}
            </p>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Add order"}
            </button>
          </div>
        </form>
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