package com.sheildX.proj.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatRequestDTO(
	@NotBlank(message = "Question is required")
	@Size(max = 500, message = "Question must be at most 500 characters")
	String question
) {
}
