import { pool } from "../config/mysql.js";

async function initializeDatabase() {
  try {
    console.log("Connecting to MySQL...");

    const connection = await pool.getConnection();

    try {
      await connection.ping();

      console.log("MySQL connected");
      console.log("Creating database tables...");

      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('candidate', 'employer') NOT NULL,
          auth_provider ENUM('local', 'google', 'github')
            NOT NULL DEFAULT 'local',
          provider_id VARCHAR(255) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

          PRIMARY KEY (id),

          UNIQUE KEY uq_users_email (email),

          UNIQUE KEY uq_provider_identity (
            auth_provider,
            provider_id
          )
        )
      `);

      console.log("✓ users table ready");

      await connection.query(`
        CREATE TABLE IF NOT EXISTS companies (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          employer_id INT UNSIGNED NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT NULL,
          website VARCHAR(500) NULL,
          location VARCHAR(255) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ON UPDATE CURRENT_TIMESTAMP,

          PRIMARY KEY (id),

          UNIQUE KEY uq_company_employer (
            employer_id
          ),

          CONSTRAINT fk_company_employer
            FOREIGN KEY (employer_id)
            REFERENCES users(id)
            ON DELETE CASCADE
        )
      `);

      console.log("✓ companies table ready");

      await connection.query(`
        CREATE TABLE IF NOT EXISTS jobs (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          employer_id INT UNSIGNED NOT NULL,
          company_id INT UNSIGNED NULL,

          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,

          location VARCHAR(255) NULL,
          employment_type VARCHAR(100) NULL,
          experience_level VARCHAR(100) NULL,

          skills JSON NULL,

          status ENUM('open', 'closed')
            NOT NULL DEFAULT 'open',

          source VARCHAR(50)
            NOT NULL DEFAULT 'hiresense',

          external_job_id VARCHAR(255) NULL,

          external_url TEXT NULL,

          is_external BOOLEAN
            NOT NULL DEFAULT FALSE,

          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ON UPDATE CURRENT_TIMESTAMP,

          PRIMARY KEY (id),

          UNIQUE KEY unique_external_job (
            source,
            external_job_id
          ),

          KEY idx_jobs_employer (
            employer_id
          ),

          KEY idx_jobs_company (
            company_id
          ),

          CONSTRAINT fk_job_employer
            FOREIGN KEY (employer_id)
            REFERENCES users(id)
            ON DELETE CASCADE,

          CONSTRAINT fk_job_company
            FOREIGN KEY (company_id)
            REFERENCES companies(id)
            ON DELETE SET NULL
        )
      `);

      console.log("✓ jobs table ready");

      await connection.query(`
        CREATE TABLE IF NOT EXISTS applications (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT,

          job_id INT UNSIGNED NOT NULL,

          candidate_id INT UNSIGNED NOT NULL,

          status ENUM(
            'applied',
            'shortlisted',
            'rejected',
            'hired'
          )
          NOT NULL DEFAULT 'applied',

          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ON UPDATE CURRENT_TIMESTAMP,

          PRIMARY KEY (id),

          UNIQUE KEY uq_application (
            job_id,
            candidate_id
          ),

          KEY idx_application_candidate (
            candidate_id
          ),

          CONSTRAINT fk_application_job
            FOREIGN KEY (job_id)
            REFERENCES jobs(id)
            ON DELETE CASCADE,

          CONSTRAINT fk_application_candidate
            FOREIGN KEY (candidate_id)
            REFERENCES users(id)
            ON DELETE CASCADE
        )
      `);

      console.log("✓ applications table ready");

      await connection.query(`
        CREATE TABLE IF NOT EXISTS refresh_tokens (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

          user_id INT UNSIGNED NOT NULL,

          token_hash CHAR(64) NOT NULL,

          expires_at DATETIME NOT NULL,

          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

          revoked_at DATETIME NULL,

          PRIMARY KEY (id),

          UNIQUE KEY uq_refresh_token_hash (
            token_hash
          ),

          KEY idx_refresh_token_user (
            user_id
          ),

          CONSTRAINT fk_refresh_token_user
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
        )
      `);

      console.log("✓ refresh_tokens table ready");

      await connection.query(`
        CREATE TABLE IF NOT EXISTS oauth_codes (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

          code_hash CHAR(64) NOT NULL,

          user_id INT UNSIGNED NOT NULL,

          role ENUM('candidate', 'employer')
            NOT NULL,

          expires_at DATETIME NOT NULL,

          used_at DATETIME NULL,

          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

          PRIMARY KEY (id),

          UNIQUE KEY uq_oauth_code_hash (
            code_hash
          ),

          KEY idx_oauth_code_expires (
            expires_at
          ),

          CONSTRAINT fk_oauth_code_user
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
        )
      `);

      console.log("✓ oauth_codes table ready");

      console.log("");
      console.log("Database initialized successfully!");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(
      "Database initialization failed:",
      error.message
    );

    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

initializeDatabase();