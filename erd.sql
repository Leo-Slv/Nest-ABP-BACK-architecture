CREATE DATABASE crmAbp_db;

-- =========================================================
-- EXTENSIONS
-- =========================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- DROP (opcional, se quiser recriar do zero)
-- =========================================================
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS deal_history CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS lead_status CASCADE;
DROP TYPE IF EXISTS deal_status CASCADE;
DROP TYPE IF EXISTS deal_stage CASCADE;
DROP TYPE IF EXISTS deal_importance CASCADE;
DROP TYPE IF EXISTS audit_action_type CASCADE;

-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE user_role AS ENUM (
  'ATTENDANT',
  'MANAGER',
  'GENERAL_MANAGER',
  'ADMINISTRATOR'
);

CREATE TYPE lead_status AS ENUM (
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'DISQUALIFIED',
  'CONVERTED'
);

CREATE TYPE deal_status AS ENUM (
  'OPEN',
  'WON',
  'LOST'
);

CREATE TYPE deal_stage AS ENUM (
  'INITIAL_CONTACT',
  'NEGOTIATION',
  'PROPOSAL',
  'CLOSING'
);

CREATE TYPE deal_importance AS ENUM (
  'COLD',
  'WARM',
  'HOT'
);

CREATE TYPE audit_action_type AS ENUM (
  'LOGIN',
  'CREATE',
  'UPDATE',
  'DELETE',
  'STATUS_CHANGE',
  'STAGE_CHANGE'
);

-- =========================================================
-- TABLE: teams
-- =========================================================
CREATE TABLE teams (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          varchar(150) NOT NULL,
  manager_id    uuid NULL
);

-- =========================================================
-- TABLE: stores
-- =========================================================
CREATE TABLE stores (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          varchar(150) NOT NULL
);

-- =========================================================
-- TABLE: users
-- =========================================================
CREATE TABLE users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           varchar(150) NOT NULL,
  email          varchar(320) NOT NULL,
  password_hash  varchar(255) NOT NULL,
  role           user_role NOT NULL,
  team_id        integer NULL,

  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT fk_users_team
    FOREIGN KEY (team_id) REFERENCES teams(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

-- agora que users existe, fecha a FK de manager em teams
ALTER TABLE teams
  ADD CONSTRAINT fk_teams_manager
  FOREIGN KEY (manager_id) REFERENCES users(id)
  ON UPDATE CASCADE
  ON DELETE SET NULL;

-- =========================================================
-- TABLE: customers
-- =========================================================
CREATE TABLE customers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          varchar(150) NOT NULL,
  email         varchar(320) NULL,
  phone         varchar(30) NULL,

  CONSTRAINT uq_customers_email UNIQUE (email)
);

-- =========================================================
-- TABLE: leads
-- =========================================================
CREATE TABLE leads (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    uuid NOT NULL,
  store_id       integer NOT NULL,
  owner_user_id  uuid NOT NULL,
  source         varchar(100) NOT NULL,
  status         lead_status NOT NULL DEFAULT 'NEW',

  CONSTRAINT fk_leads_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_leads_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_leads_owner_user
    FOREIGN KEY (owner_user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

-- =========================================================
-- TABLE: deals
-- =========================================================
CREATE TABLE deals (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id        uuid NOT NULL,
  status         deal_status NOT NULL DEFAULT 'OPEN',
  stage          deal_stage NOT NULL,
  importance     deal_importance NOT NULL,
  close_reason   varchar(255) NULL,

  CONSTRAINT fk_deals_lead
    FOREIGN KEY (lead_id) REFERENCES leads(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

-- Regra: no máximo uma negociação ativa por lead
CREATE UNIQUE INDEX uq_deals_one_open_per_lead
  ON deals (lead_id)
  WHERE status = 'OPEN';

-- =========================================================
-- TABLE: deal_history
-- =========================================================
CREATE TABLE deal_history (
  id                integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  deal_id           uuid NOT NULL,
  changed_by_user_id uuid NOT NULL,
  previous_status   deal_status NULL,
  new_status        deal_status NULL,
  previous_stage    deal_stage NULL,
  new_stage         deal_stage NULL,
  changed_at        timestamp without time zone NOT NULL DEFAULT now(),

  CONSTRAINT fk_deal_history_deal
    FOREIGN KEY (deal_id) REFERENCES deals(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT fk_deal_history_user
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

-- =========================================================
-- TABLE: audit_logs
-- =========================================================
CREATE TABLE audit_logs (
  id             char(64) PRIMARY KEY,
  actor_user_id  uuid NOT NULL,
  action_type    audit_action_type NOT NULL,
  entity_name    varchar(100) NOT NULL,
  entity_id      varchar(100) NOT NULL,
  created_at     timestamp without time zone NOT NULL DEFAULT now(),

  CONSTRAINT fk_audit_logs_actor_user
    FOREIGN KEY (actor_user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

-- =========================================================
-- INDEXES
-- =========================================================
CREATE INDEX ix_users_team_id ON users(team_id);

CREATE INDEX ix_leads_customer_id ON leads(customer_id);
CREATE INDEX ix_leads_store_id ON leads(store_id);
CREATE INDEX ix_leads_owner_user_id ON leads(owner_user_id);
CREATE INDEX ix_leads_status ON leads(status);
CREATE INDEX ix_leads_source ON leads(source);

CREATE INDEX ix_deals_lead_id ON deals(lead_id);
CREATE INDEX ix_deals_status ON deals(status);
CREATE INDEX ix_deals_stage ON deals(stage);
CREATE INDEX ix_deals_importance ON deals(importance);

CREATE INDEX ix_deal_history_deal_id ON deal_history(deal_id);
CREATE INDEX ix_deal_history_changed_by_user_id ON deal_history(changed_by_user_id);
CREATE INDEX ix_deal_history_changed_at ON deal_history(changed_at);

CREATE INDEX ix_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX ix_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX ix_audit_logs_entity_name ON audit_logs(entity_name);
CREATE INDEX ix_audit_logs_created_at ON audit_logs(created_at);
