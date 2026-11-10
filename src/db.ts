import Database from 'better-sqlite3';
import fs from 'node:fs'; import path from 'node:path';
export function openDatabase(file=process.env.DATABASE_PATH||'./data/staff-monitor.sqlite') {
  fs.mkdirSync(path.dirname(path.resolve(file)),{recursive:true}); const db=new Database(file); db.pragma('journal_mode = WAL'); db.pragma('foreign_keys = ON'); migrate(db); return db;
}
function migrate(db:Database.Database) { db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS guild_config(guild_id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS guild_features(guild_id TEXT NOT NULL, feature TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1, PRIMARY KEY(guild_id,feature));
CREATE TABLE IF NOT EXISTS bot_admins(user_id TEXT PRIMARY KEY, permissions TEXT NOT NULL, created_by TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS bot_admin_scopes(user_id TEXT NOT NULL, guild_id TEXT NOT NULL, PRIMARY KEY(user_id,guild_id));
CREATE TABLE IF NOT EXISTS guild_permissions(guild_id TEXT NOT NULL,user_id TEXT NOT NULL,permission TEXT NOT NULL,PRIMARY KEY(guild_id,user_id,permission));
CREATE TABLE IF NOT EXISTS staff_roles(guild_id TEXT NOT NULL,role_id TEXT NOT NULL,PRIMARY KEY(guild_id,role_id));
CREATE TABLE IF NOT EXISTS staff_profiles(guild_id TEXT NOT NULL,user_id TEXT NOT NULL,username TEXT NOT NULL,display_name TEXT NOT NULL,roles TEXT NOT NULL,registered_at TEXT NOT NULL,last_work_at TEXT,warnings INTEGER NOT NULL DEFAULT 0,monitoring_status TEXT NOT NULL DEFAULT 'UNKNOWN',PRIMARY KEY(guild_id,user_id));
CREATE TABLE IF NOT EXISTS staff_role_history(id INTEGER PRIMARY KEY,guild_id TEXT NOT NULL,user_id TEXT NOT NULL,role_id TEXT NOT NULL,action TEXT NOT NULL,at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS activity_events(id INTEGER PRIMARY KEY,guild_id TEXT NOT NULL,user_id TEXT NOT NULL,kind TEXT NOT NULL,source_id TEXT,event_key TEXT UNIQUE,at TEXT NOT NULL,metadata TEXT NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS ticket_records(id INTEGER PRIMARY KEY,guild_id TEXT NOT NULL,channel_id TEXT NOT NULL,created_at TEXT NOT NULL,closed_at TEXT, UNIQUE(guild_id,channel_id));
CREATE TABLE IF NOT EXISTS ticket_events(id INTEGER PRIMARY KEY,guild_id TEXT NOT NULL,channel_id TEXT NOT NULL,user_id TEXT NOT NULL,kind TEXT NOT NULL,at TEXT NOT NULL,event_key TEXT UNIQUE);
CREATE TABLE IF NOT EXISTS ticket_assignments(guild_id TEXT NOT NULL,channel_id TEXT NOT NULL,user_id TEXT NOT NULL,assigned_at TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1,PRIMARY KEY(guild_id,channel_id,user_id));
CREATE TABLE IF NOT EXISTS inactivity_incidents(id TEXT PRIMARY KEY,guild_id TEXT NOT NULL,user_id TEXT NOT NULL,status TEXT NOT NULL,reason TEXT NOT NULL,created_at TEXT NOT NULL,review_id TEXT);
CREATE TABLE IF NOT EXISTS warning_reviews(id TEXT PRIMARY KEY,guild_id TEXT NOT NULL,user_id TEXT NOT NULL,status TEXT NOT NULL,reason TEXT NOT NULL,created_at TEXT NOT NULL,expires_at TEXT,approvals TEXT NOT NULL DEFAULT '[]',message_refs TEXT NOT NULL DEFAULT '[]');
CREATE TABLE IF NOT EXISTS warnings(id TEXT PRIMARY KEY,guild_id TEXT NOT NULL,user_id TEXT NOT NULL,level INTEGER NOT NULL,reason TEXT NOT NULL,issued_by TEXT NOT NULL,approved_by TEXT NOT NULL,issued_at TEXT NOT NULL,expires_at TEXT,delivery_status TEXT NOT NULL DEFAULT 'PENDING');
CREATE TABLE IF NOT EXISTS warning_appeals(id TEXT PRIMARY KEY,warning_id TEXT NOT NULL,user_id TEXT NOT NULL,reason TEXT NOT NULL,status TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS approved_leave(id TEXT PRIMARY KEY,guild_id TEXT NOT NULL,user_id TEXT NOT NULL,start_at TEXT NOT NULL,end_at TEXT NOT NULL,reason TEXT NOT NULL,approved_by TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS notification_history(id INTEGER PRIMARY KEY,guild_id TEXT NOT NULL,user_id TEXT NOT NULL,kind TEXT NOT NULL,status TEXT NOT NULL,at TEXT NOT NULL,details TEXT);
CREATE TABLE IF NOT EXISTS monitoring_health(guild_id TEXT PRIMARY KEY,last_scan TEXT,coverage TEXT NOT NULL DEFAULT 'UNKNOWN',issues TEXT NOT NULL DEFAULT '[]',downtime_started TEXT);
CREATE TABLE IF NOT EXISTS daily_statistics(guild_id TEXT NOT NULL,day TEXT NOT NULL,payload TEXT NOT NULL,PRIMARY KEY(guild_id,day));
CREATE TABLE IF NOT EXISTS audit_logs(id INTEGER PRIMARY KEY,guild_id TEXT,actor_id TEXT NOT NULL,action TEXT NOT NULL,target_id TEXT,details TEXT NOT NULL DEFAULT '{}',at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_events_staff ON activity_events(guild_id,user_id,at); CREATE INDEX IF NOT EXISTS idx_reviews_guild ON warning_reviews(guild_id,status); CREATE INDEX IF NOT EXISTS idx_ticket_events ON ticket_events(guild_id,user_id,at);`);
}
