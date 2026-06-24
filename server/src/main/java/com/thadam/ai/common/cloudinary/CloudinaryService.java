package com.thadam.ai.common.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);
    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Uploads a base64 encoded image string to Cloudinary.
     *
     * @param base64Image the base64 string (e.g. "data:image/png;base64,iVBORw0KGgo...")
     * @return the secure URL of the uploaded image
     */
    public String uploadBase64Image(String base64Image) {
        try {
            if (base64Image == null || !base64Image.startsWith("data:image")) {
                return null;
            }
            Map uploadResult = cloudinary.uploader().upload(base64Image, ObjectUtils.asMap("folder", "avatars"));
            return uploadResult.get("secure_url").toString();
        } catch (Exception e) {
            log.error("Failed to upload image to Cloudinary", e);
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, 
                "Image upload failed: Invalid Cloudinary configuration. Please verify your CLOUDINARY_URL in .env", e);
        }
    }
}
