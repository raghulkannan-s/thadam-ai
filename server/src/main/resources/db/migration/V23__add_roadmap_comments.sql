CREATE TABLE roadmap_comments (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    roadmap_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_roadmap_comments_roadmap FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
    CONSTRAINT fk_roadmap_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_roadmap_comments_roadmap_id ON roadmap_comments(roadmap_id);
CREATE INDEX idx_roadmap_comments_created_at ON roadmap_comments(created_at);
