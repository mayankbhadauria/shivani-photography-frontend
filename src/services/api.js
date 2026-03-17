import axios from "axios";
import { getIdToken } from "./auth";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

class PhotoAPI {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds for large uploads
    });

    // Attach JWT token to every request
    this.client.interceptors.request.use(async (config) => {
      try {
        const token = await getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch {
        // No session — request will fail with 401 from backend
      }
      return config;
    });

    // On 401, dispatch event so App.js can redirect to login
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          window.dispatchEvent(new Event('auth:expired'));
        }
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.client.get("/api/health");
      return response.data;
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  }

  // Get a page of images (limit=10 by default)
  async getImages(offset = 0) {
    try {
      const params = { limit: 10, offset };
      const response = await this.client.get("/api/images", { params });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch images:", error);
      throw error;
    }
  }

  // Upload multiple images directly to S3 via presigned URLs
  async uploadImages(files, onProgress = null) {
    try {
      // Step 1: get presigned URLs from backend
      const fileInfos = files.map((f) => ({
        filename: f.name,
        content_type: f.type || "image/jpeg",
      }));
      const { data } = await this.client.post("/api/presigned-upload", { files: fileInfos });

      // Step 2: upload each file directly to S3, max 3 concurrent
      let completed = 0;
      const CONCURRENCY = 3;
      const uploadBatch = async (batch, startIdx) => {
        await Promise.all(
          batch.map(async (urlInfo, batchIdx) => {
            await axios.put(urlInfo.url, files[startIdx + batchIdx], {
              headers: { "Content-Type": urlInfo.content_type },
            });
            completed++;
            if (onProgress) onProgress(Math.round((completed / data.urls.length) * 100));
          })
        );
      };
      for (let i = 0; i < data.urls.length; i += CONCURRENCY) {
        await uploadBatch(data.urls.slice(i, i + CONCURRENCY), i);
      }

      // Generate thumbnails for uploaded images
      const uploadedKeys = data.urls.map(u => u.key);
      try {
        await this.client.post("/api/process-thumbnails", { keys: uploadedKeys });
      } catch (e) {
        console.warn("Thumbnail generation failed (non-fatal):", e);
      }

      return {
        status: "completed",
        message: `Upload completed: ${data.urls.length}/${files.length} files successful`,
        summary: { total_files: files.length, successful: data.urls.length, failed: files.length - data.urls.length },
      };
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  }

  async deleteImage(imageKey) {
    try {
      const response = await this.client.delete(`/api/images/${imageKey}`);
      return response.data;
    } catch (error) {
      console.error("Delete failed:", error);
      throw error;
    }
  }
}

export const photoAPI = new PhotoAPI();
