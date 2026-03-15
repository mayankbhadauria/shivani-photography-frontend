import React, { useState, useEffect } from "react";
import ImageGallery from "react-image-gallery";
import styled from "styled-components";
import { photoAPI } from "../services/api";
import UploadZone from "./uploadZone";
import Header from "./header";
import "react-image-gallery/styles/css/image-gallery.css";

const GalleryContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
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
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
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

  h2 {
    color: #333;
    font-size: 2rem;
    margin-bottom: 10px;
  }

  p {
    color: #666;
    font-size: 18px;
    margin-bottom: 30px;
  }

  .icon {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.5;
  }
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

  .stat {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .refresh-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.3s;

    &:hover {
      background: #0056b3;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
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

const DeleteButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
  background: rgba(220, 53, 69, 0.85);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(185, 28, 45, 0.95);
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 10px;
  margin: 20px 0;
  text-align: center;
`;

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [apiHealth, setApiHealth] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    checkApiHealth();
    loadImages();
  }, []);

  const checkApiHealth = async () => {
    try {
      const health = await photoAPI.healthCheck();
      setApiHealth(health);
      if (!health.s3_connected) {
        setError("S3 connection failed. Please check your AWS configuration.");
      }
    } catch (error) {
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
    } catch (error) {
      setError("Failed to load images. Please try again.");
      console.error("Load images error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const result = await photoAPI.uploadImages(files, (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });

      if (result.summary.successful > 0) {
        // Reload images after successful upload
        setTimeout(() => {
          loadImages();
        }, 2000); // Give time for thumbnail generation
        // Show success message
        alert(`Successfully uploaded ${result.summary.successful} out of ${result.summary.total_files} images!`);
      }

      if (result.summary.failed > 0) {
        alert(`Warning: ${result.summary.failed} images failed to upload. Check console for details.`);
        console.error("Upload failures:", result.details.filter((r) => !r.success));
      }
    } catch (error) {
      setError("Upload failed. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    const image = images[currentIndex];
    if (!window.confirm(`Delete this photo?`)) return;
    try {
      await photoAPI.deleteImage(image.imageKey);
      setImages((prev) => prev.filter((_, i) => i !== currentIndex));
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError("Failed to delete image. Please try again.");
    }
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

  return (
    <GalleryContainer>
      <Header apiHealth={apiHealth} />
      {error && <ErrorMessage>❌ {error}</ErrorMessage>}
      <UploadZone onUpload={handleUpload} uploading={uploading} />
      <GalleryStats>
        <div className="stat">
          📸 <strong>{images.length}</strong> photo{images.length !== 1 ? "s" : ""} in gallery
        </div>
        <div className="stat">
          💾 Total size: <strong>{(images.reduce((total, img) => total + (img.size || 0), 0) / 1024 / 1024).toFixed(1)} MB</strong>
        </div>
        <button className="refresh-btn" onClick={loadImages} disabled={loading}>
          🔄 Refresh
        </button>
      </GalleryStats>
      {images.length === 0 ? (
        <EmptyGallery>
          <div className="icon">📷</div>
          <h2>No Photos Yet</h2>
          <p>Upload your first photos to start building your beautiful portfolio!</p>
        </EmptyGallery>
      ) : (
        <GalleryWrapper style={{ position: "relative" }}>
          <DeleteButton onClick={handleDelete}>🗑 Delete</DeleteButton>
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
          />
        </GalleryWrapper>
      )}
    </GalleryContainer>
  );
};

export default Gallery;
