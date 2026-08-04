-- Seed the directory with real businesses found in public web search, and
-- add the fields needed to be honest about where each listing came from.
--
-- `verified` means someone has actually dealt with this business or checked
-- it directly. Everything seeded here is verified = false: the names and
-- websites are real and were taken from public sources recorded in
-- source_url, but nobody has vouched for the quality of the work. The UI says
-- so on every unverified card. No phone numbers or addresses are included,
-- because those weren't confirmed and a wrong number attached to a real
-- business is worse than no number.

alter table vendors add column if not exists source_url text;
alter table vendors add column if not exists verified boolean not null default false;
-- Tradition tags on seeded rows are inferred from the business's own public
-- description (or, for Nepal, the prevailing local traditions) — not declared
-- by the business itself.
alter table vendors add column if not exists tags_inferred boolean not null default false;

insert into vendors (name, category, traditions, region, description, website, source_url, published, verified, tags_inferred)
values
  -- Kathmandu, Nepal — photography
  ('Wedding Story Nepal', 'Photography & video', '{hindu,buddhist}', 'Kathmandu, Nepal',
   'Wedding photography studio with locations in Kathmandu and Butwal.',
   'https://weddingstory.com.np/', 'https://weddingstory.com.np/', true, false, true),
  ('Photo Choice Nepal', 'Photography & video', '{hindu,buddhist}', 'Kathmandu, Nepal',
   'Wedding and event photography company based in Kathmandu.',
   'https://photochoicenepal.com/', 'https://photochoicenepal.com/', true, false, true),
  ('Photo Studio Kathmandu', 'Photography & video', '{hindu,buddhist}', 'Kathmandu, Nepal',
   'Wedding photography and videography studio.',
   'https://photostudiokathmandu.com/', 'https://photostudiokathmandu.com/', true, false, true),
  ('Wedding Thapas', 'Photography & video', '{hindu,buddhist}', 'Kathmandu, Nepal',
   'Nepali wedding photography and cinematography studio.',
   'https://www.weddingthapas.com/', 'https://www.weddingthapas.com/', true, false, true),
  ('Wedding Photography Nepal', 'Photography & video', '{hindu,buddhist}', 'Naikap, Kathmandu, Nepal',
   'Photography and cinematography for weddings.',
   'https://weddingphotographynepal.com/', 'https://weddingphotographynepal.com/', true, false, true),
  ('Welclick Studio Nepal', 'Photography & video', '{hindu,buddhist}', 'New Baneshwor, Kathmandu, Nepal',
   'Photography studio in New Baneshwor.',
   'https://welclickstudionepal.com/', 'https://welclickstudionepal.com/', true, false, true),
  ('Wedding Kathmandu', 'Photography & video', '{hindu,buddhist}', 'Tokha, Kathmandu, Nepal',
   'Photography, photo printing and framing.',
   'https://www.weddingkathmandu.com/', 'https://www.weddingkathmandu.com/', true, false, true),

  -- Kathmandu, Nepal — catering and venue
  ('Amrapali Banquet', 'Venue', '{hindu,buddhist}', 'Naxal, Kathmandu, Nepal',
   'Banquet venue and catering, for events from around 50 up to several thousand guests.',
   'https://amrapalibanquet.com/', 'https://amrapalibanquet.com/', true, false, true),
  ('Bhoj Bhater Catering', 'Catering', '{hindu}', 'Kathmandu, Nepal',
   'Catering for weddings and traditional ceremonies; also offers pandit services and decoration.',
   'https://www.bhojbhater.com/', 'https://www.bhojbhater.com/', true, false, true),
  ('BG Caterings', 'Catering', '{hindu,buddhist}', 'Nepal',
   'Catering for weddings and gatherings across Nepal.',
   'https://bgcaterings.com/', 'https://bgcaterings.com/', true, false, true),
  ('Catering Nepal', 'Catering', '{hindu,buddhist}', 'Kathmandu, Nepal',
   'Event catering and hire for weddings and parties.',
   'https://cateringnepal.com/', 'https://cateringnepal.com/', true, false, true),
  ('Everest MICE', 'Catering', '{hindu,buddhist}', 'Kathmandu, Nepal',
   'Catering for weddings and corporate functions.',
   'https://everestmice.com/products/cater-services/', 'https://everestmice.com/products/cater-services/', true, false, true),

  -- Kathmandu, Nepal — attire
  ('Lagan Designer Boutique', 'Clothing & attire', '{hindu}', 'Kathmandu, Nepal',
   'Custom bridal and traditional wear, including Banarasi sarees, lehengas and Newari designs.',
   'https://lagandesign.com/', 'https://lagandesign.com/', true, false, true),
  ('Queens Closet Nepal', 'Clothing & attire', '{hindu,christian}', 'Kathmandu, Nepal',
   'Bridal lehengas, sarees and gowns.',
   'https://queensclosetnepal.com/product-category/bridal-dresses/', 'https://queensclosetnepal.com/', true, false, true),
  ('Kaavya Boutique', 'Clothing & attire', '{hindu}', 'Patan Dhoka, Lalitpur, Nepal',
   'Bridal wear, designer sarees, kurtis and gowns.',
   'https://www.kaavyaboutique.com/', 'https://www.kaavyaboutique.com/', true, false, true),

  -- London / UK — photography
  ('Royal Bindi', 'Photography & video', '{hindu,sikh,muslim}', 'London, United Kingdom',
   'London-based Asian wedding photography company covering the UK.',
   'https://royalbindi.co.uk/', 'https://royalbindi.co.uk/', true, false, true),
  ('Photos by Abhi', 'Photography & video', '{hindu,sikh,muslim,christian}', 'United Kingdom',
   'Asian and Indian wedding photographer; states coverage of Hindu, Sikh, Muslim and Christian weddings.',
   'https://www.photosbyabhi.co.uk/', 'https://www.photosbyabhi.co.uk/', true, false, true),
  ('East West Photography', 'Photography & video', '{hindu,sikh,muslim}', 'London, United Kingdom',
   'Asian wedding photography team based in London.',
   'https://eastwestphotography.com/asian-wedding-photographer-london/', 'https://eastwestphotography.com/', true, false, true),
  ('FilmFolk', 'Photography & video', '{hindu,muslim}', 'United Kingdom',
   'Asian wedding photography; states experience with Pakistani, Bengali, Indian and Sri Lankan couples.',
   'https://www.filmfolk.com/services/asian-wedding-photography', 'https://www.filmfolk.com/', true, false, true),
  ('Uzma''s', 'Photography & video', '{hindu,muslim,sikh}', 'London, United Kingdom',
   'Asian wedding photography; states coverage of Indian, Hindu, Muslim, Sikh and Tamil weddings.',
   'https://www.uzmas.co.uk/asian-wedding-photography-in-london/', 'https://www.uzmas.co.uk/', true, false, true),
  ('Samsara Studio', 'Photography & video', '{hindu,sikh,muslim}', 'London, Birmingham & Leicester, United Kingdom',
   'Asian wedding photography across London, Birmingham and Leicester.',
   'https://www.samsarastudio.co.uk/', 'https://www.samsarastudio.co.uk/', true, false, true)
on conflict do nothing;
