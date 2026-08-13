package com.ticketdesk.attachment.controller;

import com.ticketdesk.attachment.dto.ApiResponse;
import com.ticketdesk.attachment.entity.Attachment;
import com.ticketdesk.attachment.repository.AttachmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attachments")
@CrossOrigin(origins = "*")
public class AttachmentController {

    private static final Logger log = LoggerFactory.getLogger(AttachmentController.class);

    private final AttachmentRepository repo;
    private final S3Client s3Client;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Value("${aws.s3.bucket:}")
    private String s3Bucket;

    public AttachmentController(AttachmentRepository repo, S3Client s3Client) {
        this.repo = repo;
        this.s3Client = s3Client;
    }

    /**
     * POST /api/v1/attachments/ticket/{ticketId}/upload
     * Upload a file to S3 (or local disk fallback) and save metadata to DB.
     */
    @PostMapping("/ticket/{ticketId}/upload")
    public ResponseEntity<ApiResponse<Attachment>> upload(
            @PathVariable Long ticketId,
            @RequestParam("file") MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("File must not be empty"));
        }

        String uniqueName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String storageUrl;

        if (s3Bucket != null && !s3Bucket.isBlank()) {
            String s3Key = "tickets/" + ticketId + "/" + uniqueName;
            log.info("Uploading file {} to S3 bucket {} with key {}", file.getOriginalFilename(), s3Bucket, s3Key);

            PutObjectRequest putReq = PutObjectRequest.builder()
                    .bucket(s3Bucket)
                    .key(s3Key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putReq, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            storageUrl = "s3://" + s3Bucket + "/" + s3Key;
        } else {
            // Local fallback for offline dev
            Path dir = Paths.get(uploadDir, String.valueOf(ticketId));
            Files.createDirectories(dir);
            Path target = dir.resolve(uniqueName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            storageUrl = "/uploads/" + ticketId + "/" + uniqueName;
        }

        // Persist metadata
        Attachment a = new Attachment();
        a.setTicketId(ticketId);
        a.setOriginalFileName(file.getOriginalFilename());
        a.setFileName(uniqueName);
        a.setContentType(file.getContentType());
        a.setFileSize(file.getSize());
        a.setStorageUrl(storageUrl);

        Attachment saved = repo.save(a);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("File uploaded successfully", saved));
    }

    /**
     * GET /api/v1/attachments/ticket/{ticketId}
     * List all attachments for a ticket.
     */
    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<ApiResponse<List<Attachment>>> listByTicket(@PathVariable Long ticketId) {
        List<Attachment> attachments = repo.findByTicketId(ticketId);
        return ResponseEntity.ok(ApiResponse.success("Attachments retrieved", attachments));
    }

    /**
     * GET /api/v1/attachments/{id}/download
     * Stream the file back to the caller from S3 or local disk.
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Attachment a = repo.findById(id).orElse(null);
        if (a == null) {
            return ResponseEntity.notFound().build();
        }

        if (s3Bucket != null && !s3Bucket.isBlank() && a.getStorageUrl() != null && a.getStorageUrl().startsWith("s3://")) {
            try {
                String s3Key = "tickets/" + a.getTicketId() + "/" + a.getFileName();
                log.info("Downloading file from S3 bucket {} key {}", s3Bucket, s3Key);

                GetObjectRequest getReq = GetObjectRequest.builder()
                        .bucket(s3Bucket)
                        .key(s3Key)
                        .build();

                ResponseInputStream<GetObjectResponse> s3Stream = s3Client.getObject(getReq);
                byte[] bytes = s3Stream.readAllBytes();
                ByteArrayResource resource = new ByteArrayResource(bytes);

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(
                                a.getContentType() != null ? a.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE))
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + a.getOriginalFileName() + "\"")
                        .body(resource);
            } catch (Exception e) {
                log.error("Failed to download file from S3", e);
                return ResponseEntity.internalServerError().build();
            }
        } else {
            try {
                Path filePath = Paths.get(uploadDir, String.valueOf(a.getTicketId()), a.getFileName());
                Resource resource = new UrlResource(filePath.toUri());
                if (!resource.exists()) {
                    return ResponseEntity.notFound().build();
                }
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(
                                a.getContentType() != null ? a.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE))
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + a.getOriginalFileName() + "\"")
                        .body(resource);
            } catch (MalformedURLException e) {
                return ResponseEntity.internalServerError().build();
            }
        }
    }

    /**
     * DELETE /api/v1/attachments/{id}
     * Delete metadata record and the physical file from S3 or local disk.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        Attachment a = repo.findById(id).orElse(null);
        if (a == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Attachment not found with id: " + id));
        }

        if (s3Bucket != null && !s3Bucket.isBlank() && a.getStorageUrl() != null && a.getStorageUrl().startsWith("s3://")) {
            try {
                String s3Key = "tickets/" + a.getTicketId() + "/" + a.getFileName();
                log.info("Deleting file from S3 bucket {} key {}", s3Bucket, s3Key);
                DeleteObjectRequest deleteReq = DeleteObjectRequest.builder()
                        .bucket(s3Bucket)
                        .key(s3Key)
                        .build();
                s3Client.deleteObject(deleteReq);
            } catch (Exception e) {
                log.warn("Could not delete S3 object: {}", e.getMessage());
            }
        } else {
            try {
                Path filePath = Paths.get(uploadDir, String.valueOf(a.getTicketId()), a.getFileName());
                Files.deleteIfExists(filePath);
            } catch (IOException ignored) { /* best-effort */ }
        }

        repo.delete(a);
        return ResponseEntity.ok(ApiResponse.success("Attachment deleted", null));
    }
}
