package com.thadam.ai.services;

import com.thadam.ai.dao.ProfileDao;
import com.thadam.ai.dao.UserDao;
import com.thadam.ai.dto.UserDto;
import com.thadam.ai.models.Profile;
import com.thadam.ai.models.User;
import com.thadam.ai.utils.DbConnection;
import com.thadam.ai.utils.PasswordUtils;
import com.thadam.ai.utils.ValidationUtils;

import java.sql.Connection;
import java.sql.SQLException;

public class AuthService {
    public UserDto register(String email, String password, String displayName) throws SQLException {
        if (!ValidationUtils.isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email");
        }
        if (!ValidationUtils.isValidPassword(password)) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }
        if (!ValidationUtils.isNonEmpty(displayName)) {
            throw new IllegalArgumentException("Display name is required");
        }

        try (Connection connection = DbConnection.getConnection()) {
            UserDao userDao = new UserDao(connection);
            if (userDao.findByEmail(email) != null) {
                throw new IllegalArgumentException("Email already registered");
            }
            String hash = PasswordUtils.hash(password);
            User user = userDao.insert(email, hash, "USER");
            ProfileDao profileDao = new ProfileDao(connection);
            Profile profile = profileDao.insert(user.getId(), displayName.trim());
            return new UserDto(user.getId(), user.getEmail(), profile.getDisplayName(), user.getRole());
        }
    }

    public UserDto login(String email, String password) throws SQLException {
        if (!ValidationUtils.isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email");
        }
        if (!ValidationUtils.isNonEmpty(password)) {
            throw new IllegalArgumentException("Password is required");
        }

        try (Connection connection = DbConnection.getConnection()) {
            UserDao userDao = new UserDao(connection);
            User user = userDao.findByEmail(email);
            if (user == null || !PasswordUtils.verify(password, user.getPasswordHash())) {
                throw new IllegalArgumentException("Invalid credentials");
            }
            ProfileDao profileDao = new ProfileDao(connection);
            Profile profile = profileDao.findByUserId(user.getId());
            String displayName = profile == null ? user.getEmail() : profile.getDisplayName();
            return new UserDto(user.getId(), user.getEmail(), displayName, user.getRole());
        }
    }

    public UserDto getUser(long userId) throws SQLException {
        try (Connection connection = DbConnection.getConnection()) {
            UserDao userDao = new UserDao(connection);
            User user = userDao.findById(userId);
            if (user == null) {
                return null;
            }
            ProfileDao profileDao = new ProfileDao(connection);
            Profile profile = profileDao.findByUserId(userId);
            String displayName = profile == null ? user.getEmail() : profile.getDisplayName();
            return new UserDto(user.getId(), user.getEmail(), displayName, user.getRole());
        }
    }
}
