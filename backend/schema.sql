-- Cloudflare D1 Database Schema Migration Script for ThreadPulse

CREATE TABLE IF NOT EXISTS User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS LinkedAccount (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT DEFAULT '💻',
    persona TEXT DEFAULT '개발자 구루',
    persona_preset TEXT DEFAULT 'tech_guru',
    access_token TEXT NOT NULL,
    token_status TEXT DEFAULT 'valid',
    role TEXT DEFAULT 'booster',
    expires_in TEXT DEFAULT '60일 남음',
    aggro_level INTEGER DEFAULT 2,
    emoji_preference TEXT DEFAULT 'normal',
    line_breaks TEXT DEFAULT 'normal',
    forbidden_keywords TEXT DEFAULT '',
    required_keywords TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS Campaign (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    text_json TEXT NOT NULL,
    time TEXT NOT NULL,
    persona TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled',
    published_post_id TEXT,
    error_message TEXT
);
