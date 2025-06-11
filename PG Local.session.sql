INSERT INTO departments (id, name, description, keywords, contact_email, created_at)
VALUES
    (1, 'Public Works', 'Handles roads and public infrastructure', ARRAY['pothole', 'road', 'street', 'bridge', 'infrastructure'], 'publicworks@rohtak.gov.in', '2025-06-07 12:18:21.806665'),
    (2, 'Water Department', 'Manages water supply and drainage', ARRAY['water', 'pipe', 'supply', 'drainage', 'leak'], 'water@rohtak.gov.in', '2025-06-07 12:18:21.806665'),
    (3, 'Electricity Department', 'Handles power supply issues', ARRAY['electricity', 'power', 'outage', 'transformer', 'wiring'], 'electricity@rohtak.gov.in', '2025-06-07 12:18:21.806665'),
    (34, 'Sanitation Department', 'Handles garbage collection', ARRAY['garbage', 'waste', 'trash', 'cleanliness', 'dump'], 'sanitation@rohtak.gov.in', '2025-06-07 19:50:47.689176')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    keywords = EXCLUDED.keywords,
    contact_email = EXCLUDED.contact_email,
    created_at = EXCLUDED.created_at;
