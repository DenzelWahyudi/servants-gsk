CREATE DATABASE servants;
\c servants

CREATE TYPE user_role as ENUM ('admin', 'volunteer');

CREATE TABLE users(
    id              BIGSERIAL       PRIMARY KEY                     ,
    name            VARCHAR(255)    NOT NULL    UNIQUE              ,
    email           VARCHAR(255)    NOT NULL    UNIQUE              ,
    phone_number    VARCHAR(255)    NOT NULL    UNIQUE              ,
    password_hash   TEXT            NOT NULL                        ,
    push_token      TEXT                        DEFAULT NULL        ,
    role            user_role       NOT NULL    DEFAULT 'volunteer' ,
    created_at      TIMESTAMPTZ      NOT NULL    DEFAULT now()
);

CREATE TYPE service_status as ENUM ('Roles Open', 'Roles Closed');

CREATE TABLE services(
    id              BIGSERIAL       PRIMARY KEY                     ,
    name            VARCHAR(255)    NOT NULL                        ,
    date            DATE            NOT NULL                        ,
    time            VARCHAR(255)    NOT NULL                        ,
    status          service_status  NOT NULL    DEFAULT 'Roles Closed'
);

CREATE TABLE roles(
    id              BIGSERIAL       PRIMARY KEY                     ,
    service_id      BIGINT          NOT NULL    REFERENCES services(id) ON DELETE CASCADE,
    name            VARCHAR(255)    NOT NULL                        ,
    spots_total     INTEGER         NOT NULL                        ,
    spots_filled    INTEGER         NOT NULL    DEFAULT 0
);

CREATE TYPE assignment_status as ENUM ('confirmed', 'pending', 'declined');

CREATE TABLE assignments(
    id              BIGSERIAL       PRIMARY KEY                     ,
    user_id         BIGINT          NOT NULL    REFERENCES users(id) ON DELETE CASCADE,
    role_id         BIGINT          NOT NULL    REFERENCES roles(id) ON DELETE CASCADE,
    status          assignment_status NOT NULL  DEFAULT 'pending'
);

CREATE OR REPLACE FUNCTION sync_role_spots_filled()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'confirmed' THEN
            UPDATE roles
            SET spots_filled = spots_filled + 1
            WHERE id = NEW.role_id;
        END IF;

        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        IF OLD.status = 'confirmed' THEN
            UPDATE roles
            SET spots_filled = GREATEST(spots_filled - 1, 0)
            WHERE id = OLD.role_id;
        END IF;

        RETURN OLD;
    END IF;

    IF OLD.status = 'confirmed'
        AND (
            NEW.status <> 'confirmed'
            OR OLD.role_id IS DISTINCT FROM NEW.role_id
        ) THEN
        UPDATE roles
        SET spots_filled = GREATEST(spots_filled - 1, 0)
        WHERE id = OLD.role_id;
    END IF;

    IF NEW.status = 'confirmed'
        AND (
            OLD.status <> 'confirmed'
            OR OLD.role_id IS DISTINCT FROM NEW.role_id
        ) THEN
        UPDATE roles
        SET spots_filled = spots_filled + 1
        WHERE id = NEW.role_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_role_spots_filled_trigger
AFTER INSERT OR DELETE OR UPDATE OF status, role_id ON assignments
FOR EACH ROW
EXECUTE FUNCTION sync_role_spots_filled();

CREATE TYPE chat_status as ENUM ('success', 'pending', 'failed');

CREATE TABLE chats(
    id              BIGSERIAL       PRIMARY KEY                     ,
    service_id      BIGINT          NOT NULL    REFERENCES services(id) ON DELETE CASCADE,
    user_id         BIGINT                      REFERENCES users(id) ON DELETE SET NULL,
    user_name       VARCHAR(255)    NOT NULL                        ,
    message         TEXT                                            ,
    file            JSONB                       DEFAULT NULL        ,
    status          chat_status     NOT NULL    DEFAULT 'pending'   ,
    reply_to        JSONB                       DEFAULT NULL        ,
    read_by         JSONB           NOT NULL    DEFAULT '[]'::jsonb ,
    created_at      TIMESTAMPTZ      NOT NULL    DEFAULT now()       ,
    updated_at      TIMESTAMPTZ      NOT NULL    DEFAULT now()
);
