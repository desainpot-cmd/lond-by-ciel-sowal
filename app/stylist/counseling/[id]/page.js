insert into public.brands (name) values ('AOYAMA LAB') returning id;

with brand as (
  select id from public.brands where name = 'AOYAMA LAB' limit 1
),
new_products as (
  insert into public.products (brand_id, volume, price, stock, category)
  select brand.id, v.volume, v.price, v.stock, v.category
  from brand,
  (values
    ('250ml', 320000, 14, 'shampoo'),
    ('200g', 410000, 9, 'treatment'),
    ('120ml', 280000, 20, 'scalp'),
    ('80ml', 350000, 17, 'oil')
  ) as v(volume, price, stock, category)
  returning id, category
)
insert into public.product_translations (product_id, locale, name, description, usage_text)
select
  p.id,
  'vi',
  case p.category
    when 'shampoo' then 'モイストリペア シャンプー'
    when 'treatment' then 'リペアインテンシブ トリートメント'
    when 'scalp' then 'スカルプバランス エッセンス'
    when 'oil' then 'シルクフィニッシュ ヘアオイル'
  end,
  case p.category
    when 'shampoo' then 'ダメージを受けた髪の内部までうるおいを届ける補修シャンプー。'
    when 'treatment' then 'ブリーチ・カラーで傷んだ髪の内部をケラチンで満たす集中補修トリートメント。'
    when 'scalp' then '頭皮の乾燥・べたつきのバランスを整える育毛環境ケアエッセンス。'
    when 'oil' then '軽い付け心地でパサつきを抑え、まとまりのある艶髪へ導くオイル。'
  end,
  case p.category
    when 'shampoo' then '週3〜4回、地肌を指の腹でやさしくマッサージするように洗い、しっかりすすいでください。'
    when 'treatment' then '洗髪後、タオルドライした髪に毛先中心になじませ、5分置いてから洗い流してください。'
    when 'scalp' then '洗髪後、頭皮に直接塗布し、指の腹で優しくなじませてください。1日1回、就寝前がおすすめです。'
    when 'oil' then 'タオルドライ後、1〜2プッシュを毛先中心になじませてからドライヤーで乾かしてください。'
  end
from new_products p;
