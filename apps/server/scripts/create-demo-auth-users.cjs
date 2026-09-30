const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
const users = [
  ['demo-emergency@example.com', 'Demo Operator (Ambulance)'],
  ['demo-control@example.com', 'Control Room Specialist'],
  ['demo-officer@example.com', 'Officer Suresh'],
  ['demo-admin@example.com', 'System Administrator'],
  ['officer-swargate@example.com', 'Inspector Ramesh'],
  ['officer-station@example.com', 'Officer Priya'],
  ['officer-bundgarden@example.com', 'Officer Amit'],
  ['officer-rubyhall@example.com', 'Officer Deepa']
];

(async () => {
  for (const [email, name] of users) {
    const { data, error } = await supabase.auth.admin.createUser({ email, password: 'Password123!', email_confirm: true, user_metadata: { name } });
    if (error && !/already registered|already exists/i.test(error.message)) console.error(`${email}: ${error.message}`);
    else console.log(`${email}: ${data?.user?.id ? `created (${data.user.id})` : 'already exists'}`);
  }
  console.log('Demo Auth setup complete. Application profiles are matched by email.');
})();
