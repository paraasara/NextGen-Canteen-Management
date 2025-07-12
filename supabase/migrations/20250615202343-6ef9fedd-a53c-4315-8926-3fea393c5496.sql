
-- Update Paneer Plain Dosa
UPDATE menu_items
SET image = '/lovable-uploads/90b9b673-6fe5-45f6-ac05-f58fde6fea11.png'
WHERE LOWER(name) = 'paneer plain dosa';

-- Update Ghee Masala Dosa
UPDATE menu_items
SET image = '/lovable-uploads/b25ea2f8-ed35-4f89-a0ca-b032a76b3289.png'
WHERE LOWER(name) = 'ghee masala dosa';

-- Update Ghee Plain Dosa
UPDATE menu_items
SET image = '/lovable-uploads/8ba76dd9-6fb3-4251-8375-e4518260d694.png'
WHERE LOWER(name) = 'ghee plain dosa';

-- Update Butter Masala Dosa
UPDATE menu_items
SET image = '/lovable-uploads/86d82b4e-9479-4d6f-a5a8-b279659b5f26.png'
WHERE LOWER(name) = 'butter masala dosa';

-- Update Butter Plain Dosa (using same as Ghee Plain Dosa unless another is provided)
UPDATE menu_items
SET image = '/lovable-uploads/8ba76dd9-6fb3-4251-8375-e4518260d694.png'
WHERE LOWER(name) = 'butter plain dosa';

-- Update Parota
UPDATE menu_items
SET image = '/lovable-uploads/3b4fb6fd-62fe-404a-a10e-50b2b4c756ff.png'
WHERE LOWER(name) = 'parota';

-- Update South Indian Meals
UPDATE menu_items
SET image = '/lovable-uploads/29859bad-6f4c-4cac-916b-05c3ff343ce0.png'
WHERE LOWER(name) = 'south indian meals';

