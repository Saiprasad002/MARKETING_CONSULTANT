-- SQLite Schema for AI Marketing Consultant Platform

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Owner',
    company_id TEXT,
    workspace_id TEXT,
    onboarding_completed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    logo TEXT,
    website TEXT,
    industry TEXT,
    sub_industry TEXT,
    business_type TEXT,
    startup_stage TEXT,
    location TEXT,
    operating_regions_json TEXT DEFAULT '[]',
    employees_count TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS company_profiles (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    section_key TEXT NOT NULL,
    field_key TEXT NOT NULL,
    value_json TEXT,
    source TEXT DEFAULT 'user_chat',
    confidence REAL DEFAULT 1.0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified INTEGER DEFAULT 1,
    UNIQUE(company_id, section_key, field_key),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS company_metrics (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    value REAL,
    unit TEXT,
    period TEXT,
    status TEXT NOT NULL DEFAULT 'INSUFFICIENT_DATA',
    source TEXT,
    explanation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    age_range TEXT,
    income_range TEXT,
    geography TEXT,
    pain_points_json TEXT DEFAULT '[]',
    motivations_json TEXT DEFAULT '[]',
    preferred_channels_json TEXT DEFAULT '[]',
    buying_behavior TEXT,
    purchase_triggers_json TEXT DEFAULT '[]',
    objections_json TEXT DEFAULT '[]',
    is_hypothesis INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS competitors (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    name TEXT NOT NULL,
    website TEXT,
    differentiators TEXT,
    weaknesses TEXT,
    market_position TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS marketing_channels (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    channel_name TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    spend REAL DEFAULT 0,
    cpa REAL,
    roas REAL,
    conversion_rate REAL,
    leads INTEGER,
    revenue REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    campaign_name TEXT NOT NULL,
    channel TEXT NOT NULL,
    spend REAL DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    cpa REAL,
    roas REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS consultations (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    consultation_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    extracted_entities_json TEXT,
    auditable_answer_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    status TEXT DEFAULT 'Uploading',
    error_message TEXT,
    insights_count INTEGER DEFAULT 0,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_insights (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    key_name TEXT NOT NULL,
    value_text TEXT NOT NULL,
    confidence REAL DEFAULT 1.0,
    verified INTEGER DEFAULT 0,
    source_chunk TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS data_conflicts (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    field_key TEXT NOT NULL,
    previous_value_json TEXT,
    new_value_json TEXT,
    source TEXT,
    status TEXT DEFAULT 'PENDING',
    resolved_value_json TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    health_score REAL DEFAULT 0,
    readiness_score REAL DEFAULT 0,
    growth_potential TEXT,
    data_completeness REAL DEFAULT 0,
    snapshot_data_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS swot_items (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    explanation TEXT NOT NULL,
    evidence TEXT NOT NULL,
    impact TEXT DEFAULT 'MEDIUM',
    confidence REAL DEFAULT 1.0,
    source TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS personas (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    age_range TEXT,
    income_range TEXT,
    geography TEXT,
    pain_points_json TEXT DEFAULT '[]',
    motivations_json TEXT DEFAULT '[]',
    preferred_channels_json TEXT DEFAULT '[]',
    buying_behavior TEXT,
    purchase_triggers_json TEXT DEFAULT '[]',
    objections_json TEXT DEFAULT '[]',
    is_hypothesis INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS strategies (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    current_positioning TEXT,
    recommended_positioning TEXT,
    differentiation_json TEXT DEFAULT '[]',
    messaging_pillars_json TEXT DEFAULT '[]',
    confidence REAL DEFAULT 1.0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recommendations (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    rationale TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT DEFAULT 'MEDIUM',
    expected_impact TEXT NOT NULL,
    estimated_effort TEXT DEFAULT 'MEDIUM',
    estimated_cost TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    required_data_json TEXT DEFAULT '[]',
    supporting_evidence TEXT NOT NULL,
    confidence REAL DEFAULT 1.0,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kpis (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    metric_key TEXT NOT NULL,
    name TEXT NOT NULL,
    value_json TEXT,
    status TEXT DEFAULT 'INSUFFICIENT_DATA',
    baseline TEXT,
    target TEXT,
    period TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customer_journey (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    phase TEXT NOT NULL,
    touchpoints_json TEXT DEFAULT '[]',
    customer_action TEXT NOT NULL,
    company_action TEXT NOT NULL,
    friction TEXT NOT NULL,
    opportunity TEXT NOT NULL,
    kpi TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS action_plans (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    timeframe_phase TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'MEDIUM',
    expected_impact TEXT NOT NULL,
    kpis_to_track_json TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS external_sources (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    topic TEXT NOT NULL,
    title TEXT NOT NULL,
    source_name TEXT NOT NULL,
    url TEXT,
    published_date TEXT,
    summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    details_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
