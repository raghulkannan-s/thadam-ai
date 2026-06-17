package com.thadam.ai.modules.community.infrastructure.repositories;
import com.thadam.ai.modules.community.core.domain.entities.Collection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CollectionRepository extends JpaRepository<Collection, Long> {
    Page<Collection> findByUserId(Long userId, Pageable pageable);
    Page<Collection> findByVisibility(String visibility, Pageable pageable);
}
