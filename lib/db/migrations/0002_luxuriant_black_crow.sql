DROP INDEX "url_alias_idx";--> statement-breakpoint
DROP INDEX "url_userId_idx";--> statement-breakpoint
CREATE INDEX "url_userId_createdAt_idx" ON "url" USING btree ("user_id","created_at");