
-- Remove legacy/duplicate RLS policies and rebuild minimal, correct ones

-- Orders table: cleanup and minimal policies
DROP POLICY IF EXISTS "insert_order" ON public.orders;
DROP POLICY IF EXISTS "update_order" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "select_own_orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can insert orders" ON public.orders;

-- Profiles table: cleanup and minimal policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Re-create only necessary policies for current app usage

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Authenticated users can insert orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all orders" ON public.orders
  FOR UPDATE USING (public.get_current_user_role() = 'admin');

-- Profiles policies
CREATE POLICY "Users can view/update own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Note: No tables or functions will be dropped, so no data loss will occur.

-- Only the minimum necessary policies for menu_items and categories are kept (or open unless you specify otherwise).
