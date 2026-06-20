package com.thadam.ai.common.dto;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.Test;

class ApiResponseTest {

    @Test
    void success_shouldCreateResponseWithDataAndNullMessage() {
        ApiResponse<String> response = ApiResponse.success("hello");

        assertThat(response.success()).isTrue();
        assertThat(response.message()).isNull();
        assertThat(response.data()).isEqualTo("hello");
    }

    @Test
    void success_withMessage_shouldIncludeMessage() {
        ApiResponse<Integer> response = ApiResponse.success("done", 42);

        assertThat(response.success()).isTrue();
        assertThat(response.message()).isEqualTo("done");
        assertThat(response.data()).isEqualTo(42);
    }

    @Test
    void error_shouldCreateFailureResponse() {
        ApiResponse<Void> response = ApiResponse.error("something went wrong");

        assertThat(response.success()).isFalse();
        assertThat(response.message()).isEqualTo("something went wrong");
        assertThat(response.data()).isNull();
    }

    @Test
    void error_withNullData_shouldBeNull() {
        ApiResponse<String> response = ApiResponse.success(null);

        assertThat(response.success()).isTrue();
        assertThat(response.data()).isNull();
    }
}
