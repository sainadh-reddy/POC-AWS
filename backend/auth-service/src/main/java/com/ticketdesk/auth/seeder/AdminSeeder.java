package com.ticketdesk.auth.seeder;

import com.ticketdesk.auth.entity.UserAccount;
import com.ticketdesk.auth.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds a default ADMIN account on startup if none exists.
 * Credentials: admin@ticketdesk.com / admin123
 */
@Component
public class AdminSeeder implements ApplicationRunner {

    private final UserRepository userRepository;

    public AdminSeeder(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!userRepository.existsByEmail("admin@ticketdesk.com")) {
            userRepository.save(new UserAccount(
                    "System Administrator",
                    "admin@ticketdesk.com",
                    "admin123",
                    UserAccount.Role.ADMIN
            ));
            System.out.println("[Auth] Default ADMIN seeded -> admin@ticketdesk.com / admin123");
        }

        if (!userRepository.existsByEmail("agent1@ticketdesk.com")) {
            userRepository.save(new UserAccount(
                    "Alex Agent (IT Support)",
                    "agent1@ticketdesk.com",
                    "agent123",
                    UserAccount.Role.AGENT
            ));
            System.out.println("[Auth] Default AGENT seeded -> agent1@ticketdesk.com / agent123");
        }

        if (!userRepository.existsByEmail("user1@ticketdesk.com")) {
            userRepository.save(new UserAccount(
                    "Sarah User (Employee)",
                    "user1@ticketdesk.com",
                    "user123",
                    UserAccount.Role.USER
            ));
            System.out.println("[Auth] Default USER seeded -> user1@ticketdesk.com / user123");
        }
    }
}
