package com.thadam.ai.services;

import com.thadam.ai.dao.RoadmapDao;
import com.thadam.ai.dao.RoadmapTaskDao;
import com.thadam.ai.dto.RoadmapDto;
import com.thadam.ai.dto.RoadmapTaskDto;
import com.thadam.ai.models.Roadmap;
import com.thadam.ai.models.RoadmapTask;
import com.thadam.ai.utils.DbConnection;
import com.thadam.ai.utils.ValidationUtils;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class RoadmapService {
    private final GeminiService geminiService = new GeminiService();

    public RoadmapDto generateRoadmap(long userId, String goal, int durationWeeks, String difficulty) throws Exception {
        if (!ValidationUtils.isNonEmpty(goal)) {
            throw new IllegalArgumentException("Goal is required");
        }
        if (durationWeeks < 1 || durationWeeks > 52) {
            throw new IllegalArgumentException("Duration must be between 1 and 52 weeks");
        }
        if (!ValidationUtils.isNonEmpty(difficulty)) {
            throw new IllegalArgumentException("Difficulty is required");
        }

        GeminiService.GeminiRoadmap aiRoadmap = geminiService.generateRoadmap(goal, durationWeeks, difficulty);
        if (aiRoadmap == null || aiRoadmap.getTasks() == null || aiRoadmap.getTasks().length == 0) {
            throw new IllegalStateException("AI did not return tasks");
        }

        try (Connection connection = DbConnection.getConnection()) {
            RoadmapDao roadmapDao = new RoadmapDao(connection);
            RoadmapTaskDao taskDao = new RoadmapTaskDao(connection);
            Roadmap roadmap = roadmapDao.insert(userId,
                aiRoadmap.getTitle() == null ? goal : aiRoadmap.getTitle(),
                goal,
                durationWeeks,
                difficulty,
                "ACTIVE");

            List<RoadmapTask> taskModels = new ArrayList<>();
            int index = 1;
            for (GeminiService.GeminiTask task : aiRoadmap.getTasks()) {
                if (task == null || !ValidationUtils.isNonEmpty(task.getTitle())) {
                    continue;
                }
                taskModels.add(new RoadmapTask(0, roadmap.getId(), task.getTitle(), task.getDescription(), index, task.getExpectedDays(), null, null));
                index++;
            }
            taskDao.insertTasks(roadmap.getId(), taskModels);

            List<RoadmapTaskDto> taskDtos = new ArrayList<>();
            for (RoadmapTask task : taskDao.listByRoadmap(roadmap.getId())) {
                taskDtos.add(new RoadmapTaskDto(task.getId(), task.getTitle(), task.getDescription(), task.getOrderIndex(), task.getExpectedDays()));
            }
            return new RoadmapDto(roadmap.getId(), roadmap.getTitle(), roadmap.getGoal(), roadmap.getDurationWeeks(), roadmap.getDifficulty(), roadmap.getStatus(), taskDtos);
        }
    }

    public List<RoadmapDto> listRoadmaps(long userId) throws SQLException {
        try (Connection connection = DbConnection.getConnection()) {
            RoadmapDao roadmapDao = new RoadmapDao(connection);
            RoadmapTaskDao taskDao = new RoadmapTaskDao(connection);
            List<RoadmapDto> results = new ArrayList<>();
            for (Roadmap roadmap : roadmapDao.listByUser(userId)) {
                List<RoadmapTaskDto> taskDtos = new ArrayList<>();
                for (RoadmapTask task : taskDao.listByRoadmap(roadmap.getId())) {
                    taskDtos.add(new RoadmapTaskDto(task.getId(), task.getTitle(), task.getDescription(), task.getOrderIndex(), task.getExpectedDays()));
                }
                results.add(new RoadmapDto(roadmap.getId(), roadmap.getTitle(), roadmap.getGoal(), roadmap.getDurationWeeks(), roadmap.getDifficulty(), roadmap.getStatus(), taskDtos));
            }
            return results;
        }
    }
}
