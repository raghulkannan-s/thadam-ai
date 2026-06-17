package com.thadam.ai.modules.community.infrastructure.repositories;

import com.thadam.ai.modules.community.core.domain.entities.CreatorProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CreatorRepository extends JpaRepository<CreatorProfile, Long> {
}
