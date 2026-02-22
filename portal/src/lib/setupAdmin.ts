import { supabase } from './supabase';
import { eventsToSeed } from './seedEvents';

/**
 * ONE-TIME SETUP SCRIPT
 * Run this once to create the admin user and seed all events
 * 
 * Usage in browser console:
 * import('./src/lib/setupAdmin.ts').then(m => m.setupAdminAndEvents());
 */

export const createAdminUser = async () => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@test.com',
      password: 'Admin@UTh2026',
      options: {
        data: {
          role: 'admin',
        },
      },
    });

    if (error) {
      console.error('❌ Error creating admin:', error);
      console.log('\n⚠️  Skipping user creation. Continuing with event seeding...\n');
      return null;
    }

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@test.com');
    console.log('Password: Admin@UTh2026');
    return data;
  } catch (error) {
    console.error('Error:', error);
    console.log('\n⚠️  Skipping user creation. Continuing with event seeding...\n');
    return null;
  }
};

export const seedAllEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert(eventsToSeed.map((e) => ({ ...e, venue: null, event_date: null, event_time: null, rules_pdf_url: null, is_prelim: null })))
      .select();

    if (error) throw error;
    console.log(`✅ Successfully seeded ${data?.length || 0} events!`);
    return data;
  } catch (error) {
    console.error('❌ Error seeding events:', error);
    throw error;
  }
};

export const setupAdminAndEvents = async () => {
  console.log('🚀 Starting setup...');
  try {
    console.log('\n1️⃣ Creating admin user...');
    await createAdminUser();
    
    console.log('\n2️⃣ Seeding 28 events...');
    await seedAllEvents();
    
    console.log('\n✅ Setup complete!\n');
    console.log('Admin Credentials:');
    console.log('  Email: admin@test.com');
    console.log('  Password: Admin@UTh2026');
    console.log('\n✅ All 28 events have been added to the database!');
    console.log('\n📍 Next: Login at http://localhost:5174/admin');
  } catch (error) {
    console.error('Setup failed:', error);
  }
};
