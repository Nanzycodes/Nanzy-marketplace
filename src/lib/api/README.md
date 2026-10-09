# Free API layer (frontend skills)

| API | Auth | Used for |
|-----|------|----------|
| [Fake Store API](https://fakestoreapi.com) | None | `/explore` → tab “Fake Store” (DataTable) |
| [DummyJSON](https://dummyjson.com) | None | `/explore` → tab “DummyJSON” (search + grid + API pagination) |
| [JSONPlaceholder](https://jsonplaceholder.typicode.com) | None | Product detail **Community comments** |
| Local `data/demo-db.json` | None | Marketplace domain |
| Supabase free tier | Optional | Production auth + Postgres |

## Patterns

- Typed clients + `fetchJson` (timeout, AbortSignal, ApiError)
- `useAsyncResource` — loading / success / error / retry
- DummyJSON: **server-side search** via `?q=` and `limit`/`skip` pagination
- JSONPlaceholder: map `productId` → stable `postId` for comments thread
