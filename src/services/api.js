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

  // Upload multiple images
  async uploadImages(files, onProgress = null) {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await this.client.post("/api/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  }

  // Delete image (future enhancement)
  async deleteImage(imageKey) {
    try {
      const response = await this.client.delete(`/api/images/${encodeURIComponent(imageKey)}`);
      return response.data;
    } catch (error) {
      console.error("Delete failed:", error);
      throw error;
    }
  }
}

export const photoAPI = new PhotoAPI();
