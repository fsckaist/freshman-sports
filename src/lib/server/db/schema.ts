import { pgTable, uuid, varchar, integer, boolean, timestamp, text, pgEnum, unique } from "drizzle-orm/pg-core";

// Enums matching schema
export const matchStatusEnum = pgEnum("match_status", ["PENDING_SCHEDULE", "SCHEDULED", "ONGOING", "FINISHED", "CANCELED"]);
export const bracketStatusEnum = pgEnum("bracket_status", ["win", "lose", "default"]);

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
    periodStart: timestamp("period_start"),
    periodEnd: timestamp("period_end"),
    displayOrder: integer("display_order").notNull().default(0),

    // Round-1 schedule window (per-sport)
    round1SelectionStart: timestamp("round1_selection_start"),
    round1SelectionEnd: timestamp("round1_selection_end"),
    round1Deadline: timestamp("round1_deadline"),

    // Daily scheduling configuration
    dailyStartTime: varchar("daily_start_time").default("10:00"), // e.g., "10:00"
    dailyEndTime: varchar("daily_end_time").default("16:00"),   // e.g., "16:00"
    timeSlotInterval: integer("time_slot_interval").default(60), // in minutes
    maxParallelMatches: integer("max_parallel_matches").default(1),
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
    checkedInAt: timestamp("checked_in_at"),
});

export const matches = pgTable("matches", {
    id: uuid("id").primaryKey().defaultRandom(),
    scheduleId: uuid("schedule_id").references(() => schedules.id),
    sportId: uuid("sport_id").references(() => sports.id).notNull(),
    classAId: uuid("class_a_id").references(() => classes.id),
    classBId: uuid("class_b_id").references(() => classes.id),
    winnerClassId: uuid("winner_class_id").references(() => classes.id),
    refereeId: uuid("referee_id").references(() => users.id),
    managerId: uuid("manager_id").references(() => users.id),

    name: varchar("name"),
    location: varchar("location"),
    status: matchStatusEnum("status").default("PENDING_SCHEDULE"),
    isVerified: boolean("is_verified").default(false),
    scoreA: integer("score_a").default(0),
    scoreB: integer("score_b").default(0),
    matchNotes: text("match_notes"),
    // Schedule window: when can teams vote on the next match time?
    scheduledAt: timestamp("scheduled_at"),               // actual confirmed match date/time
    scheduleWindowStart: timestamp("schedule_window_start"),
    scheduleWindowEnd: timestamp("schedule_window_end"),
    scheduleWindowDeadline: timestamp("schedule_window_deadline"), // deadline for voting
});

export const tournament_brackets = pgTable("tournament_brackets", {
    id: uuid("id").primaryKey().defaultRandom(),
    sportId: uuid("sport_id").references(() => sports.id).notNull(),
    round: integer("round").notNull(),
    position: integer("position").notNull(),
    classId: uuid("class_id").references(() => classes.id),
    matchId: uuid("match_id").references(() => matches.id),
    isEliminatedSlot: boolean("is_eliminated_slot").default(false),
    status: bracketStatusEnum("status").default("default").notNull(),
});

export const eventStateEnum = pgEnum("event_state", ["REGISTRATION", "ONGOING", "COMPLETED"]);

export const system_config = pgTable("system_config", {
    id: uuid("id").primaryKey().defaultRandom(),
    eventState: eventStateEnum("event_state").notNull().default("REGISTRATION"),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export type EventState = (typeof eventStateEnum.enumValues)[number];

