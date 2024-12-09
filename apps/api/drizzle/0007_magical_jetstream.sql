CREATE TABLE IF NOT EXISTS "components"
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
    "project_id"
    integer
    NOT
    NULL,
    "code"
    text
    NOT
    NULL,
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
ALTER TABLE "components"
    ADD CONSTRAINT "components_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "components"
    ADD CONSTRAINT "components_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects" ("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
