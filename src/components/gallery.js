import React, { useState, useEffect, useCallback, useRef } from "react";
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
  background: linear-gradient(135deg, #f0f8ff 0%, #dceefb 100%);
  min-height: 100vh;

  img {
    -webkit-user-drag: none;
    user-select: none;
    pointer-events: none;
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

  p { margin-top: 20px; font-size: 18px; color: #666; }
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

  .stats-left { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
  .stat { display: flex; align-items: center; gap: 8px; }
  .btn-group { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-left: auto; }

  button {
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.3s;
    &:disabled { background: #ccc !important; cursor: not-allowed; }
  }

  .refresh-btn       { background: #4a9fd4; &:hover:not(:disabled) { background: #2e86c1; } }
  .signout-btn       { background: #7ab8d9; &:hover:not(:disabled) { background: #4a9fd4; } }
  .select-photos-btn { background: #4a9fd4; &:hover:not(:disabled) { background: #2e86c1; } }
  .select-all-btn    { background: #4a9fd4; &:hover:not(:disabled) { background: #2e86c1; } }
  .bulk-download-btn { background: #2e86c1; &:hover:not(:disabled) { background: #1a6a9f; } }
  .done-btn          { background: #7ab8d9; &:hover:not(:disabled) { background: #4a9fd4; } }
`;

const SelectionBanner = styled.div`
  background: #ddeeff;
  border: 1px solid #90b8f0;
  border-radius: 10px;
  padding: 10px 20px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #0d3d99;
  text-align: center;
`;

const GalleryWrapper = styled.div`
  background: white;
  padding: 20px;
  border-radius: 15px 15px 0 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin: 20px 0 0;

  .image-gallery { border-radius: 10px; overflow: hidden; }
`;

const ThumbnailStrip = styled.div`
  background: white;
  border-radius: 0 0 15px 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 10px 0 14px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 4px;

  .thumb-nav {
    flex-shrink: 0;
    background: none;
    border: none;
    font-size: 78px;
    line-height: 1;
    color: #555;
    cursor: pointer;
    padding: 0 10px;
    pointer-events: all;
    &:disabled { color: #ccc; cursor: default; }
    &:hover:not(:disabled) { color: #007bff; }
  }

  .thumb-list {
    display: flex;
    flex: 1;
    gap: 4px;
    overflow: hidden;
    justify-content: center;
  }

  .thumb-item {
    position: relative;
    width: 125px;
    height: 87px;
    flex-shrink: 0;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    border: 3px solid transparent;
    pointer-events: all;

    &.active { border-color: #337ab7; }
    &:hover:not(.active) { border-color: #aac8e8; }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .thumb-overlay {
      position: absolute;
      inset: 0;
    }
  }
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 10;
  display: flex;
  gap: 8px;
`;

const DeleteBtn = styled.button`
  color: white;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  background: rgba(180, 30, 45, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(180, 30, 45, 0.35);
  &:hover:not(:disabled) { background: rgba(155, 15, 30, 0.95); transform: scale(1.08); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const DownloadFab = styled.button`
  position: absolute;
  bottom: 18px;
  left: 18px;
  z-index: 10;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(74, 159, 212, 0.85);
  color: white;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.15s;
  box-shadow: 0 3px 10px rgba(74, 159, 212, 0.4);
  &:hover:not(:disabled) { background: rgba(46, 134, 193, 0.95); transform: scale(1.08); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 10px;
  margin: 20px 0;
  text-align: center;
`;

const fetchWithRetry = async (url, retries = 2) => {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { mode: "cors", cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.blob();
    } catch (err) {
      lastErr = err;
      console.error(`Download attempt ${attempt + 1} failed for ${url}:`, err);
    }
  }
  throw lastErr;
};

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const THUMBS_VISIBLE = 10;

const Gallery = ({ onSignOut }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [apiHealth, setApiHealth] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextOffset, setNextOffset] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);
  const selectedKeysRef = useRef(new Set());
  const countTimerRef = useRef(null);
  const galleryRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [bulkDownloading, setBulkDownloading] = useState(false);

  // Keep active thumbnail visible in strip when main image changes
  useEffect(() => {
    setThumbStart((s) => {
      if (currentIndex < s) return currentIndex;
      if (currentIndex >= s + THUMBS_VISIBLE) return Math.max(0, currentIndex - THUMBS_VISIBLE + 1);
      return s;
    });
  }, [currentIndex]);

  useEffect(() => {
    checkApiHealth();
    loadImages();
    getUserGroups().then((groups) => setIsAdmin(groups.includes("Admin")));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkApiHealth = async () => {
    try {
      const health = await photoAPI.healthCheck();
      setApiHealth(health);
      if (!health.s3_connected)
        setError("S3 connection failed. Please check your AWS configuration.");
    } catch {
      setError("Cannot connect to API server. Make sure the backend is running.");
    }
  };

  const mapImages = (raw) => raw.map((img) => ({
    original: img.display || img.original,   // carousel shows display size (~300KB)
    downloadUrl: img.original,               // download fetches full original
    thumbnail: img.thumbnail,
    uploadedDate: new Date(img.last_modified).toLocaleDateString(),
    originalWidth: 1200,
    originalHeight: 800,
    imageKey: img.key,
    size: img.size,
  }));

  const loadImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await photoAPI.getImages();
      setImages(mapImages(response.images));
      setHasMore(response.has_more);
      setNextOffset(response.next_token);
      setCurrentIndex(0);
      setThumbStart(0);
      selectedKeysRef.current = new Set();
      setSelectedCount(0);
    } catch {
      setError("Failed to load images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (nextOffset === null || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const response = await photoAPI.getImages(nextOffset);
      setImages((prev) => [...prev, ...mapImages(response.images)]);
      setHasMore(response.has_more);
      setNextOffset(response.next_token);
    } catch {
      setError("Failed to load more images. Please try again.");
    } finally {
      setLoadingMore(false);
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
      if (result.summary.failed > 0)
        alert(`Warning: ${result.summary.failed} images failed to upload.`);
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
      selectedKeysRef.current.delete(image.imageKey);
      setSelectedCount(selectedKeysRef.current.size);
    } catch {
      setError("Failed to delete image. Please try again.");
    }
  };

  const handleDownload = async () => {
    const image = images[currentIndex];
    setDownloading(true);
    setError(null);
    try {
      const blob = await fetchWithRetry(image.downloadUrl);
      triggerDownload(blob, image.imageKey.split("/").pop());
    } catch (err) {
      console.error("Single download failed:", err);
      setError("Download failed after 2 retries. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedKeysRef.current.size === 0) return;
    setBulkDownloading(true);
    setError(null);
    try {
      const zip = new JSZip();
      const selected = images.filter((img) => selectedKeysRef.current.has(img.imageKey));
      const results = await Promise.allSettled(
        selected.map(async (img) => {
          const blob = await fetchWithRetry(img.downloadUrl);
          zip.file(img.imageKey.split("/").pop(), blob);
        })
      );
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed === selected.length) {
        setError("All downloads failed. Check the browser console for details.");
        return;
      }

      if (failed > 0) setError(`${failed} image(s) failed and were skipped.`);

      const fileCount = Object.keys(zip.files).length;
      if (fileCount === 0) {
        setError("Nothing to download — all images failed.");
        return;
      }

      const content = await zip.generateAsync({ type: "blob" });
      triggerDownload(content, "photos.zip");
      selectedKeysRef.current = new Set();
      setSelectedCount(0);
      setSelectionMode(false);
    } catch {
      setError("Bulk download failed. Please try again.");
    } finally {
      setBulkDownloading(false);
    }
  };

  // Instant DOM update — zero React involvement on each tap
  const toggleSelect = useCallback((imageKey, overlayEl) => {
    const next = new Set(selectedKeysRef.current);
    if (next.has(imageKey)) {
      next.delete(imageKey);
      overlayEl.style.background = "transparent";
    } else {
      next.add(imageKey);
      overlayEl.style.background = "rgba(40, 167, 69, 0.4)";
    }
    selectedKeysRef.current = next;
    clearTimeout(countTimerRef.current);
    countTimerRef.current = setTimeout(() => setSelectedCount(next.size), 50);
  }, []);

  const toggleSelectAll = () => {
    const allSelected = selectedKeysRef.current.size === images.length;
    const next = allSelected ? new Set() : new Set(images.map((img) => img.imageKey));
    selectedKeysRef.current = next;
    const bg = allSelected ? "transparent" : "rgba(26, 86, 196, 0.45)";
    document.querySelectorAll(".thumb-overlay").forEach((el) => { el.style.background = bg; });
    setSelectedCount(next.size);
  };

  const exitSelectionMode = () => {
    clearTimeout(countTimerRef.current);
    selectedKeysRef.current = new Set();
    setSelectedCount(0);
    setSelectionMode(false);
  };

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

  const currentImage = images[currentIndex];
  const totalSizeMB = (images.reduce((t, img) => t + (img.size || 0), 0) / 1024 / 1024).toFixed(1);
  const currentSizeMB = currentImage ? (currentImage.size / 1024 / 1024).toFixed(2) : null;

  return (
    <GalleryContainer onContextMenu={isAdmin ? undefined : (e) => e.preventDefault()}>
      <Header apiHealth={apiHealth} isAdmin={isAdmin} />
      {error && <ErrorMessage>❌ {error}</ErrorMessage>}
      {isAdmin && <UploadZone onUpload={handleUpload} uploading={uploading} />}

      <GalleryStats>
        <div className="stats-left">
          {isAdmin && (
            <div className="stat">
              📸 <strong>{images.length}</strong> photo{images.length !== 1 ? "s" : ""} loaded
              {hasMore && <span style={{ color: "#aaa", marginLeft: 6, fontSize: 13 }}>(more available)</span>}
            </div>
          )}
          {isAdmin && (
            <div className="stat">
              💾 Total: <strong>{totalSizeMB} MB</strong>
              {currentSizeMB && (
                <span style={{ marginLeft: 12, color: "#444" }}>
                  | This image: <strong>{currentSizeMB} MB</strong>
                </span>
              )}
            </div>
          )}
          {isAdmin && currentImage && (
            <div className="stat" style={{ color: "#888", fontSize: 13 }}>
              🗓 Uploaded: <strong>{currentImage.uploadedDate}</strong>
            </div>
          )}
        </div>
        <div className="btn-group">
          {images.length > 0 && !selectionMode && (
            <button className="select-photos-btn" onClick={() => setSelectionMode(true)}>
              ☑ Select Photos
            </button>
          )}
          {selectionMode && (
            <>
              <button className="select-all-btn" onClick={toggleSelectAll}>
                {selectedCount === images.length ? "Deselect All" : "Select All"}
              </button>
              <button
                className="bulk-download-btn"
                onClick={handleBulkDownload}
                disabled={bulkDownloading || selectedCount === 0}
              >
                {bulkDownloading ? "Zipping..." : `⬇ Download (${selectedCount})`}
              </button>
              <button className="done-btn" onClick={exitSelectionMode}>
                ✕ Done
              </button>
            </>
          )}
          <button className="refresh-btn" onClick={loadImages} disabled={loading}>
            🔄 Refresh
          </button>
          <button className="signout-btn" onClick={onSignOut}>
            Sign Out
          </button>
        </div>
      </GalleryStats>

      {selectionMode && (
        <SelectionBanner>
          Selection mode — tap thumbnails to select. {selectedCount > 0 ? `${selectedCount} selected.` : "None selected yet."}
        </SelectionBanner>
      )}

      {images.length === 0 ? (
        <EmptyGallery>
          <div className="icon">📷</div>
          <h2>No Photos Yet</h2>
          <p>Upload your first photos to start building your beautiful portfolio!</p>
        </EmptyGallery>
      ) : (
        <>
          <GalleryWrapper style={{ position: "relative" }}>
            {!selectionMode && (
              <>
                {isAdmin && (
                  <ActionButtons>
                    <DeleteBtn onClick={handleDelete} title="Delete">🗑</DeleteBtn>
                  </ActionButtons>
                )}
                <DownloadFab onClick={handleDownload} disabled={downloading} title="Download">
                  {downloading ? "…" : "↓"}
                </DownloadFab>
              </>
            )}
            <ImageGallery
              ref={galleryRef}
              items={images.map((img) => ({
                ...img,
                description: isAdmin ? `Uploaded: ${img.uploadedDate}` : undefined,
              }))}
              showPlayButton={false}
              showFullscreenButton={!selectionMode}
              showThumbnails={false}
              slideDuration={450}
              slideInterval={2000}
              showIndex={true}
              showBullets={false}
              infinite={true}
              lazyLoad={true}
              additionalClass="custom-image-gallery"
              onSlide={(index) => setCurrentIndex(index)}
            />
          </GalleryWrapper>

          {/* Custom thumbnail carousel — fully independent of main image nav */}
          <ThumbnailStrip>
            <button
              className="thumb-nav"
              onClick={() => setThumbStart((s) => Math.max(0, s - 1))}
              disabled={thumbStart === 0}
            >
              ‹
            </button>
            <div className="thumb-list">
              {images.slice(thumbStart, thumbStart + THUMBS_VISIBLE).map((img, i) => {
                const imgIdx = thumbStart + i;
                const isSelected = selectedKeysRef.current.has(img.imageKey);
                return (
                  <div
                    key={img.imageKey}
                    className={`thumb-item${imgIdx === currentIndex ? " active" : ""}`}
                    onClick={() => {
                      if (!selectionMode) galleryRef.current?.slideToIndex(imgIdx);
                    }}
                  >
                    <img src={img.thumbnail} alt="" draggable={false} />
                    {selectionMode && (
                      <div
                        className="thumb-overlay"
                        style={{ background: isSelected ? "rgba(26, 86, 196, 0.45)" : "transparent" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(img.imageKey, e.currentTarget);
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <button
              className="thumb-nav"
              onClick={() => setThumbStart((s) => Math.min(images.length - THUMBS_VISIBLE, s + 1))}
              disabled={thumbStart + THUMBS_VISIBLE >= images.length}
            >
              ›
            </button>
          </ThumbnailStrip>
        </>
      )}

      {hasMore && (
        <div style={{ textAlign: "center", margin: "16px 0 8px" }}>
          <button
            onClick={loadMore}
            disabled={loadingMore}
            style={{
              background: loadingMore ? "#ccc" : "#4a9fd4",
              color: "white",
              border: "none",
              padding: "10px 28px",
              borderRadius: 6,
              fontSize: 15,
              cursor: loadingMore ? "not-allowed" : "pointer",
            }}
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </GalleryContainer>
  );
};

export default Gallery;
