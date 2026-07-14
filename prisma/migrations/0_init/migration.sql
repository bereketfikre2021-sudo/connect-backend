-- Connect Digitals — Initial Migration
-- Generated for Neon PostgreSQL

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- ADMINS
-- ─────────────────────────────────────────────
CREATE TABLE "admins" (
  "id"            TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "email"         TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "name"          TEXT NOT NULL,
  "role"          TEXT NOT NULL DEFAULT 'admin',
  "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- ─────────────────────────────────────────────
-- HERO SLIDES
-- ─────────────────────────────────────────────
CREATE TABLE "hero_slides" (
  "id"                TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "background_image"  TEXT NOT NULL,
  "image_public_id"   TEXT,
  "headline"          TEXT,
  "subheadline"       TEXT,
  "button_text"       TEXT,
  "button_url"        TEXT,
  "alt_text"          TEXT,
  "auto_slide_delay"  INTEGER NOT NULL DEFAULT 4000,
  "display_order"     INTEGER NOT NULL DEFAULT 0,
  "published"         BOOLEAN NOT NULL DEFAULT true,
  "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"        TIMESTAMP(3) NOT NULL,
  CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

-- ─────────────────────────────────────────────
-- PORTFOLIO PROJECTS
-- ─────────────────────────────────────────────
CREATE TABLE "portfolio_projects" (
  "id"                   TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "thumbnail"            TEXT NOT NULL,
  "thumbnail_public_id"  TEXT,
  "gallery"              TEXT[] NOT NULL DEFAULT '{}',
  "gallery_public_ids"   TEXT[] NOT NULL DEFAULT '{}',
  "title"                TEXT NOT NULL,
  "slug"                 TEXT NOT NULL,
  "category"             TEXT NOT NULL,
  "client"               TEXT,
  "industry"             TEXT,
  "year"                 INTEGER,
  "short_description"    TEXT,
  "full_description"     TEXT,
  "services_provided"    TEXT[] NOT NULL DEFAULT '{}',
  "technologies"         TEXT[] NOT NULL DEFAULT '{}',
  "project_url"          TEXT,
  "alt_text"             TEXT,
  "case_study_challenge" TEXT,
  "case_study_solution"  TEXT,
  "case_study_results"   JSONB,
  "featured"             BOOLEAN NOT NULL DEFAULT false,
  "published"            BOOLEAN NOT NULL DEFAULT true,
  "display_order"        INTEGER NOT NULL DEFAULT 0,
  "seo_title"            TEXT,
  "seo_description"      TEXT,
  "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"           TIMESTAMP(3) NOT NULL,
  CONSTRAINT "portfolio_projects_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "portfolio_projects_slug_key" ON "portfolio_projects"("slug");

-- ─────────────────────────────────────────────
-- CASE STUDIES
-- ─────────────────────────────────────────────
CREATE TABLE "case_studies" (
  "id"                 TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "hero_image"         TEXT NOT NULL,
  "hero_public_id"     TEXT,
  "gallery"            TEXT[] NOT NULL DEFAULT '{}',
  "gallery_public_ids" TEXT[] NOT NULL DEFAULT '{}',
  "title"              TEXT NOT NULL,
  "slug"               TEXT NOT NULL,
  "client"             TEXT NOT NULL,
  "industry"           TEXT,
  "overview"           TEXT,
  "challenge"          TEXT[] NOT NULL DEFAULT '{}',
  "research"           TEXT,
  "strategy"           TEXT,
  "design_process"     TEXT,
  "solution"           TEXT,
  "role"               TEXT[] NOT NULL DEFAULT '{}',
  "results"            TEXT,
  "conclusion"         TEXT,
  "published"          BOOLEAN NOT NULL DEFAULT true,
  "display_order"      INTEGER NOT NULL DEFAULT 0,
  "seo_title"          TEXT,
  "seo_description"    TEXT,
  "created_at"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"         TIMESTAMP(3) NOT NULL,
  CONSTRAINT "case_studies_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "case_studies_slug_key" ON "case_studies"("slug");

-- ─────────────────────────────────────────────
-- BLOG POSTS
-- ─────────────────────────────────────────────
CREATE TABLE "blog_posts" (
  "id"              TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "featured_image"  TEXT,
  "image_public_id" TEXT,
  "title"           TEXT NOT NULL,
  "slug"            TEXT NOT NULL,
  "excerpt"         TEXT,
  "content"         TEXT NOT NULL,
  "category"        TEXT,
  "tags"            TEXT[] NOT NULL DEFAULT '{}',
  "author"          TEXT NOT NULL DEFAULT 'Connect Digitals',
  "reading_time"    INTEGER,
  "status"          TEXT NOT NULL DEFAULT 'draft',
  "published"       BOOLEAN NOT NULL DEFAULT false,
  "published_at"    TIMESTAMP(3),
  "display_order"   INTEGER NOT NULL DEFAULT 0,
  "seo_title"       TEXT,
  "seo_description" TEXT,
  "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      TIMESTAMP(3) NOT NULL,
  CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- ─────────────────────────────────────────────
-- TRUSTED BRANDS
-- ─────────────────────────────────────────────
CREATE TABLE "trusted_brands" (
  "id"           TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "logo"         TEXT NOT NULL,
  "logo_public_id" TEXT,
  "name"         TEXT NOT NULL,
  "website"      TEXT,
  "alt_text"     TEXT,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "published"    BOOLEAN NOT NULL DEFAULT true,
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "trusted_brands_pkey" PRIMARY KEY ("id")
);

-- ─────────────────────────────────────────────
-- TESTIMONIALS
-- ─────────────────────────────────────────────
CREATE TABLE "testimonials" (
  "id"             TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "client_photo"   TEXT,
  "photo_public_id" TEXT,
  "client_name"    TEXT NOT NULL,
  "position"       TEXT,
  "company"        TEXT,
  "review"         TEXT NOT NULL,
  "rating"         INTEGER NOT NULL DEFAULT 5,
  "href"           TEXT,
  "featured"       BOOLEAN NOT NULL DEFAULT false,
  "display_order"  INTEGER NOT NULL DEFAULT 0,
  "published"      BOOLEAN NOT NULL DEFAULT true,
  "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- ─────────────────────────────────────────────
-- SETTINGS
-- ─────────────────────────────────────────────
CREATE TABLE "settings" (
  "id"               TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "website_name"     TEXT NOT NULL DEFAULT 'Connect Digitals',
  "logo"             TEXT,
  "logo_public_id"   TEXT,
  "favicon"          TEXT,
  "favicon_public_id" TEXT,
  "seo_title"        TEXT,
  "seo_description"  TEXT,
  "seo_keywords"     TEXT,
  "social_facebook"  TEXT,
  "social_instagram" TEXT,
  "social_twitter"   TEXT,
  "social_linkedin"  TEXT,
  "social_whatsapp"  TEXT,
  "contact_email"    TEXT,
  "contact_phone"    TEXT,
  "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       TIMESTAMP(3) NOT NULL,
  CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- Prisma migrations table
INSERT INTO "_prisma_migrations" ("id","checksum","finished_at","migration_name","logs","rolled_back_at","started_at","applied_steps_count")
VALUES ('init','0000000000000000000000000000000000000000000000000000000000000000',CURRENT_TIMESTAMP,'0_init',NULL,NULL,CURRENT_TIMESTAMP,1)
ON CONFLICT DO NOTHING;
