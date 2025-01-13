CREATE TABLE IF NOT EXISTS "user_balance"
(
    "id"
    serial
    PRIMARY
    KEY
    NOT
    NULL,
    "balance"
    integer
    DEFAULT
    0
);
--> statement-breakpoint
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
    "e2e_tests"
    text,
    "unit_tests"
    text,
    "mdx_docs"
    text,
    "ts_docs"
    text,
    "is_favorite"
    boolean
    DEFAULT
    false,
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
CREATE TABLE IF NOT EXISTS "user_credentials"
(
    "id"
    serial
    PRIMARY
    KEY
    NOT
    NULL,
    "user_id"
    integer,
    "name"
    text
    NOT
    NULL,
    "value"
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
) NOT NULL,
    CONSTRAINT "credentials_user_id_name_unique" UNIQUE
(
    "user_id",
    "name"
)
    );
--> statement-breakpoint
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
CREATE TABLE IF NOT EXISTS "profile"
(
    "id"
    serial
    PRIMARY
    KEY
    NOT
    NULL,
    "age"
    integer,
    "biography"
    text,
    "user_id"
    integer,
    "avatar_url"
    text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"
(
    "id"
    serial
    PRIMARY
    KEY
    NOT
    NULL,
    "email"
    text,
    "username"
    text,
    "password"
    text
    NOT
    NULL,
    "refresh_token"
    text,
    CONSTRAINT
    "users_email_unique"
    UNIQUE
(
    "email"
)
    );
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "execution_logs"
(
    "id"
    serial
    PRIMARY
    KEY
    NOT
    NULL,
    "execution_phase_id"
    integer
    NOT
    NULL,
    "log_level"
    text
    NOT
    NULL,
    "message"
    text
    NOT
    NULL,
    "timestamp"
    timestamp
    DEFAULT
    now
(
) NOT NULL
    );
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "execution_phases"
(
    "id"
    serial
    PRIMARY
    KEY
    NOT
    NULL,
    "workflow_execution_id"
    integer
    NOT
    NULL,
    "user_id"
    integer
    NOT
    NULL,
    "status"
    text
    NOT
    NULL,
    "number"
    integer
    NOT
    NULL,
    "node"
    text
    NOT
    NULL,
    "name"
    text
    NOT
    NULL,
    "inputs"
    text,
    "outputs"
    text,
    "temp"
    text,
    "credits_cost"
    integer,
    "started_at"
    timestamp,
    "completed_at"
    timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow_executions"
(
    "id"
    serial
    PRIMARY
    KEY
    NOT
    NULL,
    "workflow_id"
    integer
    NOT
    NULL,
    "user_id"
    integer
    NOT
    NULL,
    "trigger"
    text
    NOT
    NULL,
    "status"
    text
    NOT
    NULL,
    "definition"
    text
    DEFAULT
    '{}'
    NOT
    NULL,
    "credits_consumed"
    integer
    DEFAULT
    0,
    "created_at"
    timestamp
    DEFAULT
    now
(
) NOT NULL,
    "started_at" timestamp,
    "completed_at" timestamp
    );
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflows"
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
    "name"
    text
    NOT
    NULL,
    "description"
    text,
    "status"
    text
    DEFAULT
    'DRAFT',
    "definition"
    text
    DEFAULT
    '{}'
    NOT
    NULL,
    "execution_plan"
    text,
    "credits_cost"
    integer
    DEFAULT
    0,
    "last_run_at"
    timestamp,
    "last_run_id"
    text,
    "last_run_status"
    text,
    "next_run_at"
    timestamp,
    "created_at"
    timestamp
    DEFAULT
    now
(
) NOT NULL,
    "updated_at" timestamp DEFAULT now
(
) NOT NULL,
    CONSTRAINT "workflows_user_id_name_unique" UNIQUE
(
    "user_id",
    "name"
)
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
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "user_credentials"
    ADD CONSTRAINT "user_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "projects"
    ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "profile"
    ADD CONSTRAINT "profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "execution_logs"
    ADD CONSTRAINT "execution_logs_execution_phase_id_execution_phases_id_fk" FOREIGN KEY ("execution_phase_id") REFERENCES "public"."execution_phases" ("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "execution_phases"
    ADD CONSTRAINT "execution_phases_workflow_execution_id_workflow_executions_id_fk" FOREIGN KEY ("workflow_execution_id") REFERENCES "public"."workflow_executions" ("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "execution_phases"
    ADD CONSTRAINT "execution_phases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "workflow_executions"
    ADD CONSTRAINT "workflow_executions_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows" ("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "workflow_executions"
    ADD CONSTRAINT "workflow_executions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "workflows"
    ADD CONSTRAINT "workflows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_index" ON "user_credentials" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "execution_phase_id_index" ON "execution_logs" USING btree ("execution_phase_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "execution_phases" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_execution_id_index" ON "execution_phases" USING btree ("workflow_execution_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "executions_user_id_idx" ON "workflow_executions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflows_user_id_idx" ON "workflows" USING btree ("user_id");