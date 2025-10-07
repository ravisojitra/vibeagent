import { sql, type InferSelectModel } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, integer, pgEnum, jsonb, index, unique, uuid, primaryKey, foreignKey } from "drizzle-orm/pg-core";
import { user } from "../../auth-schema";

// Export auth schema tables for Better Auth
export * from '../../auth-schema';

// Define enums first
export const projectTypeEnum = pgEnum("project_type", ["web", "mobile", "fullstack"]);
export const projectStatusEnum = pgEnum("project_status", ["active", "archived", "deleted"]);
export const projectVisibilityEnum = pgEnum("project_visibility", ["private", "public", "team"]);
export const deploymentStatusEnum = pgEnum("deployment_status", [
    "deploying",
    "ready",
    "error",
    "none"
]);

export const userConfig = pgTable("user_config", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    dodoCustomerId: text("dodo_customer_id").notNull(),
    subscriptionId: text("subscription_id").notNull(),
    credits: integer("credits").notNull(),
    githubRefreshToken: text("github_refresh_token").notNull(),
    githubUsername: text("github_username").notNull(),
    githubTokenExpiresAt: timestamp("github_token_expires_at").notNull(),
    githubInstallationId: text("github_installation_id").notNull()
});

export const projects = pgTable(
    "projects",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        description: text("description"),
        projectType: projectTypeEnum("project_type").notNull().default("web"),
        framework: text("framework"),
        visibility: projectVisibilityEnum("visibility").notNull().default("private"),

        // Sandbox and deployment
        sandboxId: text("sandbox_id"),
        githubOrg: text("github_org"),
        gitRepositoryUrl: text("git_repository_url"),
        gitBranch: text("git_branch"),
        deploymentUrl: text("deployment_url"),
        previewUrl: text("preview_url"),

        // Template related
        isTemplate: boolean("is_template").notNull().default(false),
        thumbnailPath: text("thumbnail_path"),

        // Timestamps
        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        lastDeployedAt: timestamp("last_deployed_at", { withTimezone: true }),

        // Configuration
        metadata: jsonb("metadata").$type<Record<string, any>>().default({}),

        projectContext: text("project_context"),
    },
    (table) => [
        index("projects_id_idx").on(table.id),
        index("projects_user_idx").on(table.userId),
        index("projects_type_idx").on(table.projectType),
        index("projects_is_template_idx").on(table.isTemplate),
        index("projects_created_at_idx").on(table.createdAt),
    ]
);

export const chat = pgTable("Chat", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    projectId: uuid("projectId")
        .notNull()
        .references(() => projects.id),
    commitHash: text("commitHash").notNull(),
    userId: text("userId")
        .notNull()
        .references(() => user.id),
    visibility: projectVisibilityEnum("visibility").notNull().default("private"),
});

export const message = pgTable("Message_v2", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    chatId: uuid("chatId")
        .notNull()
        .references(() => chat.id),
    role: text("role").notNull(),
    parts: jsonb("parts").notNull(),
    attachments: jsonb("attachments").notNull(),
    createdAt: timestamp("createdAt").notNull(),
});

export const stream = pgTable(
    "Stream",
    {
        id: uuid("id").notNull().defaultRandom(),
        chatId: uuid("chatId").notNull(),
        createdAt: timestamp("createdAt").notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.id] }),
        foreignKey({
            columns: [table.chatId],
            foreignColumns: [chat.id],
        }),
    ]
);

export const integrations = pgTable("integrations", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

    // Integration identifier
    slug: text("slug").notNull().unique(), // "gemini", "openai", "twilio", etc.
    name: text("name").notNull(), // "Gemini", "OpenAI", "Twilio"
    description: text("description"),

    // Branding
    logoUrl: text("logo_url"),
    category: text("category"), // "ai", "sms", "email", "payment", "database", etc.

    // What fields this integration needs
    // Example for Gemini: [{ "key": "api_key", "label": "Gemini API Key", "type": "password" }]
    // Example for Twilio: [
    //   { "key": "account_sid", "label": "Account SID", "type": "text" },
    //   { "key": "auth_token", "label": "Auth Token", "type": "password" },
    //   { "key": "from_number", "label": "From Phone Number", "type": "text" }
    // ]
    setupFields: jsonb("setup_fields").$type<{ key: string; label: string; type: string }[]>().notNull(),

    // Store the actual config values
    // For Gemini: { "api_key": "AIza..." }
    // For Twilio: { "account_sid": "ACxx", "auth_token": "xxx", "from_number": "+123" }
    metadata: jsonb("metadata").$type<Record<string, any>>().notNull().default({}),

    // Settings
    isEnabled: boolean("is_enabled").notNull().default(false),

    // Metadata
    documentationUrl: text("documentation_url"),
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
    unique("integrations_slug_idx").on(table.slug),
    index("integrations_category_idx").on(table.category),
]);

export type UserConfig = typeof userConfig.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Integration = typeof integrations.$inferSelect;
export type Chat = InferSelectModel<typeof chat>;
export type DBMessage = InferSelectModel<typeof message>;
export type Stream = InferSelectModel<typeof stream>;
