// ============================================
// DATA MANAGER - CSV Import & Storage
// Handles employee data from CSV files
// Uses IndexedDB for local storage
// For React applications
// ============================================

class DataManager {
  constructor() {
    this.dbName = 'DataChampsDB';
    this.dbVersion = 1;
    this.db = null;
    this.initialized = false;
  }

  // ==========================================
  // DATABASE INITIALIZATION
  // ==========================================

  async init() {
    if (this.initialized) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('❌ Failed to open database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        console.log('✅ DataManager initialized');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create employees store
        if (!db.objectStoreNames.contains('employees')) {
          const employeeStore = db.createObjectStore('employees', { keyPath: 'email' });
          employeeStore.createIndex('name', 'name', { unique: false });
          employeeStore.createIndex('department', 'department', { unique: false });
          console.log('📦 Created employees store');
        }

        // Create metadata store (for tracking uploads)
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
          console.log('📦 Created metadata store');
        }
      };
    });
  }

  // ==========================================
  // CSV PARSING
  // ==========================================

  parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }

    // Get headers (convert to lowercase for consistency)
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      const values = this.parseCSVLine(line);
      
      if (values.length !== headers.length) {
        console.warn(`⚠️ Row ${i} has ${values.length} values but expected ${headers.length}, skipping`);
        continue;
      }
      
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index].trim();
      });
      
      data.push(obj);
    }
    
    return data;
  }

  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current);
    return values;
  }

  parseDate(dateStr) {
    if (!dateStr || dateStr.trim() === '') return null;
    
    try {
      const parts = dateStr.split('/');
      if (parts.length !== 3) return null;
      
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
      let year = parseInt(parts[2]);
      
      // Convert 2-digit year to 4-digit
      // Assume 00-30 = 2000-2030, 31-99 = 1931-1999
      if (year < 100) {
        year = year <= 30 ? 2000 + year : 1900 + year;
      }
      
      const date = new Date(year, month, day);
      
      // Validate date
      if (isNaN(date.getTime())) return null;
      
      return date;
    } catch (error) {
      console.error('❌ Error parsing date:', dateStr, error);
      return null;
    }
  }

  // ==========================================
  // CELEBRATIONS CSV IMPORT
  // ==========================================

  async importCelebrationsCSV(csvText, uploadedBy) {
    try {
      await this.init();
      console.log('📥 Importing celebrations CSV...');
      
      const rows = this.parseCSV(csvText);
      console.log(`📊 Parsed ${rows.length} rows`);
      
      const employees = [];
      const errors = [];
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        // Validate required fields
        if (!row.name || !row.email) {
          errors.push(`Row ${i + 2}: Missing name or email`);
          continue;
        }
        
        // Normalize email
        const email = row.email.toLowerCase().trim();
        
        // Parse dates
        const birthday = this.parseDate(row.birthday);
        const workAnniversary = this.parseDate(row['work anniversary']);
        
        if (!birthday) {
          errors.push(`Row ${i + 2}: Invalid birthday date for ${row.name}`);
        }
        
        if (!workAnniversary) {
          errors.push(`Row ${i + 2}: Invalid work anniversary date for ${row.name}`);
        }
        
        const employee = {
          name: row.name.trim(),
          email: email,
          birthday: birthday ? birthday.toISOString() : null,
          workAnniversary: workAnniversary ? workAnniversary.toISOString() : null,
          department: row.department ? row.department.trim() : '',
          timesheetLink: null, // Will be added from timesheets CSV
          source: 'celebrations_csv',
          lastUpdated: new Date().toISOString()
        };
        
        employees.push(employee);
      }
      
      // Store in IndexedDB
      await this.saveEmployees(employees);
      
      // Update metadata
      await this.saveMetadata('celebrations_upload', {
        uploadedBy: uploadedBy,
        uploadedAt: new Date().toISOString(),
        rowCount: employees.length,
        errorCount: errors.length
      });
      
      console.log(`✅ Imported ${employees.length} employees from celebrations CSV`);
      
      return {
        success: true,
        imported: employees.length,
        errors: errors,
        employees: employees
      };
      
    } catch (error) {
      console.error('❌ Error importing celebrations CSV:', error);
      return {
        success: false,
        error: error.message,
        imported: 0,
        errors: [error.message]
      };
    }
  }

  // ==========================================
  // TIMESHEETS CSV IMPORT
  // ==========================================

  async importTimesheetsCSV(csvText, uploadedBy) {
    try {
      await this.init();
      console.log('📥 Importing timesheets CSV...');
      
      const rows = this.parseCSV(csvText);
      console.log(`📊 Parsed ${rows.length} rows`);
      
      const updated = [];
      const errors = [];
      const notFound = [];
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        // Validate required fields
        if (!row.email || !row['timesheet link']) {
          errors.push(`Row ${i + 2}: Missing email or timesheet link`);
          continue;
        }
        
        const email = row.email.toLowerCase().trim();
        const timesheetLink = row['timesheet link'].trim();
        
        // Find employee by email
        const employee = await this.getEmployeeByEmail(email);
        
        if (!employee) {
          notFound.push(`Row ${i + 2}: Employee not found for ${email}`);
          continue;
        }
        
        // Update employee with timesheet link
        employee.timesheetLink = timesheetLink;
        employee.lastUpdated = new Date().toISOString();
        
        await this.saveEmployee(employee);
        updated.push(employee);
      }
      
      // Update metadata
      await this.saveMetadata('timesheets_upload', {
        uploadedBy: uploadedBy,
        uploadedAt: new Date().toISOString(),
        rowCount: updated.length,
        notFoundCount: notFound.length,
        errorCount: errors.length
      });
      
      console.log(`✅ Updated ${updated.length} timesheets`);
      
      return {
        success: true,
        updated: updated.length,
        notFound: notFound,
        errors: errors
      };
      
    } catch (error) {
      console.error('❌ Error importing timesheets CSV:', error);
      return {
        success: false,
        error: error.message,
        updated: 0,
        errors: [error.message]
      };
    }
  }

  // ==========================================
  // DATA STORAGE & RETRIEVAL
  // ==========================================

  async saveEmployees(employees) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['employees'], 'readwrite');
      const store = transaction.objectStore('employees');
      
      let savedCount = 0;
      
      employees.forEach(employee => {
        const request = store.put(employee);
        request.onsuccess = () => savedCount++;
      });
      
      transaction.oncomplete = () => {
        console.log(`✅ Saved ${savedCount} employees`);
        resolve(savedCount);
      };
      
      transaction.onerror = () => {
        console.error('❌ Error saving employees');
        reject(transaction.error);
      };
    });
  }

  async saveEmployee(employee) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['employees'], 'readwrite');
      const store = transaction.objectStore('employees');
      
      const request = store.put(employee);
      
      request.onsuccess = () => resolve(employee);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllEmployees() {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['employees'], 'readonly');
      const store = transaction.objectStore('employees');
      
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getEmployeeByEmail(email) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['employees'], 'readonly');
      const store = transaction.objectStore('employees');
      
      const request = store.get(email.toLowerCase());
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async saveMetadata(key, value) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      
      const request = store.put({ key, ...value, timestamp: new Date().toISOString() });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getMetadata(key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // ==========================================
  // CELEBRATIONS & TIMESHEETS QUERIES
  // ==========================================

  async getCelebrations() {
    const employees = await this.getAllEmployees();
    
    const celebrations = {
      birthdays: [],
      anniversaries: []
    };
    
    employees.forEach(emp => {
      if (emp.birthday) {
        celebrations.birthdays.push({
          name: emp.name,
          email: emp.email,
          date: new Date(emp.birthday),
          department: emp.department
        });
      }
      
      if (emp.workAnniversary) {
        celebrations.anniversaries.push({
          name: emp.name,
          email: emp.email,
          date: new Date(emp.workAnniversary),
          department: emp.department
        });
      }
    });
    
    return celebrations;
  }

  async getAllTimesheets() {
    const employees = await this.getAllEmployees();
    
    return employees
      .filter(emp => emp.timesheetLink)
      .map(emp => ({
        name: emp.name,
        email: emp.email,
        timesheetLink: emp.timesheetLink,
        department: emp.department
      }));
  }

  async getUserTimesheet(email) {
    const employee = await this.getEmployeeByEmail(email);
    
    if (!employee || !employee.timesheetLink) {
      return null;
    }
    
    return {
      name: employee.name,
      email: employee.email,
      timesheetLink: employee.timesheetLink
    };
  }

  async hasData() {
    const employees = await this.getAllEmployees();
    return employees.length > 0;
  }
}

// Create singleton instance
const dataManager = new DataManager();

export default dataManager;