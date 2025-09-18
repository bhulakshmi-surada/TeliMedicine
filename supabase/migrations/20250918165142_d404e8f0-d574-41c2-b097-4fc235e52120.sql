-- Update Dr. Sarah Wilson to be linked to the doctor@telemed.com account
UPDATE doctors 
SET user_id = '670dec15-531c-40a1-945d-b091d1b140c6',
    email = 'doctor@telemed.com',
    full_name = 'Dr. Chinnu Paramsetti',
    specialization = 'Psychiatry'
WHERE email = 'sarah.wilson@example.com';

-- Create some consultation requests for this doctor to test the dashboard
DO $$
DECLARE
    doctor_id UUID;
    patient_id UUID;
BEGIN
    -- Get the updated doctor's ID
    SELECT id INTO doctor_id FROM doctors WHERE user_id = '670dec15-531c-40a1-945d-b091d1b140c6';
    
    -- Get a patient ID
    SELECT id INTO patient_id FROM patients LIMIT 1;
    
    -- Insert consultation requests if patient exists
    IF patient_id IS NOT NULL THEN
        INSERT INTO consultation_requests (
            patient_id,
            doctor_id,
            symptoms,
            consultation_type,
            status,
            request_message
        ) VALUES 
        (
            patient_id,
            doctor_id,
            'mental health problem',
            'chat',
            'completed',
            'Need help with anxiety and stress management'
        ),
        (
            patient_id,
            doctor_id,
            'urgent',
            'video',
            'accepted',
            'urgent'
        ),
        (
            patient_id,
            doctor_id,
            'anxiety symptoms',
            'chat',
            'pending',
            'Having trouble sleeping and increased anxiety levels'
        );
    END IF;
END $$;