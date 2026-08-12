require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.example', 'utf8'); // or whatever if there's no .env
console.log("envFile", envFile);
