# Plan: Nour's Order Desk

## Client problem
Nour runs a small handmade-candle business in Beirut. Orders arrive through Instagram and WhatsApp, and customer names, quantities, and delivery status get lost. She needs one place to record orders, correct them, track their status, and remove accidental entries.

## Required features
1. List orders (customer, product, quantity, total, status)
2. View one order's full details
3. Add an order
4. Update an order, including its status
5. Delete an order, with confirmation
6. Summary counts: total, pending, delivered

## Statuses
Pending, Preparing, Delivered. New orders start as Pending.

## Endpoints
| Method | Endpoint | Success |
| GET | /api/orders | 200 |
| GET | /api/orders/[id] | 200 |
| POST | /api/orders | 201 |
| PATCH | /api/orders/[id] | 200 |
| DELETE | /api/orders/[id] | 204 |

Errors: 400 for invalid input or malformed JSON, 404 for an unknown order.

## Implementation steps
1. Create the Order type and the in-memory store in lib/orders.ts
2. Add validation and total calculation
3. Build GET and POST in app/api/orders/route.ts
4. Build GET, PATCH, and DELETE in app/api/orders/[id]/route.ts
5. Test every endpoint with Thunder Client
6. Build the dashboard in components/OrderDashboard.tsx and connect it with fetch
7. Add loading, error, empty, and pending states
8. Check the mobile layout and keyboard use
9. Write README, API, TESTING, and REVIEW docs
10. Run lint and build, then submit