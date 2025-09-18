-- Add selected consultation date and time to prescriptions table
ALTER TABLE prescriptions 
ADD COLUMN selected_consultation_date date,
ADD COLUMN selected_consultation_time time without time zone,
ADD COLUMN consultation_status text DEFAULT 'pending';

-- Update existing records to have a default status
UPDATE prescriptions SET consultation_status = 'pending' WHERE consultation_status IS NULL;