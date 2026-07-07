-- ============================================================
-- Lebel / MILBON 商品の一括登録
-- Supabase の SQL Editor に貼り付けて実行してください
-- ※ 在庫数(stock)は仮に「10」を入れています。実際の数に後で調整してください。
-- ============================================================

insert into public.brands (name) values ('Lebel') on conflict do nothing;
insert into public.brands (name) values ('MILBON') on conflict do nothing;

-- ============================================================
-- Lebel
-- ============================================================

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '240mL', 264000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Natural Hair Soap with MARIGOLD', 'Cleanses the scalp for a refreshed feel. Provides a smooth, lightweight finish. Best for oily scalp or healthy hair.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '720mL', 682000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Natural Hair Soap with MARIGOLD', 'Cleanses the scalp for a refreshed feel. Provides a smooth, lightweight finish. Best for oily scalp or healthy hair.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '1600mL', 1160000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Natural Hair Soap with MARIGOLD', 'Cleanses the scalp for a refreshed feel. Provides a smooth, lightweight finish. Best for oily scalp or healthy hair.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '240mL', 264000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Natural Hair Soap with JOJOBA', 'Enriched with jojoba oil to moisturize dry hair. Gently cleanses the scalp and leaves hair smooth, shiny, and healthy.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '720mL', 682000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Natural Hair Soap with JOJOBA', 'Enriched with jojoba oil to moisturize dry hair. Gently cleanses the scalp and leaves hair smooth, shiny, and healthy.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '1600mL', 1160000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Natural Hair Soap with JOJOBA', 'Enriched with jojoba oil to moisturize dry hair. Gently cleanses the scalp and leaves hair smooth, shiny, and healthy.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '240mL', 264000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Natural Hair Soap with SEAWEED', 'Gently cleanses the scalp with seaweed extract. It provides minerals to the hair, leaving it smooth, healthy, and refreshed.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '720mL', 682000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Natural Hair Soap with SEAWEED', 'Gently cleanses the scalp with seaweed extract. It provides minerals to the hair, leaving it smooth, healthy, and refreshed.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '1600mL', 1160000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Natural Hair Soap with SEAWEED', 'Gently cleanses the scalp with seaweed extract. It provides minerals to the hair, leaving it smooth, healthy, and refreshed.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '200mL', 396000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'IAU cleansing FRESHMENT', 'Deeply cleanses the oily scalp for a refreshed and healthy feel. Leaves hair with a smooth texture and a lightweight, airy finish.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '600mL', 880000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'IAU cleansing FRESHMENT', 'Deeply cleanses the oily scalp for a refreshed and healthy feel. Leaves hair with a smooth texture and a lightweight, airy finish.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '200mL', 396000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'IAU cleansing CLEARMENT', 'Cleanses normal scalp to feel refreshed and healthy. It provides a smooth, silky texture and a lightweight finish to your hair.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '600mL', 880000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'IAU cleansing CLEARMENT', 'Cleanses normal scalp to feel refreshed and healthy. It provides a smooth, silky texture and a lightweight finish to your hair.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '200mL', 396000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'IAU cleansing RELAXMENT', 'Gently cleanses the scalp and hydrates dry hair. Leaves your hair feeling smooth, soft, and manageable with a healthy, refreshed finish.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '600mL', 880000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'IAU cleansing RELAXMENT', 'Gently cleanses the scalp and hydrates dry hair. Leaves your hair feeling smooth, soft, and manageable with a healthy, refreshed finish.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '200mL', 463000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'IAU serum cleansing', 'Tames frizz and provides a hydrated, smooth finish for unruly hair.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '600mL', 935000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'IAU serum cleansing', 'Tames frizz and provides a hydrated, smooth finish for unruly hair.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'treatment', '200mL', 396000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'IAU cream MELT REPAIR', 'Provides deep repair for a silky-smooth touch. This lightweight conditioner leaves hair soft, manageable, and radiating a healthy shine.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'treatment', '600mL', 880000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'IAU cream MELT REPAIR', 'Provides deep repair for a silky-smooth touch. This lightweight conditioner leaves hair soft, manageable, and radiating a healthy shine.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'treatment', '200mL', 396000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'IAU cream SILKY REPAIR', 'Deeply repairs and smooths hair from within. This light-textured treatment leaves your hair silky, shiny, and incredibly soft to the touch.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'treatment', '600mL', 880000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'IAU cream SILKY REPAIR', 'Deeply repairs and smooths hair from within. This light-textured treatment leaves your hair silky, shiny, and incredibly soft to the touch.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'treatment', '200mL', 462000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'IAU serum cream', 'This hair treatment cream hydrates and tames frizzy hair. It provides a smooth, manageable texture with a soft and shiny finish.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'treatment', '600mL', 935000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'IAU serum cream', 'This hair treatment cream hydrates and tames frizzy hair. It provides a smooth, manageable texture with a soft and shiny finish.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'treatment', '200mL', 264000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Natural Hair Treatment with RICE PROTEIN', 'Rice protein nourishes and repairs damaged hair. It provides weightless moisture, leaving hair incredibly smooth, shiny, and easy to comb.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'treatment', '600mL', 682000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Natural Hair Treatment with RICE PROTEIN', 'Rice protein nourishes and repairs damaged hair. It provides weightless moisture, leaving hair incredibly smooth, shiny, and easy to comb.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'oil', '100mL', 506000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'IAU serum oil', 'This hair oil tames frizz and provides deep hydration. It leaves your hair feeling silky, smooth, and incredibly manageable.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'oil', '100mL', 484000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'IAU essence SLEEK', 'Smoothes hair for a sleek, silky finish. This oil controls frizz and adds shine, leaving your hair soft and manageable all day long.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'oil', '100mL', 484000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'IAU essence MOIST', 'Deeply hydrates and softens dry hair. This milky essence tames frizz and provides a moist, supple texture for a healthy look.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'styling', '100mL', 484000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'IAU essence FORTI', 'This styling cream achieves a sophisticated wet look with firm hold. It adds a sexy gloss and bold movement to your hair.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'styling', '37g', 748000, 10 from public.brands where name = 'Lebel' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Lebel THE MOII Balm Ambient dew', 'This multi-balm provides moisture and natural texture. Its rich oil base creates a smooth gloss, perfect for hair and skin care.' from p;

-- ============================================================
-- MILBON
-- ============================================================

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '200mL', 542000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Repair Milbon Restorative Shampoo', 'Intensive repair for damaged hair. It restores elasticity and provides a smooth, supple texture from within.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '500mL', 1035000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Repair Milbon Restorative Shampoo', 'Intensive repair for damaged hair. It restores elasticity and provides a smooth, supple texture from within.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '200mL', 542000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Scalp Milbon Purifying Gel Shampoo', 'For those concerned with oily scalp or odor. This gel shampoo removes excess fatty acids to ensure a refreshed and healthy scalp environment.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '720mL', 1035000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Scalp Milbon Purifying Gel Shampoo', 'For those concerned with oily scalp or odor. This gel shampoo removes excess fatty acids to ensure a refreshed and healthy scalp environment.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'scalp', '200mL', 400000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Plarmia Balancing Scalp Soap', 'A medicinal scalp shampoo that gently cleanses while preserving moisture. It prevents itchiness and dandruff caused by dryness, promoting a healthy scalp environment.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'scalp', '500mL', 682000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Plarmia Balancing Scalp Soap', 'A medicinal scalp shampoo that gently cleanses while preserving moisture. It prevents itchiness and dandruff caused by dryness, promoting a healthy scalp environment.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'scalp', '1000mL', 1160000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Plarmia Balancing Scalp Soap', 'A medicinal scalp shampoo that gently cleanses while preserving moisture. It prevents itchiness and dandruff caused by dryness, promoting a healthy scalp environment.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'scalp', '170g', 552000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Plarmia Clear Spa Foam', 'A carbonated scalp shampoo with high-concentration foam. It removes deep-seated oil and odor for a refreshed scalp. Use twice a week in place of your regular shampoo and massage gently.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'scalp', '720g', 912000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Plarmia Clear Spa Foam', 'A carbonated scalp shampoo with high-concentration foam. It removes deep-seated oil and odor for a refreshed scalp. Use twice a week in place of your regular shampoo and massage gently.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '200mL', 498000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Grand Linkage Velourluxe Shampoo', 'Maintains beautiful salon color and shape. This color-care shampoo provides deep moisture to coarse or frizzy hair for a soft, hydrated finish.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '500mL', 998000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Grand Linkage Velourluxe Shampoo', 'Maintains beautiful salon color and shape. This color-care shampoo provides deep moisture to coarse or frizzy hair for a soft, hydrated finish.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '200mL', 498000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Grand Linkage Willowluxe Shampoo', 'Maintains beautiful salon color and shape. This color-care shampoo moisturizes medium hair for a supple finish.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'shampoo', '600mL', 998000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Grand Linkage Willowluxe Shampoo', 'Maintains beautiful salon color and shape. This color-care shampoo moisturizes medium hair for a supple finish.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'coloring', '150mL', 545000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Color Gadget Shampoo', 'A color shampoo that easily maintains vibrant hair color. The rich foam ensures even coloring while keeping hair hydrated. Use in place of your regular shampoo, leave for a few minutes, then rinse.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'treatment', '200g', 740000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Repair Milbon Restorative Treatment', 'Phuc hoi tap trung cho toc hu ton nang tu ben trong. Tang do dan hoi, giup toc suon muot va mem mai tan ngon.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'treatment', '500g', 1430000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Repair Milbon Restorative Treatment', 'Phuc hoi tap trung cho toc hu ton nang tu ben trong. Tang do dan hoi, giup toc suon muot va mem mai tan ngon.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'scalp', '200g', 740000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Scalp Milbon Hydrating Treatment', 'Kem duong da dau giup cap am va ngan ngua cac van de do kho da. Nuoi duong moi truong da dau khoe manh, dong thoi giup toc mem muot va nhe nhang.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'scalp', '500g', 1430000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Scalp Milbon Hydrating Treatment', 'Kem duong da dau giup cap am va ngan ngua cac van de do kho da. Nuoi duong moi truong da dau khoe manh, dong thoi giup toc mem muot va nhe nhang.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'treatment', '200g', 710000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Grand Linkage Willowluxe Hair Treatment', 'Danh cho toc thuong. Kem xa cham soc mau giup duy tri mau sac va dinh hinh toc dep nhu tai salon, cho mai toc suon muot. Sau khi goi, thoa deu len ngon toc, de vai phut roi xa sach.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'treatment', '500g', 1420000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Grand Linkage Willowluxe Hair Treatment', 'Danh cho toc thuong. Kem xa cham soc mau giup duy tri mau sac va dinh hinh toc dep nhu tai salon, cho mai toc suon muot. Sau khi goi, thoa deu len ngon toc, de vai phut roi xa sach.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'treatment', '200g', 710000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Grand Linkage Velourluxe Hair Treatment', 'Danh cho toc cung va toc xoan. Kem xa cham soc mau giup duy tri mau sac va dinh hinh toc, cho mai toc mem mai. Sau khi goi, thoa deu len ngon toc, de vai phut roi xa sach.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'treatment', '500g', 1420000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Grand Linkage Velourluxe Hair Treatment', 'Danh cho toc cung va toc xoan. Kem xa cham soc mau giup duy tri mau sac va dinh hinh toc, cho mai toc mem mai. Sau khi goi, thoa deu len ngon toc, de vai phut roi xa sach.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'scalp', '250g', 552000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Plarmia Lifting Effect 2nd Essence', 'Kem duong giup cap am va tang do dan hoi cho da dau. Nuoi duong da dau khoe manh, giup toc bong beng tu goc. Sau khi goi, massage nhe nhang len da dau roi xa sach voi nuoc.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'treatment', '9g*4PCS', 210000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Grand Linkage 4+ Homecare Kit Treatment', 'Lieu trinh cham soc dac biet hang tuan giup duy tri mau sac va do muot ma cua toc sau khi lam tai salon. Ngan ngua kho xo, giup toc suon muot. Sau khi goi, thoa deu len ngon toc roi xa sach.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'treatment', '9g*4PCS', 197000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Repair Milbon Restorative Homecare Kit', 'Lieu phap phuc hoi chuyen sau hang tuan. Day la san pham cham soc dac biet tai nha giup duy tri mai toc chuan salon. Sau khi goi dau, thoa len phan ngon toc, de trong vai phut roi xa sach. Phu hop cho toc hu ton.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'treatment', '9g*4PCS', 160000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'TRISYSCORE Home Care (003 Treatment)', 'Bo sung luong ceramide da mat moi tuan de duy tri mai toc dep va chac khoe. Giup toc luon khoe manh va can bang cho den lan cham soc salon tiep theo.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'oil', '120ml', 740000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Repair Milbon Restorative Blowout Primer Fine Hair', 'Su dung tren toc uot sau khi tam. Kem duong khong xa lai giup phuc hoi toc hu ton, giup toc manh suon muot. Thoa mot luong vua du vao ngon toc roi say kho.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'oil', '120ml', 740000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Repair Milbon Restorative Blowout Primer Coarse Hair', 'Danh cho toc thuong den toc cung. Kem duong khong xa lai chuyen phuc hoi hu ton. Su dung tren toc uot sau khi tam de giup toc mem mai va chac khoe. Thoa vao ngon toc roi say kho.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'scalp', '100mL', 617000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Plarmia Base Act Essence', 'Tinh chat duong da dau giup can bang do am. Ngan ngua kho rap va dau thua, duy tri da dau khoe manh. Xit truc tiep len da dau sau khi lau kho bang khan, sau do massage nhe nhang bang dau ngon tay.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'scalp', '180mL', 925000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Plarmia Base Act Essence', 'Tinh chat duong da dau giup can bang do am. Ngan ngua kho rap va dau thua, duy tri da dau khoe manh. Xit truc tiep len da dau sau khi lau kho bang khan, sau do massage nhe nhang bang dau ngon tay.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'styling', '120g', 615000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Plarmia Volumier', 'Bot giup lam phong toc tu chan toc, tao kieu dang dep mat. Thoa vao chan toc khi con uot sau khi goi, sau do say kho de tao do phong. Phu hop cho nguoi muon toc bong beng hon.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'oil', '120mL', 498000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Elujuda MO', 'Dau duong giup lam mem mai toc cung va kho vao nep. Thoa len toc uot sau khi goi roi say kho de toc suon muot, de tao kieu. Phu hop cho toc thuong den toc cung.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'oil', '120mL', 498000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Elujuda FO', 'Dau duong danh cho toc manh va yeu. Cung cap do dan hoi va su mem mai, giup toc de dang tao kieu hon. Thoa len toc uot sau khi goi roi say kho. Phu hop cho toc mong va mem.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'oil', '120mL', 668000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Elujuda Spf 30', 'Bao ve toc khoi tia UV dong thoi phuc hoi hu ton. Giu cho mai toc suon muot ngay ca khi o ngoai troi. Thoa len toc uot sau khi goi roi say kho. Phu hop cho nguoi thuong xuyen ra ngoai.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'styling', '200g', 488000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Milbon Wave Enhancing Mousse 4', 'Lam noi bat cac lon toc xoan voi do bong beng tu nhien. Cung cap do am giup toc mem mai va giu nep lau hon.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'styling', '100g', 488000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Milbon Molding Wax 3', 'Tao chuyen dong nhe nhang va ve ngoai tu nhien cho toc. Mang lai cam giac muot ma, nhe nhang va khong gay bet dinh.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'styling', '100g', 488000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Milbon Molding Wax 5', 'Giu nep toc chac chan va tao do phong ro net. Giup duy tri kieu toc ly tuong suot ca ngay ma khong lam bet toc.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'styling', '100g', 488000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Milbon Molding Wax 7', 'Giu nep cuc manh, giup tao va co dinh cac kieu toc ca tinh. Duy tri cau truc toc sac net va ben bi suot ca ngay dai.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'styling', '120g', 488000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Milbon Wave Defining Cream 1', 'Kem tao kieu giup cap am va giu cho lon toc uon mem mai. Mang lai mai toc bong beng ma khong gay bet dinh. Thoa deu de lam noi bat nep song.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'styling', '150g', 488000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Milbon Wet Shine Gel Cream 5', 'Tao hieu ung toc uot quyen ru va giu nep chac chan. Mang lai do bong muot va do phong tu nhien cho mai toc.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'styling', '150g', 488000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Milbon Wet Shine Gel Cream 8', 'Giu nep cuc manh voi hieu ung bong muot quyen ru. Giup tao kieu toc sac net va duy tri ve ngoai bong bay suot ca ngay.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'styling', '210g', 488000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Milbon Medium Hold Hairspray 6', 'Giu nep toc vua phai va tu nhien. Giup duy tri kieu toc suot ca ngay ma van giu duoc su mem mai, linh hoat cho mai toc.' from p;

with p as (
  insert into public.products (brand_id, category, volume, price, stock)
  select id, 'styling', '210g', 488000, 10 from public.brands where name = 'MILBON' returning id
)
insert into public.product_translations (product_id, locale, name, description)
select id, 'vi', 'Milbon Extra Strong Hold Hairspray 10', 'Cung cap do giu nep toi da de co dinh moi kieu toc ngay lap tuc. Loai keo xit sieu giu nep nay giup mai toc cua ban luon hoan hao va chong am suot ca ngay.' from p;
