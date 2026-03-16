import React, { useState, useEffect, useCallback } from "react";
import ImageGallery from "react-image-gallery";
import JSZip from "jszip";
import styled from "styled-components";
import { photoAPI } from "../services/api";
import UploadZone from "./uploadZone";
import Header from "./header";
import { getUserGroups } from "../services/auth";
import "react-image-gallery/styles/css/image-gallery.css";

const GalleryContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;

  /* Prevent right-click save on images */
  img {
    -webkit-user-drag: none;
    user-select: none;
    pointer-events: none;
  }

  /* Re-enable pointer events on thumbnails so they're clickable */
  .image-gallery-thumbnail {
    pointer-events: all;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 400px;

  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  p {
    margin-top: 20px;
    font-size: 18px;
    color: #666;
  }
`;

const EmptyGallery = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  margin: 20px 0;

  h2 { color: #333; font-size: 2rem; margin-bottom: 10px; }
  p { color: #666; font-size: 18px; margin-bottom: 30px; }
  .icon { font-size: 4rem; margin-bottom: 20px; opacity: 0.5; }
`;

const GalleryStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px 25px;
  border-radius: 10px;
  margin: 20px 0;
  font-size: 14px;
  color: #666;
  flex-wrap: wrap;
  gap: 10px;

  .stat {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-group {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  button {
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.3s;

    &:disabled {
      background: #ccc !important;
      cursor: not-allowed;
    }
  }

  .refresh-btn { background: #007bff; &:hover:not(:disabled) { background: #0056b3; } }
  .signout-btn { background: #6c757d; &:hover:not(:disabled) { background: #545b62; } }
  .select-all-btn { background: #17a2b8; &:hover:not(:disabled) { background: #117a8b; } }
  .bulk-download-btn { background: #28a745; &:hover:not(:disabled) { background: #1e7e34; } }
`;

const GalleryWrapper = styled.div`
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin: 20px 0;

  .image-gallery {
    border-radius: 10px;
    overflow: hidden;
  }
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DeleteBtn = styled(ActionButton)`
  background: rgba(220, 53, 69, 0.85);
  &:hover:not(:disabled) { background: rgba(185, 28, 45, 0.95); }
`;

const DownloadBtn = styled(ActionButton)`
  background: rgba(40, 167, 69, 0.85);
  &:hover:not(:disabled) { background: rgba(30, 126, 52, 0.95); }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 10px;
  margin: 20px 0;
  text-align: center;
`;

const ThumbInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    width: 100%;
    height: 70px;
    object-fit: cover;
  }

  .thumb-checkbox {
    margin-top: 5px;
    width: 16px;
    height: 16px;
    cursor: pointer;
    pointer-events: all;
    accent-color: #28a745;
  }
`;

const fetchWithRetry = async (url, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.blob();
    } catch (err) {
      if (attempt === retries) throw err;
    }
  }
};

const Gallery = ({ onSignOut }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [apiHealth, setApiHealth] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [downloading, setDownloading] = useState(false);
  const [bulkDownloading, setBulkDownloading] = useState(false);

  useEffect(() => {
    checkApiHealth();
    loadImages();
    getUserGroups().then((groups) => setIsAdmin(groups.includes("Admin")));
  }, []);

  const checkApiHealth = async () => {
    try {
      const health = await photoAPI.healthCheck();
      setApiHealth(health);
      if (!health.s3_connected) {
        setError("S3 connection failed. Please check your AWS configuration.");
      }
    } catch {
      setError("Cannot connect to API server. Make sure the backend is running.");
    }
  };

  const loadImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await photoAPI.getImages();
      const fetchedImages = response.images.map((img) => ({
        original: img.original,
        thumbnail: img.thumbnail,
        description: `Uploaded: ${new Date(img.last_modified).toLocaleDateString()}`,
        originalWidth: 1200,
        originalHeight: 800,
        imageKey: img.key,
        size: img.size,
      }));
      setImages(fetchedImages);
      setSelectedKeys(new Set());
    } catch {
      setError("Failed to load images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const result = await photoAPI.uploadImages(files);
      if (result.summary.successful > 0) {
        setTimeout(() => loadImages(), 2000);
        alert(`Successfully uploaded ${result.summary.successful} out of ${result.summary.total_files} images!`);
      }
      if (result.summary.failed > 0) {
        alert(`Warning: ${result.summary.failed} images failed to upload.`);
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    const image = images[currentIndex];
    if (!window.confirm("Delete this photo?")) return;
    try {
      await photoAPI.deleteImage(image.imageKey);
      setImages((prev) => prev.filter((_, i) => i !== currentIndex));
      setCurrentIndex((prev) => Math.max(0, prev - 1));
      setSelectedKeys((prev) => { const n = new Set(prev); n.delete(image.imageKey); return n; });
    } catch {
      setError("Failed to delete image. Please try again.");
    }
  };

  const handleDownload = async () => {
    const image = images[currentIndex];
    setDownloading(true);
    setError(null);
    try {
      const blob = await fetchWithRetry(image.original);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = image.imageKey.split("/").pop();
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Download failed after 2 retries. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedKeys.size === 0) return;
    setBulkDownloading(true);
    setError(null);
    try {
      const zip = new JSZip();
      const selected = images.filter((img) => selectedKeys.has(img.imageKey));
      const results = await Promise.allSettled(
        selected.map(async (img) => {
          const blob = await fetchWithRetry(img.original);
          zip.file(img.imageKey.split("/").pop(), blob);
        })
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) setError(`${failed} image(s) failed to download and were skipped.`);
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "photos.zip";
      a.click();
      URL.revokeObjectURL(url);
      setSelectedKeys(new Set());
    } catch {
      setError("Bulk download failed. Please try again.");
    } finally {
      setBulkDownloading(false);
    }
  };

  const toggleSelect = useCallback((imageKey, e) => {
    e.stopPropagation();
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      next.has(imageKey) ? next.delete(imageKey) : next.add(imageKey);
      return next;
    });
  }, []);

  const toggleSelectAll = () => {
    if (selectedKeys.size === images.length) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(images.map((img) => img.imageKey)));
    }
  };

  const renderThumbInner = useCallback((item) => (
    <ThumbInner>
      <img src={item.thumbnail} alt="" draggable={false} />
      <input
        type="checkbox"
        className="thumb-checkbox"
        checked={selectedKeys.has(item.imageKey)}
        onChange={(e) => toggleSelect(item.imageKey, e)}
        onClick={(e) => e.stopPropagation()}
      />
    </ThumbInner>
  ), [selectedKeys, toggleSelect]);

  if (loading) {
    return (
      <GalleryContainer>
        <Header />
        <LoadingSpinner>
          <div className="spinner"></div>
          <p>Loading your beautiful photographs...</p>
        </LoadingSpinner>
      </GalleryContainer>
    );
  }

  return (
    <GalleryContainer onContextMenu={(e) => e.preventDefault()}>
      <Header apiHealth={apiHealth} />
      {error && <ErrorMessage>❌ {error}</ErrorMessage>}
      {isAdmin && <UploadZone onUpload={handleUpload} uploading={uploading} />}
      <GalleryStats>
        <div className="stat">
          📸 <strong>{images.length}</strong> photo{images.length !== 1 ? "s" : ""} in gallery
        </div>
        <div className="stat">
          💾 Total size: <strong>{(images.reduce((t, img) => t + (img.size || 0), 0) / 1024 / 1024).toFixed(1)} MB</strong>
        </div>
        <div className="btn-group">
          {images.length > 0 && (
            <>
              <button className="select-all-btn" onClick={toggleSelectAll}>
                {selectedKeys.size === images.length ? "Deselect All" : "Select All"}
              </button>
              {selectedKeys.size > 0 && (
                <button
                  className="bulk-download-btn"
                  onClick={handleBulkDownload}
                  disabled={bulkDownloading}
                >
                  {bulkDownloading ? "Zipping..." : `⬇ Download Selected (${selectedKeys.size})`}
                </button>
              )}
            </>
          )}
          <button className="refresh-btn" onClick={loadImages} disabled={loading}>🔄 Refresh</button>
          <button className="signout-btn" onClick={onSignOut}>Sign Out</button>
        </div>
      </GalleryStats>
      {images.length === 0 ? (
        <EmptyGallery>
          <div className="icon">📷</div>
          <h2>No Photos Yet</h2>
          <p>Upload your first photos to start building your beautiful portfolio!</p>
        </EmptyGallery>
      ) : (
        <GalleryWrapper style={{ position: "relative" }}>
          <ActionButtons>
            <DownloadBtn onClick={handleDownload} disabled={downloading}>
              {downloading ? "..." : "⬇ Download"}
            </DownloadBtn>
            {isAdmin && <DeleteBtn onClick={handleDelete}>🗑 Delete</DeleteBtn>}
          </ActionButtons>
          <ImageGallery
            items={images}
            showPlayButton={false}
            showFullscreenButton={true}
            showThumbnails={true}
            thumbnailPosition="bottom"
            slideDuration={450}
            slideInterval={2000}
            showIndex={true}
            showBullets={false}
            infinite={true}
            lazyLoad={true}
            additionalClass="custom-image-gallery"
            onSlide={(index) => setCurrentIndex(index)}
            renderThumbInner={renderThumbInner}
          />
        </GalleryWrapper>
      )}
    </GalleryContainer>
  );
};

export default Gallery;
