CREATE TABLE mod_votes (
  mod_id TEXT NOT NULL,
  voter_id TEXT NOT NULL,
  vote INTEGER NOT NULL CHECK (vote IN (-1, 1)),
  PRIMARY KEY (mod_id, voter_id)
) WITHOUT ROWID;

CREATE TABLE mod_vote_totals (
  mod_id TEXT PRIMARY KEY,
  likes INTEGER NOT NULL DEFAULT 0,
  dislikes INTEGER NOT NULL DEFAULT 0
) WITHOUT ROWID;

CREATE TABLE mod_vote_limits (
  client_hash TEXT PRIMARY KEY,
  minute INTEGER NOT NULL,
  attempts INTEGER NOT NULL
) WITHOUT ROWID;

CREATE INDEX mod_vote_limits_minute ON mod_vote_limits (minute);

CREATE TRIGGER mod_votes_insert AFTER INSERT ON mod_votes BEGIN
  INSERT INTO mod_vote_totals (mod_id, likes, dislikes)
  VALUES (NEW.mod_id, NEW.vote = 1, NEW.vote = -1)
  ON CONFLICT (mod_id) DO UPDATE SET
    likes = likes + (NEW.vote = 1),
    dislikes = dislikes + (NEW.vote = -1);
END;

CREATE TRIGGER mod_votes_update AFTER UPDATE OF vote ON mod_votes BEGIN
  UPDATE mod_vote_totals SET
    likes = likes - (OLD.vote = 1) + (NEW.vote = 1),
    dislikes = dislikes - (OLD.vote = -1) + (NEW.vote = -1)
  WHERE mod_id = NEW.mod_id;
END;

CREATE TRIGGER mod_votes_delete AFTER DELETE ON mod_votes BEGIN
  UPDATE mod_vote_totals SET
    likes = likes - (OLD.vote = 1),
    dislikes = dislikes - (OLD.vote = -1)
  WHERE mod_id = OLD.mod_id;
END;
