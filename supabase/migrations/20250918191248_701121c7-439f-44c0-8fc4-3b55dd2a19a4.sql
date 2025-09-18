-- Add consultation slot selection and status to prescriptions table
ALTER TABLE prescriptions 
ADD COLUMN IF NOT EXISTS selected_consultation_date date,
ADD COLUMN IF NOT EXISTS selected_consultation_time time without time zone,
ADD COLUMN IF NOT EXISTS consultation_status text DEFAULT 'pending';

-- Update existing records to have default status
UPDATE prescriptions SET consultation_status = 'pending' WHERE consultation_status IS NULL;