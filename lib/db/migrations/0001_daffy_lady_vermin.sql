CREATE TABLE "url" (
	"id" serial PRIMARY KEY NOT NULL,
	"alias" varchar(52) NOT NULL,
	"original_url" text NOT NULL,
	"is_custom_alias" boolean DEFAULT false NOT NULL,
	"user_id" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "url_alias_unique" UNIQUE("alias")
);
--> statement-breakpoint
ALTER TABLE "url" ADD CONSTRAINT "url_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "url_alias_idx" ON "url" USING btree ("alias");--> statement-breakpoint
CREATE INDEX "url_userId_idx" ON "url" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "url_expiresAt_idx" ON "url" USING btree ("expires_at");