import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import { photoAPI } from "../services/api";

const T = {
  cream:  "#fdf8f3",
  white:  "#ffffff",
  black:  "#111111",
  mid:    "#6b6155",
  light:  "#a89e92",
  border: "#e8e3dc",
  red:    "#c0392b",
  green:  "#27ae60",
};

const CATEGORIES = [
  { id: "maternity",        label: "Maternity" },
  { id: "family-kids",      label: "Family & Kids" },
  { id: "brand-shoot",      label: "Brand Shoot" },
  { id: "creative-portrait",label: "Creative Portrait" },
];

const HIGHLIGHT_SLOTS = [
  { id: "hero",    label: "Hero",    desc: "Home page full-width banner image" },
  { id: "about",   label: "About",   desc: "About section portrait photo" },
  { id: "contact", label: "Contact", desc: "Contact section photo" },
  { id: "login",   label: "Login",   desc: "Login page left panel photo" },
];

/* ── Styled ─────────────────────────────────────────────────────── */
const Page = styled.div`
  min-height: 100vh;
  background: ${T.cream};
  font-family: 'Montserrat', sans-serif;
`;

const TopBar = styled.div`
  background: ${T.white};
  border-bottom: 1px solid ${T.border};
  padding: 16px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky; top: 0; z-index: 100;
`;

const Logo = styled.div`
  font-size: 11px;
  font-weight: 300;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: ${T.black};
`;

const TopBtn = styled.button`
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  font-weight: 300;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  background: none;
  border: 1px solid ${T.border};
  color: ${T.mid};
  padding: 8px 20px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: ${T.black}; color: ${T.black}; }
`;

const Tabs = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 1px solid ${T.border};
  background: ${T.white};
  padding: 0 40px;
  overflow-x: auto;
`;

const Tab = styled.button`
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  font-weight: 300;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? T.black : 'transparent'};
  color: ${props => props.active ? T.black : T.light};
  padding: 16px 24px;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s;
  &:hover { color: ${T.black}; }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  @media (max-width: 768px) { padding: 24px 16px; }
`;

const SectionTitle = styled.div`
  font-size: 10px;
  letter-spacing: 0.38em;
  text-transform: uppercase;
  color: ${T.light};
  margin-bottom: 24px;
`;

/* Upload zone */
const DropArea = styled.div`
  border: 1px dashed ${props => props.active ? T.black : T.border};
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s;
  background: ${props => props.active ? 'rgba(0,0,0,0.02)' : T.white};
  margin-bottom: 32px;

  p { margin: 0; font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase; color: ${T.light}; }
  p.main { color: ${T.mid}; margin-bottom: 6px; }
  &:hover { border-color: ${T.mid}; }
`;

const ProgressBar = styled.div`
  height: 2px;
  background: ${T.border};
  margin-bottom: 32px;
  .fill {
    height: 100%;
    background: ${T.black};
    transition: width 0.3s;
    width: ${props => props.pct}%;
  }
`;

/* Photo grid */
const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
`;

const PhotoCard = styled.div`
  position: relative;
  aspect-ratio: 1;
  background: ${T.border};
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0);
    display: flex; align-items: flex-end; justify-content: flex-end;
    padding: 8px;
    transition: background 0.2s;
  }
  &:hover .overlay { background: rgba(0,0,0,0.35); }

  .del-btn {
    background: rgba(192,57,43,0.9);
    border: none; border-radius: 50%;
    width: 32px; height: 32px;
    color: white; font-size: 14px;
    cursor: pointer; display: flex;
    align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.2s;
  }
  &:hover .del-btn { opacity: 1; }
`;

const StatusMsg = styled.div`
  font-size: 11px;
  letter-spacing: 0.08em;
  color: ${props => props.error ? T.red : T.green};
  margin-bottom: 16px;
  text-align: center;
`;

const LoadMore = styled.button`
  font-family: 'Montserrat', sans-serif;
  font-size: 9px; font-weight: 300;
  letter-spacing: 0.3em; text-transform: uppercase;
  background: none; border: 1px solid ${T.border};
  color: ${T.mid}; padding: 12px 32px;
  cursor: pointer; margin-top: 24px;
  display: block; margin-left: auto; margin-right: auto;
  transition: all 0.2s;
  &:hover { background: ${T.black}; border-color: ${T.black}; color: ${T.white}; }
`;

/* Highlights */
const HighlightGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
`;

const HighlightSlot = styled.div`
  background: ${T.white};
  border: 1px solid ${T.border};
  padding: 24px;

  .slot-label {
    font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;
    color: ${T.black}; margin-bottom: 4px; font-weight: 400;
  }
  .slot-desc {
    font-size: 10px; color: ${T.light}; letter-spacing: 0.06em;
    margin-bottom: 16px;
  }
  .preview {
    width: 100%; aspect-ratio: 4/3; object-fit: cover;
    display: block; margin-bottom: 16px; background: ${T.border};
  }
  .no-preview {
    width: 100%; aspect-ratio: 4/3;
    background: ${T.cream}; display: flex;
    align-items: center; justify-content: center;
    color: ${T.light}; font-size: 9px;
    letter-spacing: 0.2em; text-transform: uppercase;
    margin-bottom: 16px;
  }
`;

const UploadHighlightBtn = styled.label`
  display: block; text-align: center;
  font-family: 'Montserrat', sans-serif;
  font-size: 9px; font-weight: 300;
  letter-spacing: 0.25em; text-transform: uppercase;
  padding: 12px; border: 1px solid ${T.border};
  color: ${T.mid}; cursor: pointer; transition: all 0.2s;
  &:hover { background: ${T.black}; border-color: ${T.black}; color: ${T.white}; }
  input { display: none; }
`;

/* ── Category tab content ────────────────────────────────────────── */
const CategoryTab = ({ category }) => {
  const [images,     setImages]     = useState([]);
  const [hasMore,    setHasMore]    = useState(false);
  const [nextOffset, setNextOffset] = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [status,     setStatus]     = useState(null); // {msg, error}

  const loadImages = useCallback(async (offset = 0, append = false) => {
    try {
      const res = await photoAPI.getCategoryImages(category, offset);
      setImages(prev => append ? [...prev, ...(res.images || [])] : (res.images || []));
      setHasMore(res.has_more);
      setNextOffset(res.next_offset);
    } catch { /* silently ignore */ }
  }, [category]);

  useEffect(() => { loadImages(0); }, [loadImages]);

  const onDrop = useCallback(async (files) => {
    if (!files.length) return;
    setUploading(true); setProgress(0); setStatus(null);
    try {
      const result = await photoAPI.uploadToCategory(category, files, setProgress);
      setStatus({ msg: `Uploaded ${result.summary.successful} photo${result.summary.successful !== 1 ? 's' : ''}` });
      await loadImages(0);
    } catch (e) {
      setStatus({ msg: "Upload failed. Please try again.", error: true });
    } finally {
      setUploading(false); setProgress(0);
    }
  }, [category, loadImages]);

  const handleDelete = async (filename) => {
    if (!window.confirm("Delete this photo?")) return;
    try {
      await photoAPI.deleteFromCategory(category, filename);
      setImages(prev => prev.filter(img => img.id !== filename));
    } catch {
      setStatus({ msg: "Delete failed.", error: true });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: true,
    disabled: uploading,
  });

  return (
    <>
      <DropArea {...getRootProps()} active={isDragActive}>
        <input {...getInputProps()} />
        <p className="main">{isDragActive ? "Drop photos here" : "Drag & drop photos here"}</p>
        <p>or click to select files · JPG, PNG, WEBP</p>
      </DropArea>

      {uploading && (
        <ProgressBar pct={progress}>
          <div className="fill" />
        </ProgressBar>
      )}

      {status && <StatusMsg error={status.error}>{status.msg}</StatusMsg>}

      <SectionTitle>{images.length} photo{images.length !== 1 ? 's' : ''} in this category</SectionTitle>

      <PhotoGrid>
        {images.map(img => (
          <PhotoCard key={img.id}>
            <img src={img.thumbnail} alt="" />
            <div className="overlay">
              <button className="del-btn" onClick={() => handleDelete(img.id)} title="Delete">🗑</button>
            </div>
          </PhotoCard>
        ))}
      </PhotoGrid>

      {hasMore && (
        <LoadMore onClick={() => loadImages(nextOffset, true)}>Load more</LoadMore>
      )}
    </>
  );
};

/* ── Highlights tab ─────────────────────────────────────────────── */
const HighlightsTab = () => {
  const [highlights, setHighlights] = useState({});
  const [uploading,  setUploading]  = useState({});
  const [status,     setStatus]     = useState(null);

  useEffect(() => {
    photoAPI.getHighlights().then(setHighlights).catch(() => {});
  }, []);

  const handleHighlightUpload = async (slot, file) => {
    setUploading(prev => ({ ...prev, [slot]: true }));
    setStatus(null);
    try {
      await photoAPI.uploadHighlight(slot, file);
      // Reload with cache-bust
      const newUrl = `${await getHighlightUrl(slot)}?t=${Date.now()}`;
      setHighlights(prev => ({ ...prev, [slot]: newUrl }));
      setStatus({ msg: `${slot} image updated` });
    } catch {
      setStatus({ msg: `Failed to upload ${slot} image.`, error: true });
    } finally {
      setUploading(prev => ({ ...prev, [slot]: false }));
    }
  };

  const getHighlightUrl = async (slot) => {
    const res = await photoAPI.getHighlights();
    return res[slot];
  };

  return (
    <>
      <SectionTitle>Single highlight images — used on home, about, and contact sections</SectionTitle>
      {status && <StatusMsg error={status.error}>{status.msg}</StatusMsg>}
      <HighlightGrid>
        {HIGHLIGHT_SLOTS.map(({ id, label, desc }) => (
          <HighlightSlot key={id}>
            <div className="slot-label">{label}</div>
            <div className="slot-desc">{desc}</div>
            {highlights[id]
              ? <img className="preview" src={highlights[id]} alt={label} />
              : <div className="no-preview">No image set</div>
            }
            <UploadHighlightBtn>
              {uploading[id] ? "Uploading..." : "Replace Image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading[id]}
                onChange={e => { if (e.target.files[0]) handleHighlightUpload(id, e.target.files[0]); }}
              />
            </UploadHighlightBtn>
          </HighlightSlot>
        ))}
      </HighlightGrid>
    </>
  );
};

/* ── Main AdminPage ─────────────────────────────────────────────── */
const AdminPage = ({ onHome, onSignOut }) => {
  const [activeTab, setActiveTab] = useState("maternity");

  const allTabs = [
    ...CATEGORIES,
    { id: "highlights", label: "Highlights" },
  ];

  return (
    <Page>
      <TopBar>
        <Logo>Admin Panel · Shivani Photography</Logo>
        <div style={{ display: "flex", gap: 12 }}>
          <TopBtn onClick={onHome}>← View Site</TopBtn>
          <TopBtn onClick={onSignOut}>Sign Out</TopBtn>
        </div>
      </TopBar>

      <Tabs>
        {allTabs.map(tab => (
          <Tab key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </Tab>
        ))}
      </Tabs>

      <Content>
        {activeTab === "highlights"
          ? <HighlightsTab />
          : <CategoryTab key={activeTab} category={activeTab} />
        }
      </Content>
    </Page>
  );
};

export default AdminPage;
