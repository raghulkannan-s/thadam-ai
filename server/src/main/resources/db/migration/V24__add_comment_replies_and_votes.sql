ALTER TABLE roadmap_comments
ADD COLUMN parent_id BIGINT,
ADD COLUMN upvote_count INT NOT NULL DEFAULT 0,
ADD COLUMN downvote_count INT NOT NULL DEFAULT 0;

ALTER TABLE roadmap_comments
ADD CONSTRAINT fk_roadmap_comments_parent FOREIGN KEY (parent_id) REFERENCES roadmap_comments(id) ON DELETE CASCADE;

CREATE INDEX idx_roadmap_comments_parent_id ON roadmap_comments(parent_id);

ALTER TABLE roadmaps
ADD COLUMN comment_count INT NOT NULL DEFAULT 0;

CREATE TABLE comment_votes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    comment_id BIGINT NOT NULL,
    vote_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_comment_votes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_votes_comment FOREIGN KEY (comment_id) REFERENCES roadmap_comments(id) ON DELETE CASCADE,
    CONSTRAINT uq_comment_votes_user_comment UNIQUE (user_id, comment_id)
);

CREATE INDEX idx_comment_votes_comment_id ON comment_votes(comment_id);
