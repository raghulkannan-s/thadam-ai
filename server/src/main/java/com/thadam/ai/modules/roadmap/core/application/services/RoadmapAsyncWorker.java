package com.thadam.ai.modules.roadmap.core.application.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Previously used for async roadmap generation.
 * Kept for backward compatibility — generation is now synchronous.
 */
@Service
public class RoadmapAsyncWorker {

    private static final Logger log = LoggerFactory.getLogger(RoadmapAsyncWorker.class);
}
