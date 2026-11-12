ALTER TABLE mod_vote_limits ADD COLUMN day INTEGER NOT NULL DEFAULT 0;
ALTER TABLE mod_vote_limits ADD COLUMN day_attempts INTEGER NOT NULL DEFAULT 0;

DROP INDEX IF EXISTS mod_vote_limits_minute;
CREATE INDEX mod_vote_limits_day ON mod_vote_limits (day);

DELETE FROM mod_votes;
DELETE FROM mod_vote_totals;
DELETE FROM mod_vote_limits;

CREATE INDEX mod_votes_voter ON mod_votes (voter_id);

DROP TRIGGER IF EXISTS mod_votes_update;
CREATE TRIGGER mod_votes_update AFTER UPDATE OF vote ON mod_votes WHEN OLD.vote != NEW.vote BEGIN
  UPDATE mod_vote_totals SET
    likes = MAX(0, likes - (OLD.vote = 1) + (NEW.vote = 1)),
    dislikes = MAX(0, dislikes - (OLD.vote = -1) + (NEW.vote = -1))
  WHERE mod_id = NEW.mod_id;
END;

DROP TRIGGER IF EXISTS mod_votes_delete;
CREATE TRIGGER mod_votes_delete AFTER DELETE ON mod_votes BEGIN
  UPDATE mod_vote_totals SET
    likes = MAX(0, likes - (OLD.vote = 1)),
    dislikes = MAX(0, dislikes - (OLD.vote = -1))
  WHERE mod_id = OLD.mod_id;
END;
