-- ====================================
-- Seed initial products
-- =====================================

INSERT INTO public.products (name, slug, description, price, compare_at_price, category, images, sizes, colors, in_stock, featured)
VALUES
(
  'Classic White Tee',
  'classic-white-tee',
  'Premium cotton t-shirt with a relaxed fit. Perfect for everyday wear. Soft, breathable, and built to last.',
  8500,
  12000,
  'men',
  ARRAY['/products/white-tee.jpg'],
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['White', 'Black', 'Navy'],
  true,
  true
),
(
  'Oversized Hoodie',
  'oversized-hoodie',
  'Cozy oversized hoodie in heavyweight fleece. Drop shoulders, kangaroo pocket, and a soft brushed interior.',
  18500,
  NULL,
  'men',
  ARRAY['/products/hoodie.jpg'],
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['Black', 'Grey', 'Olive'],
  true,
  true
),
(
  'Linen Summer Dress',
  'linen-summer-dress',
  'Light and airy linen dress with a flattering silhouette. Ideal for warm days and effortless style.',
  22500,
  28000,
  'women',
  ARRAY['/products/linen-dress.jpg'],
  ARRAY['XS', 'S', 'M', 'L'],
  ARRAY['Beige', 'White', 'Sage'],
  true,
  true
),
(
  'High-Waist Trousers',
  'high-waist-trousers',
  'Tailored high-waist trousers with a clean front and comfortable stretch. Dress them up or down.',
  16500,
  NULL,
  'women',
  ARRAY['/products/trousers.jpg'],
  ARRAY['XS', 'S', 'M', 'L', 'XL'],
  ARRAY['Black', 'Camel', 'Navy'],
  true,
  false
),
(
  'Leather Crossbody Bag',
  'leather-crossbody-bag',
  'Genuine leather crossbody bag with adjustable strap and multiple compartments. Everyday essential.',
  32000,
  NULL,
  'accessories',
  ARRAY['/products/bag.jpg'],
  ARRAY[]::TEXT[],
  ARRAY['Brown', 'Black'],
  true,
  true
),
(
  'Minimalist Cap',
  'minimalist-cap',
  'Clean six-panel cap with subtle embroidery. Adjustable strap for the perfect fit.',
  6500,
  NULL,
  'accessories',
  ARRAY['/products/cap.jpg'],
  ARRAY[]::TEXT[],
  ARRAY['Black', 'White', 'Khaki'],
  true,
  false
),
(
  'Relaxed Denim Jacket',
  'relaxed-denim-jacket',
  'Classic denim jacket with a modern relaxed fit. Washed for softness and character.',
  27500,
  NULL,
  'men',
  ARRAY['/products/denim-jacket.jpg'],
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['Light Blue', 'Dark Wash'],
  true,
  false
),
(
  'Silk Scarf',
  'silk-scarf',
  'Luxurious pure silk scarf with hand-rolled edges. A versatile finishing touch for any outfit.',
  14500,
  NULL,
  'accessories',
  ARRAY['/products/scarf.jpg'],
  ARRAY[]::TEXT[],
  ARRAY['Floral', 'Solid Navy', 'Abstract'],
  false,
  false
)
ON CONFLICT (slug) DO NOTHING;
