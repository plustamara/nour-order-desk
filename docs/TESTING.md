# Testing

Tool: Thunder Client (VS Code). Server: `npm run dev` on `http://localhost:3000`.

Tested on: localhost + on VS code using Thunder Client Extension

## API tests

| # | Test | Expected | Actual | Result |
| 1 | List orders | 200 and an array | 200, array of orders | Pass |
| 2 | Read an existing order | 200 and the matching object | 200, the matching order | Pass |
| 3 | Create a valid order (3 x 8) | 201, unique id, total 24, Pending | 201, new id, total 24, Pending | Pass |
| 4 | Omit the customer name | 400 with a useful error | 400 with an error message | Pass |
| 5 | Blank phone | 400 | 400 | Pass |
| 6 | Quantity 0, -1, 1.5 | 400 | 400 for each | Pass |
| 7 | Negative price, text price, 8.999 | 400 | 400 for each | Pass |
| 8 | Send total 0, id, and status with valid data | Server ignores them; total 24, Pending | 201, total 24, Pending, server id | Pass |
| 9 | Malformed JSON (trailing comma) | 400, not 500 | 400 | Pass |
| 10 | PATCH quantity 4 and status Preparing | 200, total 32 | 200, total 32, Preparing | Pass |
| 11 | PATCH status Flying | 400 | 400 | Pass |
| 12 | PATCH quantity -2, then GET the order | 400, order unchanged | 400, order still quantity 4 | Pass |
| 13 | Empty PATCH body | 400 | 400 | Pass |
| 14 | PATCH quantity only | 200, customer name unchanged | 200, name unchanged | Pass |
| 15 | PATCH with id "hacked" and a quantity | 200, id unchanged | 200, id unchanged | Pass |
| 16 | PATCH status Delivered | 200 | 200, Delivered | Pass |
| 17 | Delete an existing order | 204, no body | 204, no body | Pass |
| 18 | Read the deleted order | 404 | 404 | Pass |
| 19 | PATCH an unknown id | 404 | 404 | Pass |
| 20 | DELETE an unknown id | 404 | 404 | Pass |


## Not verified yet

- Dashboard behavior (add, edit, delete, loading, error, empty states)
- Summary counts
- Mobile layout and keyboard use
- `npm run lint` and `npm run build` results

These are recorded after the dashboard is built.