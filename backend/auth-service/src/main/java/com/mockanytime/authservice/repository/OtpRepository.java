package com.mockanytime.authservice.repository;

import com.mockanytime.authservice.model.Otp;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends MongoRepository<Otp, String> {
    Optional<Otp> findByIdentifier(String identifier);

    void deleteByIdentifier(String identifier);
}
