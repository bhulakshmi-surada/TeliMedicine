-- Insert sample doctor data for testing
DO $$
DECLARE
    doctor_user_id UUID;
    patient_user_id UUID;
    doctor_id UUID;
    patient_id UUID;
BEGIN
    -- Create auth users (these would normally be created through registration)
    -- Doctor test account
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'doctor@telemed.com',
        '$2a$10$vC5k5j5VhV5y5j5VhV5y5j5VhV5y5j5VhV5y5j5VhV5y5j5VhV5y5',
        now(),
        null,
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Dr. Chinnu Paramsetti"}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    ) RETURNING id INTO doctor_user_id;
    
    -- Patient test account  
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'patient@telemed.com',
        '$2a$10$vC5k5j5VhV5y5j5VhV5y5j5VhV5y5j5VhV5y5j5VhV5y5j5VhV5y5',
        now(),
        null,
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Chinnu Paramsetti"}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    ) RETURNING id INTO patient_user_id;

    -- Insert doctor profile
    INSERT INTO doctors (
        user_id,
        full_name,
        email,
        specialization,
        license_number,
        phone,
        bio,
        experience_years,
        available
    ) VALUES (
        doctor_user_id,
        'Dr. Chinnu Paramsetti',
        'doctor@telemed.com',
        'Psychiatry',
        'MD123456',
        '+1-555-0123',
        'Experienced psychiatrist specializing in mental health and wellness.',
        10,
        true
    ) RETURNING id INTO doctor_id;

    -- Insert patient profile
    INSERT INTO patients (
        user_id,
        full_name,
        email,
        phone,
        date_of_birth,
        gender,
        emergency_contact,
        medical_history
    ) VALUES (
        patient_user_id,
        'Chinnu Paramsetti',
        'patient@telemed.com',
        '7893579928',
        '1990-01-01',
        'Other',
        '7893579928',
        'No significant medical history'
    ) RETURNING id INTO patient_id;

    -- Insert sample consultation requests
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
        'mental health',
        'video',
        'completed',
        'Follow-up consultation for depression treatment'
    ),
    (
        patient_id,
        doctor_id,
        'anxiety symptoms',
        'chat',
        'pending',
        'Having trouble sleeping and increased anxiety levels'
    );

END $$;