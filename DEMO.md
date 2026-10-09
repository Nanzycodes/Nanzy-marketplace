# Live demo guide 

## Start
```bash
cd nanzy-clothes
npm install
npm run dev
```
Do **not** set `NEXT_PUBLIC_SUPABASE_URL` — use `data/demo-db.json`.

## Floating control (bottom-left)
**visitor | buyer | seller | admin**

## Full demo loop (buying → review → seller reply → admin)

### A. Buyer buys
1. `/products` → open a product → **Add to Cart**
2. `/cart` → **Checkout**
3. Fill form → **Place Order**
4. Order is written to `demo-db.json`
5. Open `/admin/orders` — new order appears
6. Open `/admin/activity` — `order_placed` event

### B. Buyer reviews
1. Open product again (e.g. Classic White Tee)
2. **Leave a review** (stars + comment) → Submit
3. `/admin/reviews` — review appears
4. `/admin/sellers` — seller rating/review count updates

### C. Seller handles feedback
1. `/seller/reviews` → switch to seller who got the review
2. **Send reply**
3. `/admin/sellers` — **reply rate** goes up
4. `/admin/reviews` — shows “Seller replied”

### D. Admin monitoring
1. `/admin` — KPIs, high vs low rank sellers
2. `/admin/sellers` — approve pending store **New Vintage Lagos**
3. `/admin/activity` — full audit trail

### E. Seller sells
1. `/seller/products` → add product
2. `/products` — may list it from the same DB
3. `/seller/subscribe` — activate plan (demo free)
4. `/seller/register` — new pending seller for admin

## Pitch line
> Buyers purchase and review. Sellers must respond — response rate and star ratings rank them. Admins monitor the whole marketplace from one dashboard. Database is ours (`data/demo-db.json`); production can swap to Supabase/Postgres without changing the product idea.
