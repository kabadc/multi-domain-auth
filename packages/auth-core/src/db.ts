import fs from 'node:fs';
import path from 'node:path';

// For this PoC, we are reading the JSON directly.
// We use a relative path trick assuming this runs in apps/* folders.
// A more robust way would be to just put db.json in the auth app itself, 
// but keeping it in auth-core makes it globally available for the PoC.
const dbPath = path.resolve(process.cwd(), '../../packages/auth-core/src/db.json');

export function getUserByEmail(email: string) {
  try {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    return data.users.find((u: any) => u.email === email);
  } catch (error) {
    console.error("Failed to read DB:", error);
    return null;
  }
}

export function getUserById(id: string) {
  try {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    return data.users.find((u: any) => u.id === id);
  } catch (error) {
    return null;
  }
}
