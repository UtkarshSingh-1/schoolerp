const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/school_erp'
});

async function seedExtensions() {
    try {
        console.log('Seeding Transport and Hostel data...');

        // 1. Seed Routes
        await pool.query(`
            INSERT INTO routes (route_name, monthly_cost) VALUES 
            ('North Sector Loop', 1200),
            ('Downtown Express', 1500),
            ('Suburb Shuttle', 2000)
            ON CONFLICT DO NOTHING
        `);

        // 2. Seed Hostels
        const hostelRes = await pool.query(`
            INSERT INTO hostels (name, type, address) VALUES 
            ('Tagore Bhawan (Boys)', 'BOYS', 'North Campus Block A'),
            ('Sarojini Sadan (Girls)', 'GIRLS', 'South Campus Block C')
            RETURNING id, name
            ON CONFLICT DO NOTHING
        `);

        if (hostelRes.rows.length > 0) {
            const tagoreId = hostelRes.rows.find(h => h.name.includes('Tagore')).id;
            const sarojiniId = hostelRes.rows.find(h => h.name.includes('Sarojini')).id;

            // 3. Seed Rooms
            await pool.query(`
                INSERT INTO rooms (hostel_id, room_no, capacity, monthly_rent) VALUES 
                (${tagoreId}, 'B-101', 4, 4500),
                (${tagoreId}, 'B-102', 4, 4500),
                (${sarojiniId}, 'G-201', 3, 5500)
                ON CONFLICT DO NOTHING
            `);
        }

        console.log('Extensions seeded successfully!');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        await pool.end();
    }
}

seedExtensions();
