ALTER TABLE "news_post"
  ADD COLUMN "hero" TEXT,
  ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
