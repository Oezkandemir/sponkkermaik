# Supabase Vouchers Table Schema

Run this SQL in your Supabase SQL Editor to create the vouchers table:

```sql
-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'used', 'expired')),
  paypal_order_id TEXT,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX idx_vouchers_user_id ON vouchers(user_id);

-- Create index on code for faster lookups
CREATE INDEX idx_vouchers_code ON vouchers(code);

-- Create index on status for filtering
CREATE INDEX idx_vouchers_status ON vouchers(status);

-- Enable Row Level Security
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only view their own vouchers
CREATE POLICY "Users can view own vouchers"
  ON vouchers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Service role can insert vouchers (for payment processing)
CREATE POLICY "Service role can insert vouchers"
  ON vouchers
  FOR INSERT
  WITH CHECK (true);

-- Create policy: Users can update their own vouchers (mark as used)
CREATE POLICY "Users can update own vouchers"
  ON vouchers
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vouchers_updated_at
  BEFORE UPDATE ON vouchers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically expire vouchers
CREATE OR REPLACE FUNCTION expire_old_vouchers()
RETURNS void AS $$
BEGIN
  UPDATE vouchers
  SET status = 'expired'
  WHERE status = 'active'
    AND valid_until < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a cron job to run the expiration function daily
-- (Requires pg_cron extension to be enabled in Supabase)
-- SELECT cron.schedule(
--   'expire-vouchers',
--   '0 0 * * *',  -- Run daily at midnight
--   $$SELECT expire_old_vouchers()$$
-- );
```

## Table Structure

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Reference to auth.users |
| code | TEXT | Unique voucher code (e.g., SPONK-ABC12345) |
| value | DECIMAL | Voucher value in EUR |
| status | TEXT | active, used, or expired |
| paypal_order_id | TEXT | PayPal order ID for tracking |
| valid_until | TIMESTAMP | Expiry date (12 months from purchase) |
| used_at | TIMESTAMP | When the voucher was used |
| created_at | TIMESTAMP | When the voucher was created |
| updated_at | TIMESTAMP | Last update timestamp |

## Example Queries

### Get all active vouchers for a user
```sql
SELECT * FROM vouchers
WHERE user_id = auth.uid()
  AND status = 'active'
  AND valid_until > NOW()
ORDER BY created_at DESC;
```

### Mark voucher as used
```sql
UPDATE vouchers
SET status = 'used',
    used_at = NOW()
WHERE code = 'SPONK-ABC12345'
  AND user_id = auth.uid()
  AND status = 'active';
```

### Get voucher statistics
```sql
SELECT
  COUNT(*) as total_vouchers,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_vouchers,
  SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) as used_vouchers,
  SUM(value) as total_value
FROM vouchers
WHERE user_id = auth.uid();
```






