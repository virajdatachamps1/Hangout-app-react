// src/utils/csvImporter.js - COMPLETE UPDATED VERSION

import { db } from '../firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';

export const csvToJSON = (csvText) => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, ''));
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || '';
    });
    return obj;
  });
};

const parseDate = (dateStr) => {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    dateStr = dateStr.trim();
    let parts;
    
    if (dateStr.includes('/')) {
      parts = dateStr.split('/');
    } else if (dateStr.includes('-')) {
      parts = dateStr.split('-');
    } else {
      console.warn('⚠️ Unknown date format:', dateStr);
      return null;
    }
    
    if (parts.length !== 3) {
      console.warn('⚠️ Date does not have 3 parts:', dateStr);
      return null;
    }
    
    let day = parseInt(parts[0]);
    let month = parseInt(parts[1]) - 1;
    let year = parseInt(parts[2]);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      console.warn('⚠️ Invalid date numbers:', dateStr);
      return null;
    }
    
    if (year < 100) {
      year = year <= 30 ? 2000 + year : 1900 + year;
    }
    
    const date = new Date(year, month, day);
    
    if (isNaN(date.getTime()) || 
        date.getDate() !== day || 
        date.getMonth() !== month) {
      console.warn('⚠️ Invalid date value:', dateStr);
      return null;
    }
    
    return date.toISOString();
    
  } catch (error) {
    console.error('❌ Error parsing date:', dateStr, error);
    return null;
  }
};

export const importCelebrationsCSV = async (csvText) => {
  const data = csvToJSON(csvText);
  const batch = writeBatch(db);
  let imported = 0;
  const errors = [];

  console.log('📊 Starting import of', data.length, 'rows');

  for (const row of data) {
    if (!row.email || row.email.trim() === '') {
      console.warn('⚠️ Skipping row with no email');
      continue;
    }

    const email = row.email.toLowerCase().trim();
    
    console.log(`\n🔍 Processing: ${row.name || email}`);
    console.log('   Birthday raw:', row.birthday);
    console.log('   Anniversary raw:', row.workanniversary);
    
    const birthday = parseDate(row.birthday);
    const workAnniversary = parseDate(row.workanniversary || row['workanniversary']);

    if (!birthday) {
      errors.push(`⚠️ Invalid birthday for ${row.name || email} (value: "${row.birthday}")`);
    }
    
    if (!workAnniversary) {
      errors.push(`⚠️ Invalid work anniversary for ${row.name || email} (value: "${row.workanniversary}")`);
    }

    const userRef = doc(db, 'users', email);
    const userData = {
      email: email,
      name: row.name?.trim() || email.split('@')[0],
      birthday: birthday,
      workAnniversary: workAnniversary,
      department: row.department?.trim() || '',
      role: 'employee',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('✅ User data prepared:', userData);
    
    batch.set(userRef, userData, { merge: true });
    imported++;
  }

  try {
    await batch.commit();
    console.log(`✅ Successfully imported ${imported} users`);
    
    return { 
      success: true, 
      imported,
      errors 
    };
  } catch (error) {
    console.error('❌ Batch commit error:', error);
    return {
      success: false,
      error: error.message,
      imported: 0,
      errors: [error.message]
    };
  }
};

export const importTimesheetsCSV = async (csvText) => {
  const data = csvToJSON(csvText);
  const batch = writeBatch(db);
  let updated = 0;
  const notFound = [];
  const errors = [];

  console.log('📊 Processing timesheet data for', data.length, 'users');

  for (const row of data) {
    if (!row.email || !row.link) {
      errors.push(`⚠️ Missing email or link in row`);
      continue;
    }
    
    const email = row.email.toLowerCase().trim();
    const userRef = doc(db, 'users', email);
    
    console.log(`🔍 Adding timesheet for: ${email}`);
    
    // Use set with merge instead of update
    batch.set(userRef, {
      timesheetLink: row.link.trim(),
      updatedAt: new Date()
    }, { merge: true });
    
    updated++;
  }

  try {
    await batch.commit();
    console.log(`✅ Successfully updated ${updated} timesheets`);
    
    return { 
      success: true, 
      updated,
      notFound,
      errors 
    };
  } catch (error) {
    console.error('❌ Timesheet import error:', error);
    return {
      success: false,
      error: error.message,
      updated: 0,
      notFound,
      errors: [error.message]
    };
  }
};