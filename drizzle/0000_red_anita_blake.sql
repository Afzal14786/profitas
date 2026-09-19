CREATE TYPE "public"."liquidity_status" AS ENUM('requested', 'processing', 'completed', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."liquidity_type" AS ENUM('sell_match', 'get_credit');--> statement-breakpoint
CREATE TYPE "public"."organization_type" AS ENUM('property_owner', 'property_developer', 'partner');--> statement-breakpoint
CREATE TYPE "public"."partner_type" AS ENUM('bank', 'nbfc', 'institution', 'property_platform');--> statement-breakpoint
CREATE TYPE "public"."property_status" AS ENUM('draft', 'pending_verification', 'verified', 'rejected', 'archived');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
