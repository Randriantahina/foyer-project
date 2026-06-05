package com.curiosity.subscription.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ApiVersionConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig  implements WebMvcConfigurer{

	@Override
	public void configureApiVersioning(ApiVersionConfigurer configurer) {
		configurer
			.addSupportedVersions("1","2")
			.setDefaultVersion("1")
			.usePathSegment(1)
			.setVersionParser(new ApiVersionParser());
			
		
	}

}
