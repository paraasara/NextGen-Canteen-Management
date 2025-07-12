
-- Final cleanup migration - consolidates all necessary updates

-- Update all menu items with their proper images
UPDATE menu_items SET image = '/lovable-uploads/22b917aa-8a82-4493-9113-cc2f41efde9e.png' WHERE name = 'Tea';
UPDATE menu_items SET image = '/lovable-uploads/af71dc3c-9336-464a-94bb-cb97569d7091.png' WHERE name = 'Coffee';
UPDATE menu_items SET image = '/lovable-uploads/53c5c714-2c63-4cd4-9882-d0a66042a632.png' WHERE name = 'Badam Milk';
UPDATE menu_items SET image = '/lovable-uploads/62e3fad2-c808-4b44-a4ec-fb182756eaa8.png' WHERE name = 'Idly';
UPDATE menu_items SET image = '/lovable-uploads/62587abe-e3fc-48af-8fd3-bda00ab8a6eb.png' WHERE name = 'Vada';
UPDATE menu_items SET image = '/lovable-uploads/62587abe-e3fc-48af-8fd3-bda00ab8a6eb.png' WHERE name = 'Idly Vada';
UPDATE menu_items SET image = '/lovable-uploads/59de6f70-e9b7-4602-bdae-0c6f531e5cff.png' WHERE name = 'Khara Bath';
UPDATE menu_items SET image = '/lovable-uploads/8b5dc9ec-187f-457d-86f9-0c5a66e27a0c.png' WHERE name = 'Kesari Bath';
UPDATE menu_items SET image = '/lovable-uploads/2afa599d-e404-4b92-b263-34977d8f6338.png' WHERE name = 'Chow Chow Bath';
UPDATE menu_items SET image = '/lovable-uploads/fec26d82-e343-406c-ac36-d808049de95c.png' WHERE name = 'Rice Bath';
UPDATE menu_items SET image = '/lovable-uploads/1ccd9826-a65b-440c-833c-0c409cfd533e.png' WHERE name = 'Bisibele Bath';
UPDATE menu_items SET image = '/lovable-uploads/b473a8e5-561d-4b9d-9eb2-02ced13df440.png' WHERE name = 'Vada Pav';

-- Dosa items
UPDATE menu_items SET image = '/lovable-uploads/e620214d-adcf-4664-9c77-85610e3db61b.png' WHERE name = 'Masala Dosa';
UPDATE menu_items SET image = '/lovable-uploads/90977dad-e9b0-439f-8863-843fe685d85a.png' WHERE name = 'Plain Dosa';
UPDATE menu_items SET image = '/lovable-uploads/10c3d236-ea2d-4286-ba01-2044b8ff04ee.png' WHERE name = 'Set Dosa';
UPDATE menu_items SET image = '/lovable-uploads/27ce29f6-a3fc-4a64-9cff-78c99169d75b.png' WHERE name = 'Paneer Masala Dosa';
UPDATE menu_items SET image = '/lovable-uploads/7022ed2e-25d7-44e8-8cbf-a3fab815689e.png' WHERE name = 'Paneer Plain Dosa';
UPDATE menu_items SET image = '/lovable-uploads/8b9f7e47-2deb-4b2e-a471-ce6d842c622d.png' WHERE name = 'Ghee Masala Dosa';
UPDATE menu_items SET image = '/lovable-uploads/5c508057-d42e-425e-98e2-8da938bc497e.png' WHERE name = 'Ghee Plain Dosa';
UPDATE menu_items SET image = '/lovable-uploads/fb018aa3-2de3-48fd-8aec-9b0696191c33.png' WHERE name = 'Butter Masala Dosa';
UPDATE menu_items SET image = '/lovable-uploads/fb018aa3-2de3-48fd-8aec-9b0696191c33.png' WHERE name = 'Butter Plain Dosa';
UPDATE menu_items SET image = '/lovable-uploads/3904c5a4-5dc9-4254-8a18-46dbaf571cee.png' WHERE name = 'Parota';

-- Lunch items
UPDATE menu_items SET image = '/lovable-uploads/f0a34084-3ab1-4594-b737-3ca8ba1992da.png' WHERE name = 'South Indian Meals';
UPDATE menu_items SET image = '/lovable-uploads/317ef351-cf4c-40a5-94c9-817574ca5c0c.png' WHERE name = 'Rice Sambar';
UPDATE menu_items SET image = '/lovable-uploads/b968d19e-5cde-4840-b838-4cdbd059202a.png' WHERE name = 'Chapathi Curry';
UPDATE menu_items SET image = '/lovable-uploads/3fb07455-25a3-4082-b043-86cf85635ce6.png' WHERE name = 'Curd Rice';
UPDATE menu_items SET image = '/lovable-uploads/47a59e5e-bf0d-4903-812f-5c1da2b36c2a.png' WHERE name = 'Lemon Rice';

-- Chinese items
UPDATE menu_items SET image = '/lovable-uploads/4dc35acf-8beb-4352-8e6b-22b222b23c45.png' WHERE name = 'Gobi Manchurian';
UPDATE menu_items SET image = '/lovable-uploads/4854f24a-d07f-4183-a5e8-87ee8e2da85f.png' WHERE name = 'Gobi Chilly';
UPDATE menu_items SET image = '/lovable-uploads/86ac04b0-f37f-4987-8fa5-7289fdd2073d.png' WHERE name = 'Paneer Manchurian';
UPDATE menu_items SET image = '/lovable-uploads/6f99d54b-9c48-4ddb-84a7-1e9dfcf58e44.png' WHERE name = 'Paneer Chilly';
UPDATE menu_items SET image = '/lovable-uploads/8cd55937-1f98-4900-8151-ec8dafd9a5b0.png' WHERE name = 'Baby Corn Manchurian';
UPDATE menu_items SET image = '/lovable-uploads/5a4c92d1-f484-457a-9ee7-3e178f400273.png' WHERE name = 'Baby Corn Chilly';
UPDATE menu_items SET image = '/lovable-uploads/35a06ae1-cf5b-4847-9efa-716b54eb9628.png' WHERE name = 'Mushroom Manchurian';
UPDATE menu_items SET image = '/lovable-uploads/81574391-f5a6-4f52-bda4-c19b91ccd504.png' WHERE name = 'Mushroom Chilly';
UPDATE menu_items SET image = '/lovable-uploads/e15af0b6-d839-43d1-8426-1701e898bf46.png' WHERE name = 'Veg Fried Rice';
UPDATE menu_items SET image = '/lovable-uploads/cfd91f46-d4f0-47fd-bfab-e89411071f16.png' WHERE name = 'Veg Noodles';
UPDATE menu_items SET image = '/lovable-uploads/1fa905b2-211f-4061-b54f-6f21afb48389.png' WHERE name = 'Paneer Fried Rice';
UPDATE menu_items SET image = '/lovable-uploads/d490d0c2-8602-4649-9d2a-2b77c7a10422.png' WHERE name = 'Paneer Noodles';
UPDATE menu_items SET image = '/lovable-uploads/29f5d2c8-89d1-4ef5-abbe-e64400592004.png' WHERE name = 'Gobi Fried Rice';
UPDATE menu_items SET image = '/lovable-uploads/9a3493f9-cb33-4fc5-8f1b-fe1136bb5ae4.png' WHERE name = 'Gobi Noodles';
UPDATE menu_items SET image = '/lovable-uploads/54d23b72-164e-474c-aed3-63d4d8d7933a.png' WHERE name = 'Baby Corn Rice';
UPDATE menu_items SET image = '/lovable-uploads/6d884d39-3aad-46b6-893a-6eac8a8c5ed4.png' WHERE name = 'Mushroom Rice';
UPDATE menu_items SET image = '/lovable-uploads/df14dbc3-3f5b-4794-b6ed-3028db98c71f.png' WHERE name = 'Ghee Rice';
UPDATE menu_items SET image = '/lovable-uploads/0b71c5ad-e280-4a0e-927e-a778c0261664.png' WHERE name = 'Jeera Rice';

