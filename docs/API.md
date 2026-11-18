# API Reference

Base URL (local): `http://localhost:3000`

All request and response bodies are JSON. Orders are stored in memory on the server.

## Order object

```json
{
  "id": "demo-1",
  "customerName": "Demo Customer",
  "phone": "DEMO-001",
  "productName": "Vanilla Candle",
  "quantity": 3,
  "unitPrice": 8,
  "total": 24,
  "status": "Pending"
}
```

| Field | Type | Who sets it | Rule |
| id | string | Server | Generated with crypto.randomUUID(). Cannot be edited. |
| customerName | string | Client | Required, trimmed, not blank |
| phone | string | Client | Required, trimmed, not blank. Kept as text. |
| productName | string | Client | Required, trimmed, not blank |
| quantity | number | Client | Positive integer, minimum 1 |
| unitPrice | number | Client | Finite, minimum 0, at most two decimal places |
| total | number | Server | quantity x unitPrice, calculated in integer cents. Never accepted from the client. |
| status | string | Server on create, client on update | Pending, Preparing, or Delivered |

New orders always start as Pending. Any status can be changed to any other status.

## Endpoints

| Method | Endpoint | Success | Purpose |
| GET | /api/orders | 200 | Return all orders |
| GET | /api/orders/[id] | 200 | Return one order |
| POST | /api/orders | 201 | Create and return an order |
| PATCH | /api/orders/[id] | 200 | Update and return an order |
| DELETE | /api/orders/[id] | 204 | Remove an order, no response body |

### GET /api/orders

Response 200:

```json
[
  {
    "id": "demo-1",
    "customerName": "Demo Customer One",
    "phone": "DEMO-001",
    "productName": "Vanilla Candle",
    "quantity": 3,
    "unitPrice": 8,
    "total": 24,
    "status": "Pending"
  }
]
```

### GET /api/orders/[id]

Response 200: one order object.
Response 404: the order does not exist.

### POST /api/orders

Request:

```json
{
  "customerName": "Demo Customer",
  "phone": "DEMO-004",
  "productName": "Vanilla Candle",
  "quantity": 3,
  "unitPrice": 8
}
```

Response 201:

```json
{
  "id": "server-generated-id",
  "customerName": "Demo Customer",
  "phone": "DEMO-004",
  "productName": "Vanilla Candle",
  "quantity": 3,
  "unitPrice": 8,
  "total": 24,
  "status": "Pending"
}
```

If the request also contains id, total, or status, those values are ignored.

### PATCH /api/orders/[id]

Request (any of the editable fields: customerName, phone, productName, quantity, unitPrice, status):

```json
{
  "quantity": 4,
  "status": "Preparing"
}
```

Response 200: the full updated order, with the total recalculated (here, 32).

PATCH rules:
- Only the fields sent are changed. Omitted fields keep their values.
- Every supplied field is validated before anything is stored. A rejected update leaves the order unchanged.
- An empty body, or a body with no editable field, returns 400.
- id and total in the body are ignored.

### DELETE /api/orders/[id]

Response 204 with no body. Deleting an unknown id returns 404.

## Error format

Every error has the same shape:

```json
{
  "error": "Quantity must be a positive integer"
}
```

## Status codes

| Code | When |
| 200 | Read or update succeeded |
| 201 | Order created |
| 204 | Order deleted |
| 400 | Invalid input, malformed JSON, or an empty update |
| 404 | The order does not exist |

## Error messages

| Message | Cause |
| Request body must be valid JSON | The body could not be parsed |
| Request body must be a JSON object | The body is an array, a string, a number, or null |
| Customer name is required and cannot be blank | Missing, not a string, or only spaces |
| Phone is required and cannot be blank | Missing, not a string, or only spaces |
| Product name is required and cannot be blank | Missing, not a string, or only spaces |
| Quantity must be a positive integer | 0, negative, decimal, or not a number |
| Unit price must be a number that is 0 or more | Negative, text, or not finite |
| Unit price can have at most two decimal places | For example 8.999 |
| Status must be one of: Pending, Preparing, Delivered | Any other status |
| Provide at least one editable field: customerName, phone, productName, quantity, unitPrice, status | PATCH with nothing to update |
| Order not found | Unknown id |

## Limitations

Orders live in server memory. They reset when the server restarts and can reset during development reloads. This is not suitable for more than one server instance. There is no database.