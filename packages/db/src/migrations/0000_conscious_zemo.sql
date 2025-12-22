CREATE TABLE "appointments" (
	"allergies" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"date_of_appointment" timestamp with time zone NOT NULL,
	"doctor_id" uuid,
	"existing_medical_conditions" text,
	"health_insurance" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"language" text DEFAULT 'english' NOT NULL,
	"meeting_id" integer NOT NULL,
	"meeting_url" text NOT NULL,
	"patient_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"avatar" text NOT NULL,
	"country" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"dob" timestamp with time zone NOT NULL,
	"email" text NOT NULL,
	"email_verified_at" timestamp with time zone,
	"first_name" text NOT NULL,
	"full_name" text NOT NULL,
	"gender" text NOT NULL,
	"google_id" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_suspended" boolean DEFAULT false NOT NULL,
	"last_login_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_name" text NOT NULL,
	"login_retry_count" integer DEFAULT 0 NOT NULL,
	"medical_license" text,
	"password_hash" text,
	"refresh_token_array" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"role" text NOT NULL,
	"specialty" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "diseases" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text NOT NULL,
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "diseases_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"image" text NOT NULL,
	"name" text NOT NULL,
	"precautions" jsonb NOT NULL,
	"symptoms" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "diseases_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_index" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "user_google_id_index" ON "users" USING btree ("google_id");--> statement-breakpoint
CREATE INDEX "diseases_name_index" ON "diseases" USING btree ("name");