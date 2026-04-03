package com.sheildX.proj;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SheidXApplication {

	public static void main(String[] args) {
		SpringApplication.run(SheidXApplication.class, args);
	}

}
