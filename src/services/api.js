import axios from "axios";
import { getIdToken } from "./auth";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

class PhotoAPI {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    // Attach JWT to every request
    this.client.interceptors.request.use(async (config) => {
      try {
        const token = await getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch {
        // No session — request will fail with 401
      }
      return config;
    });

    // 401 → dispatch event so App.js signs out
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

  // ── Health ──────────────────────────────────────────────────────────
  async healthCheck() {
    const response = await this.client.get("/api/health");
    return response.data;
  }

  // ── Highlights (hero / about / contact images) ──────────────────────
  async getHighlights() {
    const response = await this.client.get("/api/highlights");
    return response.data;
  }

  async uploadHighlight(slot, file) {
    // Get presigned URL
    const { data } = await this.client.get(`/api/highlights/${slot}/presigned`);
    // Upload directly to S3
    await axios.put(data.url, file, { headers: { "Content-Type": "image/jpeg" } });
    return data;
  }

  // ── Category gallery ────────────────────────────────────────────────
  async getCategoryImages(category, offset = 0) {
    const response = await this.client.get(`/api/gallery/${category}`, {
      params: { limit: 10, offset },
    });
    return response.data;
  }

  async uploadToCategory(category, files, onProgress = null) {
    // Step 1: get presigned URLs
    const fileInfos = files.map((f) => ({
      filename:     f.name,
      content_type: f.type || "image/jpeg",
    }));
    const { data } = await this.client.post(
      `/api/gallery/${category}/presigned-upload`,
      { files: fileInfos }
    );

    // Step 2: upload directly to S3, max 3 concurrent
    let completed = 0;
    const CONCURRENCY = 3;
    for (let i = 0; i < data.urls.length; i += CONCURRENCY) {
      const batch = data.urls.slice(i, i + CONCURRENCY);
      await Promise.all(
        batch.map(async (urlInfo, batchIdx) => {
          await axios.put(urlInfo.url, files[i + batchIdx], {
            headers: { "Content-Type": urlInfo.content_type },
          });
          completed++;
          if (onProgress) onProgress(Math.round((completed / data.urls.length) * 100));
        })
      );
    }

    // Step 3: generate thumbnails + display images
    const uploadedKeys = data.urls.map((u) => u.key);
    try {
      await this.client.post(`/api/gallery/${category}/process-thumbnails`, {
        keys: uploadedKeys,
      });
    } catch (e) {
      console.warn("Thumbnail generation failed (non-fatal):", e);
    }

    return {
      status:  "completed",
      summary: {
        total_files: files.length,
        successful:  data.urls.length,
        failed:      files.length - data.urls.length,
      },
    };
  }

  async getBrandsAndEvents() {
    const response = await this.client.get("/api/gallery/brands-and-events");
    return response.data;
  }

  async reprocessDisplayImages(category) {
    const response = await this.client.post(`/api/gallery/${category}/reprocess-display`);
    return response.data;
  }

  async deleteFromCategory(category, filename) {
    const response = await this.client.delete(
      `/api/gallery/${category}/${filename}`
    );
    return response.data;
  }

  // ── Legacy flat-list endpoints (kept for backward compat) ────────────
  async getImages(offset = 0) {
    const response = await this.client.get("/api/images", {
      params: { limit: 10, offset },
    });
    return response.data;
  }

  async uploadImages(files, onProgress = null) {
    const fileInfos = files.map((f) => ({
      filename:     f.name,
      content_type: f.type || "image/jpeg",
    }));
    const { data } = await this.client.post("/api/presigned-upload", { files: fileInfos });

    let completed = 0;
    const CONCURRENCY = 3;
    for (let i = 0; i < data.urls.length; i += CONCURRENCY) {
      await Promise.all(
        data.urls.slice(i, i + CONCURRENCY).map(async (urlInfo, batchIdx) => {
          await axios.put(urlInfo.url, files[i + batchIdx], {
            headers: { "Content-Type": urlInfo.content_type },
          });
          completed++;
          if (onProgress) onProgress(Math.round((completed / data.urls.length) * 100));
        })
      );
    }

    const uploadedKeys = data.urls.map((u) => u.key);
    try {
      await this.client.post("/api/process-thumbnails", { keys: uploadedKeys });
    } catch (e) {
      console.warn("Thumbnail generation failed (non-fatal):", e);
    }

    return {
      status:  "completed",
      summary: { total_files: files.length, successful: data.urls.length, failed: files.length - data.urls.length },
    };
  }

  async deleteImage(imageKey) {
    const response = await this.client.delete(`/api/images/${imageKey}`);
    return response.data;
  }
}

export const photoAPI = new PhotoAPI();
