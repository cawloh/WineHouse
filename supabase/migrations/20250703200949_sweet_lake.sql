/*
  # Winehouse Management System Database Schema

  1. Authentication & Users
    - Custom users table for additional profile data
    - Extends Supabase auth.users with business-specific fields

  2. Core Business Tables
    - `products` - Wine and beverage products
    - `suppliers` - Product suppliers
    - `stocks` - Inventory management
    - `transactions` - Sales transactions
    - `product_statuses` - Expired/damaged product reports
    - `activity_logs` - System activity tracking
    - `notifications` - User notifications
    - `attendance_records` - Staff attendance tracking

  3. Security
    - Row Level Security (RLS) enabled on all tables
    - Role-based access policies (admin/staff)
    - User can only access their own data where appropriate
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom users table to extend auth.users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at timestamptz DEFAULT now(),
  
  -- Profile fields
  first_name text,
  middle_name text,
  last_name text,
  birthday date,
  address text,
  contact_number text,
  email text,
  profile_image text,
  profile_updated_at timestamptz,
  
  -- Attendance tracking
  is_active boolean DEFAULT false,
  last_time_in timestamptz,
  last_time_out timestamptz
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id) NOT NULL
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  contact_number text NOT NULL CHECK (length(contact_number) = 11),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id) NOT NULL
);

-- Stocks table
CREATE TABLE IF NOT EXISTS stocks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) NOT NULL,
  quantity integer NOT NULL CHECK (quantity >= 0),
  price decimal(10,2) NOT NULL CHECK (price > 0),
  date_added date NOT NULL,
  expiry_date date NOT NULL,
  supplier_id uuid REFERENCES suppliers(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id) NOT NULL,
  
  CONSTRAINT valid_dates CHECK (expiry_date > date_added)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price decimal(10,2) NOT NULL CHECK (price > 0),
  total_price decimal(10,2) NOT NULL CHECK (total_price > 0),
  transaction_date timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id) NOT NULL
);

-- Product statuses table (for expired/damaged products)
CREATE TABLE IF NOT EXISTS product_statuses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('expired', 'damaged')),
  quantity integer NOT NULL CHECK (quantity > 0),
  notes text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  image_url text,
  
  -- Reporter information
  reported_by uuid REFERENCES users(id) NOT NULL,
  reported_at timestamptz DEFAULT now(),
  
  -- Reviewer information
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamptz,
  review_notes text,
  
  -- Edit tracking
  edited_at timestamptz,
  previous_reports jsonb DEFAULT '[]'::jsonb
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) NOT NULL,
  action text NOT NULL,
  details text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Attendance records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) NOT NULL,
  time_in timestamptz NOT NULL,
  time_out timestamptz,
  date date NOT NULL,
  duration integer, -- in minutes
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete staff users" ON users
  FOR DELETE TO authenticated
  USING (
    role = 'staff' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- Products policies
CREATE POLICY "Everyone can read products" ON products
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage products" ON products
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- Suppliers policies
CREATE POLICY "Everyone can read suppliers" ON suppliers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage suppliers" ON suppliers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- Stocks policies
CREATE POLICY "Everyone can read stocks" ON stocks
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage stocks" ON stocks
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- Transactions policies
CREATE POLICY "Everyone can read transactions" ON transactions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create transactions" ON transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all transactions" ON transactions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- Product statuses policies
CREATE POLICY "Users can read all product statuses" ON product_statuses
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create product status reports" ON product_statuses
  FOR INSERT TO authenticated
  WITH CHECK (
    reported_by IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own reports" ON product_statuses
  FOR UPDATE TO authenticated
  USING (
    reported_by IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all product statuses" ON product_statuses
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- Activity logs policies
CREATE POLICY "Users can read all activity logs" ON activity_logs
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create activity logs" ON activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Attendance records policies
CREATE POLICY "Users can read all attendance records" ON attendance_records
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create own attendance records" ON attendance_records
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own attendance records" ON attendance_records
  FOR UPDATE TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);
CREATE INDEX IF NOT EXISTS idx_suppliers_created_by ON suppliers(created_by);
CREATE INDEX IF NOT EXISTS idx_stocks_product_id ON stocks(product_id);
CREATE INDEX IF NOT EXISTS idx_stocks_supplier_id ON stocks(supplier_id);
CREATE INDEX IF NOT EXISTS idx_stocks_created_by ON stocks(created_by);
CREATE INDEX IF NOT EXISTS idx_transactions_product_id ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_product_statuses_product_id ON product_statuses(product_id);
CREATE INDEX IF NOT EXISTS idx_product_statuses_reported_by ON product_statuses(reported_by);
CREATE INDEX IF NOT EXISTS idx_product_statuses_type ON product_statuses(type);
CREATE INDEX IF NOT EXISTS idx_product_statuses_status ON product_statuses(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);

-- Functions for automatic user creation
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (auth_user_id, username, role, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth.users insert
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Function to update stock quantity after transaction
CREATE OR REPLACE FUNCTION update_stock_after_transaction()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stocks 
  SET quantity = quantity - NEW.quantity
  WHERE product_id = NEW.product_id
  AND quantity >= NEW.quantity;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stock after transaction
DROP TRIGGER IF EXISTS update_stock_trigger ON transactions;
CREATE TRIGGER update_stock_trigger
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_after_transaction();

-- Function to update stock quantity after product status approval
CREATE OR REPLACE FUNCTION update_stock_after_status_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update stock if status changed to approved
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE stocks 
    SET quantity = quantity - NEW.quantity
    WHERE product_id = NEW.product_id
    AND quantity >= NEW.quantity;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient stock for product status update';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stock after product status approval
DROP TRIGGER IF EXISTS update_stock_status_trigger ON product_statuses;
CREATE TRIGGER update_stock_status_trigger
  AFTER UPDATE ON product_statuses
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_after_status_approval();