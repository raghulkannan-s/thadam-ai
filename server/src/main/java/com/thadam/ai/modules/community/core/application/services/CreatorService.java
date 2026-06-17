package com.thadam.ai.modules.community.core.application.services;

import com.thadam.ai.common.exception.NotFoundException;
import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.auth.infrastructure.repositories.UserRepository;
import com.thadam.ai.modules.community.core.domain.entities.CreatorProfile;
import com.thadam.ai.modules.community.core.domain.entities.Follow;
import com.thadam.ai.modules.community.infrastructure.repositories.CreatorRepository;
import com.thadam.ai.modules.community.infrastructure.repositories.FollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CreatorService {

    private final CreatorRepository creatorRepository;
    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    public Page<CreatorProfile> getTopCreators(Pageable pageable) {
        return creatorRepository.findAll(pageable);
    }

    public CreatorProfile getCreatorProfile(Long userId) {
        return creatorRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Creator profile not found"));
    }

    @Transactional
    public void followCreator(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }
        User follower = userRepository.findById(followerId).orElseThrow();
        User following = userRepository.findById(followingId).orElseThrow();

        if (!followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            Follow follow = Follow.builder()
                    .follower(follower)
                    .following(following)
                    .build();
            followRepository.save(follow);
        }
    }

    @Transactional
    public void unfollowCreator(Long followerId, Long followingId) {
        followRepository.deleteByFollowerIdAndFollowingId(followerId, followingId);
    }
}
