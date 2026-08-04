-- =============================================================================
-- FUTBOL AI PLATFORM - ESQUEMAS OFICIALES DE BASE DE DATOS (DDL)
-- =============================================================================

-- 1. TABLA: users (Autenticación, Biometría Passkeys/WebAuthn, Tiers y Roles)
CREATE TABLE users (
    id                        UUID                 PRIMARY KEY DEFAULT UUIDV4(),
    username                  VARCHAR(100)         NOT NULL,
    email                     VARCHAR(150)         NOT NULL UNIQUE,
    passwordHash              VARCHAR(255)         NOT NULL,
    nombres                   VARCHAR(100),
    apellidos                 VARCHAR(100),
    telefono                  VARCHAR(50),
    role                      VARCHAR(50)          NOT NULL DEFAULT 'Coach',
    avatarUrl                 VARCHAR(500),
    isActive                  BOOLEAN              NOT NULL DEFAULT TRUE,
    isVerified                BOOLEAN              NOT NULL DEFAULT FALSE,
    lastLogin                 TIMESTAMP WITH TIME ZONE,
    onboardingComplete        BOOLEAN              NOT NULL DEFAULT FALSE,
    selectedCountry           VARCHAR(100),
    selectedClub              VARCHAR(100),
    preferredFormation        VARCHAR(50),
    preferredStyle            VARCHAR(50),
    selectedTier              VARCHAR(50)          NOT NULL DEFAULT 'Gratis',
    otpCode                   VARCHAR(6),
    otpExpires                TIMESTAMP WITH TIME ZONE,
    localCoachData            TEXT,
    billingCycleStart         TIMESTAMP WITH TIME ZONE,
    billingCycleEnd           TIMESTAMP WITH TIME ZONE,
    autoRenew                 BOOLEAN              NOT NULL DEFAULT TRUE,
    maxPaidTierInCycle        VARCHAR(50)          DEFAULT 'Gratis',
    hasPasskey                BOOLEAN              NOT NULL DEFAULT FALSE,
    passkeyCredentialId       TEXT,
    passkeyPublicKey          TEXT,
    passkeyCounter            INTEGER              DEFAULT 0,
    passkeyPinHash            VARCHAR(255),
    passkeyChallenge          TEXT,
    passkeyDeviceInfo         VARCHAR(255),
    securityQuestions         TEXT,
    featureSettings           TEXT,
    dailyComparisonsCount     INTEGER              DEFAULT 0,
    dailyAiMessagesCount      INTEGER              DEFAULT 0,
    lastDailyResetDate        VARCHAR(10),
    weeklyComparisonsCount    INTEGER              DEFAULT 0,
    firstWeeklyComparisonAt   TIMESTAMP WITH TIME ZONE,
    weeklyAiMessagesCount     INTEGER              DEFAULT 0,
    firstWeeklyAiMessageAt    TIMESTAMP WITH TIME ZONE,
    monthlySimulationsCount   INTEGER              DEFAULT 0,
    firstMonthlySimulationAt  TIMESTAMP WITH TIME ZONE,
    monthlyComparisonsCount   INTEGER              DEFAULT 0,
    firstMonthlyComparisonAt  TIMESTAMP WITH TIME ZONE,
    firstDailyComparisonAt    TIMESTAMP WITH TIME ZONE,
    firstDailyAiMessageAt     TIMESTAMP WITH TIME ZONE,
    lastWeeklyResetDate       VARCHAR(15),
    lastMonthlyResetDate      VARCHAR(10),
    created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_users_email               ON users (email);
CREATE INDEX ix_users_role                ON users (role);
CREATE INDEX ix_users_selected_tier       ON users (selectedTier);


-- 2. TABLA: Players (Motor de Scouting Global e Inventario Mundial)
CREATE TABLE Players (
    id                        VARCHAR(100)         PRIMARY KEY NOT NULL,
    name                      VARCHAR(255)         NOT NULL,
    photoId                   VARCHAR(100),
    nickname                  VARCHAR(150),
    age                       INTEGER,
    nationality               VARCHAR(100),
    nationalityEs             VARCHAR(100),
    flag                      VARCHAR(255),
    position                  VARCHAR(50),
    positionEs                VARCHAR(50),
    currentTeam               VARCHAR(255),
    league                    VARCHAR(255),
    country                   VARCHAR(100),
    jerseyNumber              INTEGER,
    height                    INTEGER,
    weight                    INTEGER,
    preferredFoot             VARCHAR(20),
    marketValue               BIGINT,
    overallRating             FLOAT,
    stats                     TEXT,
    careerTotals              TEXT,
    trophies                  TEXT,
    transfers                 TEXT,
    bio                       TEXT,
    bioEs                     TEXT,
    strengths                 TEXT,
    tags                      TEXT,
    history                   TEXT,
    userId                    VARCHAR(100),
    created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_players_position          ON Players (position);
CREATE INDEX ix_players_league            ON Players (league);
CREATE INDEX ix_players_current_team      ON Players (currentTeam);
CREATE INDEX ix_players_market_value      ON Players (marketValue);


-- 3. TABLA: Prospects (Jugadores Locales, Academias y Cantera)
CREATE TABLE Prospects (
    id                        VARCHAR(100)         PRIMARY KEY NOT NULL,
    userId                    UUID                 NOT NULL,
    name                      VARCHAR(255)         NOT NULL,
    nickname                  VARCHAR(150),
    docType                   VARCHAR(50),
    docNumber                 VARCHAR(50),
    docFileUrl                TEXT,
    docFileName               VARCHAR(255),
    age                       INTEGER,
    jerseyNumber              INTEGER,
    position                  VARCHAR(50),
    positionEs                VARCHAR(50),
    overallRating             FLOAT,
    category                  VARCHAR(50),
    preferredFoot             VARCHAR(20),
    height                    INTEGER,
    heightUnit                VARCHAR(10),
    weight                    INTEGER,
    weightUnit                VARCHAR(10),
    medicalStatus             VARCHAR(50),
    photoUrl                  TEXT,
    photoId                   VARCHAR(100),
    currentTeam               VARCHAR(255),
    league                    VARCHAR(255),
    country                   VARCHAR(100),
    nationality               VARCHAR(100),
    nationalityEs             VARCHAR(100),
    flag                      VARCHAR(255),
    marketValue               BIGINT,
    bio                       TEXT,
    bioEs                     TEXT,
    stats                     TEXT,
    strengths                 TEXT,
    improvements              TEXT,
    weaknesses                TEXT,
    tacticalNotes             TEXT,
    highlightUrl              TEXT,
    trophies                  TEXT,
    injuries                  TEXT,
    authorizations            TEXT,
    legalDetails              TEXT,
    tags                      TEXT,
    history                   TEXT,
    created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX ix_prospects_user_id         ON Prospects (userId);
CREATE INDEX ix_prospects_category        ON Prospects (category);
CREATE INDEX ix_prospects_medical_status  ON Prospects (medicalStatus);


-- 4. TABLA: leagues (Catálogo Mundial de Ligas)
CREATE TABLE leagues (
    id                        INTEGER              PRIMARY KEY AUTOINCREMENT NOT NULL,
    name                      VARCHAR(255)         NOT NULL UNIQUE,
    country                   VARCHAR(255)         NOT NULL,
    leagueCode                VARCHAR(100)         NOT NULL UNIQUE,
    flagIso                   VARCHAR(10)          NOT NULL
);

CREATE INDEX ix_leagues_code              ON leagues (leagueCode);
CREATE INDEX ix_leagues_country           ON leagues (country);


-- 5. TABLA: teams (Catálogo Mundial de Clubes y Equipos)
CREATE TABLE teams (
    id                        INTEGER              PRIMARY KEY AUTOINCREMENT NOT NULL,
    name                      VARCHAR(255)         NOT NULL,
    leagueName                VARCHAR(255)         NOT NULL,
    country                   VARCHAR(255)         NOT NULL,
    position                  INTEGER,
    pj                        INTEGER,
    g                         INTEGER,
    e                         INTEGER,
    p                         INTEGER,
    gf                        INTEGER,
    gc                        INTEGER,
    pts                       INTEGER
);

CREATE INDEX ix_teams_league_name         ON teams (leagueName);
CREATE INDEX ix_teams_country              ON teams (country);


-- 6. TABLA: payments (Módulo Financiero y Facturación)
CREATE TABLE payments (
    id                        UUID                 PRIMARY KEY DEFAULT UUIDV4(),
    userId                    UUID                 NOT NULL,
    amount                    DECIMAL(10,2)        NOT NULL,
    currency                  VARCHAR(10)          NOT NULL DEFAULT 'USD',
    paymentMethodId           VARCHAR(100),
    transactionId             VARCHAR(255),
    status                    VARCHAR(50)          NOT NULL DEFAULT 'completed',
    tier                      VARCHAR(50)          NOT NULL,
    invoiceUrl                VARCHAR(500),
    created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX ix_payments_user_id          ON payments (userId);
CREATE INDEX ix_payments_status           ON payments (status);


-- 7. TABLA: payment_methods (Métodos de Pago y Tarjetas)
CREATE TABLE payment_methods (
    id                        UUID                 PRIMARY KEY DEFAULT UUIDV4(),
    userId                    UUID                 NOT NULL,
    cardBrand                 VARCHAR(50)          NOT NULL,
    lastFour                  VARCHAR(4)           NOT NULL,
    expMonth                  INTEGER              NOT NULL,
    expYear                   INTEGER              NOT NULL,
    isDefault                 BOOLEAN              NOT NULL DEFAULT FALSE,
    gatewayToken              VARCHAR(255)         NOT NULL,
    created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX ix_payment_methods_user_id   ON payment_methods (userId);


-- 8. TABLA: query_logs (Auditoría de Consultas IA - Gemini Chat)
CREATE TABLE query_logs (
    id                        INTEGER              PRIMARY KEY AUTOINCREMENT NOT NULL,
    userId                    UUID                 NOT NULL,
    message                   TEXT,
    created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX ix_query_logs_user_id        ON query_logs (userId);


-- 9. TABLA: comparison_logs (Auditoría de Comparativas 360°)
CREATE TABLE comparison_logs (
    id                        INTEGER              PRIMARY KEY AUTOINCREMENT NOT NULL,
    userId                    UUID                 NOT NULL,
    player1Id                 VARCHAR(100)         NOT NULL,
    player2Id                 VARCHAR(100)         NOT NULL,
    created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX ix_comparison_logs_user_id   ON comparison_logs (userId);


-- 10. TABLA: favorite_logs (Lista de Favoritos / Shortlist)
CREATE TABLE favorite_logs (
    id                        INTEGER              PRIMARY KEY AUTOINCREMENT NOT NULL,
    userId                    UUID                 NOT NULL,
    playerId                  VARCHAR(100)         NOT NULL,
    action                    VARCHAR(50)          NOT NULL DEFAULT 'add',
    created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX ix_favorite_logs_user_id     ON favorite_logs (userId);
CREATE INDEX ix_favorite_logs_player_id   ON favorite_logs (playerId);


-- 11. TABLA: direct_messages (Mensajería Directa entre Usuarios)
CREATE TABLE direct_messages (
    id                        UUID                 PRIMARY KEY DEFAULT UUIDV4(),
    senderId                  UUID                 NOT NULL,
    receiverId                UUID                 NOT NULL,
    message                   TEXT                 NOT NULL,
    isRead                    BOOLEAN              NOT NULL DEFAULT FALSE,
    created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (senderId) REFERENCES users(id),
    FOREIGN KEY (receiverId) REFERENCES users(id)
);

CREATE INDEX ix_direct_messages_sender    ON direct_messages (senderId);
CREATE INDEX ix_direct_messages_receiver  ON direct_messages (receiverId);


-- 12. TABLA: user_contacts (Contactos y Agenda Deportiva)
CREATE TABLE user_contacts (
    id                        UUID                 PRIMARY KEY DEFAULT UUIDV4(),
    userId                    UUID                 NOT NULL,
    contactUserId             UUID                 NOT NULL,
    status                    VARCHAR(50)          NOT NULL DEFAULT 'accepted',
    created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (contactUserId) REFERENCES users(id)
);

CREATE INDEX ix_user_contacts_user        ON user_contacts (userId);
CREATE INDEX ix_user_contacts_contact     ON user_contacts (contactUserId);
