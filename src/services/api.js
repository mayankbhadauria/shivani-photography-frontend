import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

class PhotoAPI {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds for large uploads
    });
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

  // Get all images
  async getImages() {
    try {
      const response = await this.client.get("/api/images");
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

      // Step 2: upload each file directly to S3
      let completed = 0;
      await Promise.all(
        data.urls.map(async (urlInfo, i) => {
          await axios.put(urlInfo.url, files[i], {
            headers: { "Content-Type": urlInfo.content_type },
          });
          completed++;
          if (onProgress) onProgress(Math.round((completed / data.urls.length) * 100));
        })
      );

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
