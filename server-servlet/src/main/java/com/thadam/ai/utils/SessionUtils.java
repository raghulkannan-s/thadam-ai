package com.thadam.ai.utils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

public final class SessionUtils {
    public static final String USER_ID = "userId";

    private SessionUtils() {}

    public static Long getUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }
        Object value = session.getAttribute(USER_ID);
        return value instanceof Long ? (Long) value : null;
    }
}
