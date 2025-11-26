ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "user_google_id_index" ON "users" USING btree ("google_id");