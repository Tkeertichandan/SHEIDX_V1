package com.sheildX.proj.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI shieldXOpenApi() {
        final String bearer = "bearerAuth";

        return new OpenAPI()
            .info(new Info().title("ShieldX API").version("v1").description("Enterprise insurance platform APIs"))
            .addSecurityItem(new SecurityRequirement().addList(bearer))
            .components(new Components().addSecuritySchemes(
                bearer,
                new SecurityScheme()
                    .name(bearer)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
            ));
    }
}
