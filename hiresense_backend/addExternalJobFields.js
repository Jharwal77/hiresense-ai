import { pool } from "./config/mysql.js";

async function addExternalJobFields() {
  try {
    await pool.query(`
      ALTER TABLE jobs
      ADD COLUMN source VARCHAR(50) NOT NULL DEFAULT 'hiresense',
      ADD COLUMN external_job_id VARCHAR(255) NULL,
      ADD COLUMN external_url TEXT NULL,
      ADD COLUMN is_external BOOLEAN NOT NULL DEFAULT FALSE
    `);

    await pool.query(`
      ALTER TABLE jobs
      ADD UNIQUE KEY unique_external_job (
        source,
        external_job_id
      )
    `);

    console.log("External job fields added successfully");
  } catch (error) {
    console.error(
      "Failed to update jobs table:",
      error.message
    );
  } finally {
    await pool.end();
  }
}

addExternalJobFields();