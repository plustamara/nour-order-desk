import OrderDashboard from "./components/OrderDashboard";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Nour&apos;s Order Desk</h1>
      <p className="mt-1 text-sm opacity-70">
        Track every candle order in one place.
      </p>
      <OrderDashboard />
    </main>
  );
}