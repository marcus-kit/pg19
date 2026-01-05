import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing required environment variables');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface CSVRow {
  id: string;
  added_date: string;
  account_number: string;
  last_name: string;
  first_name: string;
  middle_name: string;
  region: string;
  area: string;
  city: string;
  settlement: string;
  street: string;
  house: string;
  flats: string;
  phone_number: string;
  email: string;
}

async function importCSV(filePath: string) {
  const records: CSVRow[] = [];

  const parser = createReadStream(filePath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
  );

  for await (const record of parser) {
    records.push(record);
  }

  console.log(`Loaded ${records.length} records from CSV`);

  // Batch insert - разбиваем на батчи по 1000 записей
  const BATCH_SIZE = 1000;
  let totalUsers = 0;
  let totalAccounts = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(records.length / BATCH_SIZE)}...`);

    // 1. Insert users
    const users = batch.map(row => ({
      first_name: row.first_name?.trim() || 'Не указано',
      last_name: row.last_name?.trim() || 'Не указано',
      middle_name: row.middle_name?.trim() || null,
      email: row.email?.trim() || null,
      phone: row.phone_number?.trim() || null,
      status: 'active' as const,
    }));

    const { data: insertedUsers, error: usersError } = await supabase
      .from('users')
      .insert(users)
      .select('id');

    if (usersError) {
      console.error('Error inserting users:', usersError);
      continue;
    }

    totalUsers += insertedUsers.length;

    // 2. Insert accounts (now includes contract data)
    const accounts = batch.map((row, index) => {
      const userId = insertedUsers[index]?.id;
      if (!userId) return null;

      const fullAddress = [
        row.city,
        row.street,
        row.house,
        row.flats && `кв. ${row.flats}`,
      ].filter(Boolean).join(', ') || null;

      return {
        user_id: userId,
        contract_number: parseInt(row.account_number) || null,
        contract_status: 'active' as const,
        status: 'active' as const,
        balance: 0,
        credit_limit: 0,
        address_city: row.city?.trim() || null,
        address_street: row.street?.trim() || null,
        address_building: row.house?.trim() || null,
        address_apartment: row.flats?.trim() || null,
        address_full: fullAddress,
      };
    }).filter(Boolean);

    const { error: accountsError } = await supabase
      .from('accounts')
      .insert(accounts);

    if (accountsError) {
      console.error('Error inserting accounts:', accountsError);
      continue;
    }

    totalAccounts += accounts.length;

    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} completed: ${insertedUsers.length} users, ${accounts.length} accounts`);
  }

  console.log(`\nImport completed:`);
  console.log(`  Users: ${totalUsers}`);
  console.log(`  Accounts: ${totalAccounts}`);
}

// Run import
const csvPath = process.argv[2] || '/Users/doka/Downloads/user_account.csv';
importCSV(csvPath).catch(console.error);
