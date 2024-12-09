CREATE TABLE IF NOT EXISTS "projects"
(
    "id"
    serial
    PRIMARY
    KEY
    NOT
    NULL,
    "user_id"
    integer
    NOT
    NULL,
    "title"
    text
    NOT
    NULL,
    "description"
    text,
    "color"
    text
    DEFAULT
    '#000000',
    "created_at"
    timestamp
    DEFAULT
    now
(
) NOT NULL,
    "updated_at" timestamp DEFAULT now
(
) NOT NULL
    );
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "projects"
    ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
