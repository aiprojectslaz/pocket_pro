-- ============================================================
-- Pocket Pro – Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor (Project → SQL Editor)
-- ============================================================

-- quizzes (defined first because chapters + procedures reference it)
CREATE TABLE IF NOT EXISTS quizzes (
  id          BIGSERIAL PRIMARY KEY,
  quiz_name   TEXT,
  quiz_type   TEXT CHECK (quiz_type IN ('chapter', 'procedure', 'definition-based')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- chapters
CREATE TABLE IF NOT EXISTS chapters (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT,
  description TEXT,
  quiz_id     BIGINT REFERENCES quizzes(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- procedures
CREATE TABLE IF NOT EXISTS procedures (
  id                    BIGSERIAL PRIMARY KEY,
  procedure_number      TEXT NOT NULL,
  name                  TEXT NOT NULL,
  issue_date            DATE,
  status                TEXT,
  replaces_date         DATE,
  chapter_id            BIGINT REFERENCES chapters(id) ON DELETE SET NULL,
  rationale             TEXT,
  supervision           TEXT,
  procedure_info        JSONB,   -- Strapi blocks rich-text stored as JSONB
  governing_authority   JSONB,
  associated_governance JSONB,
  quiz_id               BIGINT REFERENCES quizzes(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  published_at          TIMESTAMPTZ DEFAULT NOW()
);

-- definitions
CREATE TABLE IF NOT EXISTS definitions (
  id          BIGSERIAL PRIMARY KEY,
  term        TEXT NOT NULL UNIQUE,
  definition  JSONB NOT NULL,   -- Strapi blocks rich-text
  quiz_id     BIGINT REFERENCES quizzes(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- procedure_definitions  (M:M  procedures ↔ definitions)
CREATE TABLE IF NOT EXISTS procedure_definitions (
  procedure_id  BIGINT REFERENCES procedures(id)  ON DELETE CASCADE,
  definition_id BIGINT REFERENCES definitions(id) ON DELETE CASCADE,
  PRIMARY KEY (procedure_id, definition_id)
);

-- sub_procedures
CREATE TABLE IF NOT EXISTS sub_procedures (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  description  JSONB NOT NULL,  -- Strapi blocks rich-text
  procedure_id BIGINT REFERENCES procedures(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  published_at  TIMESTAMPTZ DEFAULT NOW()
);

-- main_roles
CREATE TABLE IF NOT EXISTS main_roles (
  id           BIGSERIAL PRIMARY KEY,
  role_title   TEXT,
  description  JSONB,            -- Strapi blocks rich-text
  procedure_id BIGINT REFERENCES procedures(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  published_at  TIMESTAMPTZ DEFAULT NOW()
);

-- procedure_roles  (sub-roles within sub_procedures)
CREATE TABLE IF NOT EXISTS procedure_roles (
  id                BIGSERIAL PRIMARY KEY,
  role_title        TEXT,
  description       JSONB,       -- Strapi blocks rich-text
  sub_procedure_id  BIGINT REFERENCES sub_procedures(id) ON DELETE CASCADE,
  procedure_number  TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  published_at       TIMESTAMPTZ DEFAULT NOW()
);

-- appendices
CREATE TABLE IF NOT EXISTS appendices (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  title         TEXT,
  description   JSONB,           -- Strapi blocks rich-text
  status        TEXT,
  issue_date    DATE NOT NULL,
  replaces_date DATE,
  procedure_id  BIGINT REFERENCES procedures(id) ON DELETE CASCADE,
  media_urls    JSONB,           -- Array of Supabase Storage URLs
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  published_at   TIMESTAMPTZ DEFAULT NOW()
);

-- questions
CREATE TABLE IF NOT EXISTS questions (
  id             BIGSERIAL PRIMARY KEY,
  question_text  TEXT NOT NULL,
  question_type  TEXT CHECK (question_type IN ('multiple-choice', 'true/false')) NOT NULL,
  procedure_ref_id BIGINT REFERENCES procedures(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  published_at    TIMESTAMPTZ DEFAULT NOW()
);

-- answer_options  (child of questions)
CREATE TABLE IF NOT EXISTS answer_options (
  id          BIGSERIAL PRIMARY KEY,
  question_id BIGINT REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct  BOOLEAN DEFAULT FALSE
);

-- quiz_questions  (M:M  quizzes ↔ questions)
CREATE TABLE IF NOT EXISTS quiz_questions (
  quiz_id     BIGINT REFERENCES quizzes(id)    ON DELETE CASCADE,
  question_id BIGINT REFERENCES questions(id)  ON DELETE CASCADE,
  PRIMARY KEY (quiz_id, question_id)
);

-- user_bookmarks  (replaces the Strapi bookmarks collection)
-- Uses Supabase auth.users so no manual user table needed
CREATE TABLE IF NOT EXISTS user_bookmarks (
  user_id      UUID   REFERENCES auth.users(id) ON DELETE CASCADE,
  procedure_id BIGINT REFERENCES procedures(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, procedure_id)
);

-- Static single-type content pages
CREATE TABLE IF NOT EXISTS about (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT,
  description JSONB,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS privacy (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT,
  description JSONB,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS terms_conditions (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT,
  description JSONB,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_us (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT,
  description JSONB,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE procedures        ENABLE ROW LEVEL SECURITY;
ALTER TABLE definitions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_procedures    ENABLE ROW LEVEL SECURITY;
ALTER TABLE main_roles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_roles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE appendices        ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters          ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_options    ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE about             ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy           ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms_conditions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_us        ENABLE ROW LEVEL SECURITY;

-- Public read for all content tables
CREATE POLICY "public read" ON procedures        FOR SELECT USING (true);
CREATE POLICY "public read" ON definitions       FOR SELECT USING (true);
CREATE POLICY "public read" ON sub_procedures    FOR SELECT USING (true);
CREATE POLICY "public read" ON main_roles        FOR SELECT USING (true);
CREATE POLICY "public read" ON procedure_roles   FOR SELECT USING (true);
CREATE POLICY "public read" ON appendices        FOR SELECT USING (true);
CREATE POLICY "public read" ON chapters          FOR SELECT USING (true);
CREATE POLICY "public read" ON quizzes           FOR SELECT USING (true);
CREATE POLICY "public read" ON questions         FOR SELECT USING (true);
CREATE POLICY "public read" ON answer_options    FOR SELECT USING (true);
CREATE POLICY "public read" ON procedure_definitions FOR SELECT USING (true);
CREATE POLICY "public read" ON quiz_questions    FOR SELECT USING (true);
CREATE POLICY "public read" ON about             FOR SELECT USING (true);
CREATE POLICY "public read" ON privacy           FOR SELECT USING (true);
CREATE POLICY "public read" ON terms_conditions  FOR SELECT USING (true);
CREATE POLICY "public read" ON contact_us        FOR SELECT USING (true);

-- Bookmarks: authenticated users can only see/modify their own
CREATE POLICY "own bookmarks select" ON user_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "own bookmarks insert" ON user_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own bookmarks delete" ON user_bookmarks
  FOR DELETE USING (auth.uid() = user_id);
