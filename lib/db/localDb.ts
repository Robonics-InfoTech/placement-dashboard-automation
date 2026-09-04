import Dexie, { type Table } from "dexie";
import "dexie-export-import";

// Define TypeScript interfaces for our local tables
export interface LocalJob {
  id: string;
  title: string;
  description: string;
  employer_id: string;
  status: string;
  application_deadline: string;
  created_at: string;
  updated_at: string;
  is_pending_sync?: boolean;
}

export interface LocalApplication {
  id: string;
  job_id: string;
  student_id: string;
  application_status: string;
  applied_at: string;
  is_pending_sync?: boolean;
}

export interface LocalProfile {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  updated_at: string;
  is_pending_sync?: boolean;
}

export interface LocalDrive {
  id: string;
  employer_id: string;
  drive_name: string;
  drive_date: string;
  status: string;
  drive_mode: string;
  is_pending_sync?: boolean;
}

export class PlacementDatabase extends Dexie {
  jobs!: Table<LocalJob, string>;
  applications!: Table<LocalApplication, string>;
  profiles!: Table<LocalProfile, string>;
  drives!: Table<LocalDrive, string>;

  constructor() {
    super("PlacementDatabase");
    
    // Schema definition for IndexedDB
    // Using '&' for primary key (id) and indexing other frequent lookup keys
    this.version(1).stores({
      jobs: "&id, employer_id, status, is_pending_sync",
      applications: "&id, job_id, student_id, application_status, is_pending_sync",
      profiles: "&id, user_id, role, is_pending_sync",
      drives: "&id, employer_id, status, is_pending_sync"
    });
  }

  /**
   * Helper function to export the database to a Blob.
   * Can be saved as a JSON file.
   */
  async exportDatabase(): Promise<Blob> {
    return await this.export();
  }

  /**
   * Helper function to import the database from a Blob.
   * Merges data with existing data, or overwrites based on options.
   */
  async importDatabase(blob: Blob): Promise<void> {
    await this.import(blob, {
      overwriteValues: true,
      clearTablesBeforeImport: false,
    });
  }
}

// Export a singleton instance of the local database
export const localDb = new PlacementDatabase();
