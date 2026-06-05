package com.curiosity.subscription.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Foyer Subscription API")
                .description("API de gestion des abonnements et membres du foyer")
                .version("1.0.0"));
    }

    @Bean
    public OperationCustomizer hideVersionParam() {
        return (operation, handlerMethod) -> {
            if (operation.getParameters() != null) {
                operation.getParameters().removeIf(p -> "version".equals(p.getName()));
            }
            return operation;
        };
    }
}
