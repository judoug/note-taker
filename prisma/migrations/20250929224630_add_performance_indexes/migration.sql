-- CreateEnum
CREATE TYPE "public"."TagSource" AS ENUM ('AI', 'MANUAL');

-- CreateEnum
CREATE TYPE "public"."SummaryType" AS ENUM ('BRIEF', 'DETAILED', 'BULLETS');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" "public"."TagSource" NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."note_summaries" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "summaryType" "public"."SummaryType" NOT NULL DEFAULT 'BRIEF',
    "wordCount" INTEGER NOT NULL,
    "originalWordCount" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "note_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_NoteTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NoteTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "public"."users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "notes_userId_idx" ON "public"."notes"("userId");

-- CreateIndex
CREATE INDEX "notes_userId_updatedAt_idx" ON "public"."notes"("userId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "notes_userId_createdAt_idx" ON "public"."notes"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "notes_createdAt_idx" ON "public"."notes"("createdAt");

-- CreateIndex
CREATE INDEX "notes_updatedAt_idx" ON "public"."notes"("updatedAt");

-- CreateIndex
CREATE INDEX "notes_title_idx" ON "public"."notes"("title");

-- CreateIndex
CREATE INDEX "tags_name_idx" ON "public"."tags"("name");

-- CreateIndex
CREATE INDEX "tags_source_idx" ON "public"."tags"("source");

-- CreateIndex
CREATE INDEX "tags_name_source_idx" ON "public"."tags"("name", "source");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "public"."tags"("name");

-- CreateIndex
CREATE INDEX "note_summaries_noteId_idx" ON "public"."note_summaries"("noteId");

-- CreateIndex
CREATE INDEX "note_summaries_summaryType_idx" ON "public"."note_summaries"("summaryType");

-- CreateIndex
CREATE INDEX "note_summaries_createdAt_idx" ON "public"."note_summaries"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "note_summaries_noteId_summaryType_key" ON "public"."note_summaries"("noteId", "summaryType");

-- CreateIndex
CREATE INDEX "_NoteTags_B_index" ON "public"."_NoteTags"("B");

-- AddForeignKey
ALTER TABLE "public"."notes" ADD CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."note_summaries" ADD CONSTRAINT "note_summaries_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "public"."notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_NoteTags" ADD CONSTRAINT "_NoteTags_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_NoteTags" ADD CONSTRAINT "_NoteTags_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
