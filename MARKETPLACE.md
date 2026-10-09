# Nanzy Marketplace — Multi-role platform

## Free stack
- **Next.js** — UI + API + Server Actions
- **Supabase (free tier)** — Auth + PostgreSQL + RLS
- **Paystack (test keys)** — optional for buyer checkout
- Seller subscription is **demo-activated free** 

## Roles
| Role | Can do |
|------|--------|
| **buyer** | Shop, cart, checkout, leave reviews |
| **seller** | Register store, subscribe, see own stats, reply to feedback (extend next) |
| **admin** | Dashboard KPIs, approve sellers, see rankings, reviews, orders, activity log |

## SQL to run in Supabase
1. `supabase/schema.sql` (base products/orders/reviews)
2. `supabase/seed.sql`
3. **`supabase/marketplace-schema.sql`** (profiles, sellers, replies, activity)

## Make yourself admin
After signup, in Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## Demo user flows (for employer pitch)

### Buyer
1. `/auth/signup` → confirm email  
2. Browse `/products` → add to cart → `/checkout`  
3. Leave review on product page  

### Seller
1. Login → `/seller/register`  
2. `/seller/subscribe` → activate plan (demo free)  
3. Wait for admin approval  
4. `/seller` dashboard — rating, reply rate, sales  

### Admin
1. Set role to `admin` in SQL  
2. `/admin` — KPIs, high/low ranking sellers  
3. `/admin/sellers` — approve stores  
4. `/admin/reviews` — all buyer feedback  
5. `/admin/orders` — buying activity  
6. `/admin/activity` — full event log  

## Key routes
- `/admin` — overview analytics  
- `/admin/sellers` — rankings + approval  
- `/admin/reviews` — buyer comments  
- `/admin/orders` — purchases  
- `/admin/activity` — monitoring feed  
- `/seller/register` — become a seller  
- `/seller/subscribe` — subscription plans  
- `/seller` — seller dashboard  

## Pitch one-liner
> “A multi-sided fashion marketplace on free infrastructure: buyers purchase and review, sellers subscribe and respond to feedback, admins monitor rankings, reply rates, and platform health in one dashboard.”
EOF