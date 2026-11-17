-- Run after schema.sql. token_hash now holds the hashed 6-digit OTP.
ALTER TABLE password_reset_tokens
  ADD COLUMN attempts         INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN verified_at      TIMESTAMP,
  ADD COLUMN reset_token_hash TEXT UNIQUE;