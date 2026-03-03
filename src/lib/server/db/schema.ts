import { pgTable, uuid, varchar, integer, boolean, timestamp, text, pgEnum, unique } from "drizzle-orm/pg-core";

// Enums matching schema
export const matchStatusEnum = pgEnum("match_status", ["SCHEDULED", "ONGOING", "FINISHED", "CANCELED"]);

export const classes = pgTable("classes", {
    id: uuid("id").primaryKey().defaultRandom(),
    classNumber: integer("class_number").notNull().unique(),
});

export const sports = pgTable("sports", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name").notNull(),
    slug: varchar("slug").notNull().unique(),
    minPlayers: integer("min_players").notNull(),
    maxPlayers: integer("max_players").notNull(),
    displayOrder: integer("display_order").notNull().default(0),
});

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    classId: uuid("class_id").references(() => classes.id),

    // Auth & Profile
    authId: varchar("auth_id").unique(),
    email: varchar("email").unique(),
    studentNumber: varchar("student_number").notNull().unique(),
    name: varchar("name"),
    phoneNumber: varchar("phone_number"),

    // Roles
    isProctor: boolean("is_proctor").default(false),
    isManager: boolean("is_manager").default(false),
    isReferee: boolean("is_referee").default(false),
    isAdmin: boolean("is_admin").default(false),

    // Agreements
    agreedPrivacy: boolean("agreed_privacy").default(false),
    agreedRules: boolean("agreed_rules").default(false),

    createdAt: timestamp("created_at").defaultNow(),
});

export const rosters = pgTable("rosters", {
    id: uuid("id").primaryKey().defaultRandom(),
    classId: uuid("class_id").references(() => classes.id).notNull(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    sportId: uuid("sport_id").references(() => sports.id).notNull(),
}, (t) => [
    unique().on(t.userId, t.sportId)
]);

export const schedules = pgTable("schedules", {
    id: uuid("id").primaryKey().defaultRandom(),
    sportId: uuid("sport_id").references(() => sports.id).notNull(),
    startTime: timestamp("start_time").notNull(),
    isAvailable: boolean("is_available").default(true),
});

export const registers = pgTable("registers", {
    id: uuid("id").primaryKey().defaultRandom(),
    scheduleId: uuid("schedule_id").references(() => schedules.id).notNull(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    classId: uuid("class_id").references(() => classes.id).notNull(),
    isAvailable: boolean("is_available").default(true),
});

export const matches = pgTable("matches", {
    id: uuid("id").primaryKey().defaultRandom(),
    scheduleId: uuid("schedule_id").references(() => schedules.id).unique(),
    sportId: uuid("sport_id").references(() => sports.id).notNull(),
    classAId: uuid("class_a_id").references(() => classes.id).notNull(),
    classBId: uuid("class_b_id").references(() => classes.id).notNull(),
    winnerClassId: uuid("winner_class_id").references(() => classes.id),
    refereeId: uuid("referee_id").references(() => users.id),
    managerId: uuid("manager_id").references(() => users.id),

    name: varchar("name"),
    location: varchar("location"),
    status: matchStatusEnum("status").default("SCHEDULED"),
    scoreA: integer("score_a").default(0),
    scoreB: integer("score_b").default(0),
    matchNotes: text("match_notes"),
});
