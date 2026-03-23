import React, { useState, useEffect, useCallback, useRef } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { photoAPI } from "../services/api";

/* ─── Tokens ──────────────────────────────────────────── */
const T = {
  cream:  "#fdf8f3",
  white:  "#ffffff",
  black:  "#111111",
  mid:    "#6b6155",
  light:  "#a89e92",
  border: "#e8e3dc",
};

/* ─── Category meta ───────────────────────────────────── */
const CAT_META = {
  "maternity": {
    label:    "Maternity",
    heading:  "Capturing Motherhood",
    tagline:  "Every curve, every glow — the magic of new life beautifully told.",
  },
  "family-kids": {
    label:    "Family & Kids",
    heading:  "Family Stories",
    tagline:  "Genuine laughter, little hands, real moments that last a lifetime.",
  },
  "creative-portrait": {
    label:    "Creative Portrait",
    heading:  "Creative Portraits",
    tagline:  "Your story, your light — portraits that feel entirely like you.",
  },
  "brand-shoot": {
    label:    "Brand Shoot",
    heading:  "Brand Sessions",
    tagline:  "Elevating your brand with images that speak before you say a word.",
  },
};

/* ─── Styled ──────────────────────────────────────────── */
const GlobalGallery = createGlobalStyle`
  body { background: ${T.white}; margin: 0; }
`;

const Nav = styled.nav`
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 48px;
  background: ${T.white};
  border-bottom: 1px solid ${T.border};
  @media (max-width: 768px) { padding: 16px 20px; }
`;

const NavLeft = styled.div`
  display: flex; gap: 28px; align-items: center;
  @media (max-width: 600px) { gap: 16px; }
`;

const NavBtn = styled.button`
  font-family: 'Montserrat', sans-serif;
  font-size: 10px; font-weight: 300;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: ${T.mid}; background: none; border: none;
  cursor: pointer; padding: 0; transition: color 0.2s;
  &:hover { color: ${T.black}; }
`;

const NavLogo = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px; font-weight: 300;
  letter-spacing: 0.28em; text-transform: uppercase;
  color: ${T.black}; flex: 1; text-align: center;
  @media (max-width: 600px) { font-size: 9px; letter-spacing: 0.15em; }
`;

const NavRight = styled(NavLeft)`justify-content: flex-end;`;

/* Hero / header */
const GalleryHeader = styled.div`
  padding: 140px 80px 64px;
  background: ${T.white};
  @media (max-width: 768px) { padding: 110px 24px 48px; }
`;

const HeaderLabel = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 9px; font-weight: 300;
  letter-spacing: 0.42em; text-transform: uppercase;
  color: ${T.light}; margin-bottom: 16px;
`;

const HeaderTitle = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 200; letter-spacing: 0.18em;
  text-transform: uppercase; color: ${T.black};
  margin: 0 0 20px;
`;

const HeaderTagline = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px; font-weight: 300;
  line-height: 2; color: ${T.mid};
  max-width: 520px; margin: 0;
`;

/* 2-column editorial grid */
const GridWrap = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 12px 80px;
  max-width: 1600px;
  margin: 0 auto;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px; padding: 0 8px 60px;
  }
`;

const Column = styled.div`
  display: flex; flex-direction: column; gap: 12px;
  @media (max-width: 768px) { gap: 8px; }
`;

const PhotoItem = styled.div`
  position: relative; overflow: hidden; cursor: pointer;
  background: #e8e3dc;

  img {
    width: 100%; height: auto;
    display: block;
    transition: transform 0.6s ease;
    user-select: none;
    -webkit-user-drag: none;
  }

  .overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0);
    transition: background 0.3s;
  }

  &:hover img { transform: scale(1.03); }
  &:hover .overlay { background: rgba(0,0,0,0.08); }
`;

/* Load more */
const LoadMoreWrap = styled.div`
  text-align: center; padding: 0 0 80px;
`;

const LoadMoreBtn = styled.button`
  font-family: 'Montserrat', sans-serif;
  font-size: 9px; font-weight: 300;
  letter-spacing: 0.32em; text-transform: uppercase;
  background: none; border: 1px solid ${T.border};
  color: ${T.mid}; padding: 16px 56px; cursor: pointer;
  transition: all 0.25s;
  &:hover { background: ${T.black}; border-color: ${T.black}; color: ${T.white}; }
`;

/* Lightbox */
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;

const LightboxOverlay = styled.div`
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.93);
  display: flex; align-items: center; justify-content: center;
  animation: ${fadeIn} 0.2s ease;
`;

const LightboxInner = styled.div`
  position: relative;
  max-width: min(90vw, 1200px);
  max-height: 90vh;
  display: flex; align-items: center; justify-content: center;

  img {
    max-width: 100%; max-height: 90vh;
    object-fit: contain; display: block;
    user-select: none; -webkit-user-drag: none;
  }
`;

const LbBtn = styled.button`
  position: fixed;
  background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,0.7); font-size: 24px;
  padding: 12px; transition: color 0.2s;
  &:hover { color: #fff; }
`;

const LbClose = styled(LbBtn)`top: 24px; right: 28px; font-size: 28px;`;
const LbPrev  = styled(LbBtn)`left: 20px; top: 50%; transform: translateY(-50%); font-size: 32px;`;
const LbNext  = styled(LbBtn)`right: 20px; top: 50%; transform: translateY(-50%); font-size: 32px;`;

const LbCounter = styled.div`
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  font-family: 'Montserrat', sans-serif;
  font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase;
  color: rgba(255,255,255,0.5);
`;

/* Loading dots */
const LoadingWrap = styled.div`
  padding: 120px 0; text-align: center;
  font-family: 'Montserrat', sans-serif;
  font-size: 9px; letter-spacing: 0.38em; text-transform: uppercase;
  color: ${T.light};
`;

/* ─── Lightbox component ──────────────────────────────── */
const Lightbox = ({ images, index, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")  onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  const src = images[index]?.display || images[index]?.thumbnail;

  return (
    <LightboxOverlay onClick={onClose}>
      <LightboxInner onClick={e => e.stopPropagation()}>
        <img src={src} alt="" />
      </LightboxInner>
      <LbClose onClick={onClose}>✕</LbClose>
      {images.length > 1 && (
        <>
          <LbPrev onClick={onPrev}>‹</LbPrev>
          <LbNext onClick={onNext}>›</LbNext>
        </>
      )}
      <LbCounter>{index + 1} / {images.length}</LbCounter>
    </LightboxOverlay>
  );
};

/* ─── Gallery page ────────────────────────────────────── */
const Gallery = ({ category, onSignOut, onHome }) => {
  const [images,     setImages]     = useState([]);
  const [hasMore,    setHasMore]    = useState(false);
  const [nextOffset, setNextOffset] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [lightbox,   setLightbox]   = useState(null); // index | null
  const [scrolled,   setScrolled]   = useState(false);
  const allImages = useRef([]);

  const meta = CAT_META[category] || {
    label: category,
    heading: category,
    tagline: "",
  };

  const fetchPage = useCallback(async (offset = 0, append = false) => {
    try {
      const res = category
        ? await photoAPI.getCategoryImages(category, offset)
        : await photoAPI.getImages(offset);
      const imgs = res.images || [];
      if (append) {
        allImages.current = [...allImages.current, ...imgs];
      } else {
        allImages.current = imgs;
      }
      setImages([...allImages.current]);
      setHasMore(res.has_more || false);
      setNextOffset(res.next_offset ?? null);
    } catch {
      /* silently ignore */
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    setLoading(true);
    setImages([]);
    allImages.current = [];
    fetchPage(0, false);
  }, [fetchPage]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openLightbox = (idx) => setLightbox(idx);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prevLightbox  = useCallback(() => setLightbox(i => (i - 1 + allImages.current.length) % allImages.current.length), []);
  const nextLightbox  = useCallback(() => setLightbox(i => (i + 1) % allImages.current.length), []);

  /* Split images into 2 columns */
  const leftCol  = images.filter((_, i) => i % 2 === 0);
  const rightCol = images.filter((_, i) => i % 2 === 1);

  return (
    <>
      <GlobalGallery />

      {/* Nav */}
      <Nav>
        <NavLeft>
          <NavBtn onClick={onHome}>← Home</NavBtn>
        </NavLeft>
        <NavLogo>Shivani Photography</NavLogo>
        <NavRight>
          <NavBtn onClick={onSignOut}>Sign Out</NavBtn>
        </NavRight>
      </Nav>

      {/* Header */}
      <GalleryHeader>
        <HeaderLabel>{meta.label}</HeaderLabel>
        <HeaderTitle>{meta.heading}</HeaderTitle>
        {meta.tagline && <HeaderTagline>{meta.tagline}</HeaderTagline>}
      </GalleryHeader>

      {/* Grid */}
      {loading ? (
        <LoadingWrap>Loading</LoadingWrap>
      ) : images.length === 0 ? (
        <LoadingWrap>No photos yet</LoadingWrap>
      ) : (
        <GridWrap>
          <Column>
            {leftCol.map((img, i) => (
              <PhotoItem key={img.id} onClick={() => openLightbox(i * 2)}>
                <img src={img.display || img.thumbnail} alt="" loading="lazy" />
                <div className="overlay" />
              </PhotoItem>
            ))}
          </Column>
          <Column>
            {rightCol.map((img, i) => (
              <PhotoItem key={img.id} onClick={() => openLightbox(i * 2 + 1)}>
                <img src={img.display || img.thumbnail} alt="" loading="lazy" />
                <div className="overlay" />
              </PhotoItem>
            ))}
          </Column>
        </GridWrap>
      )}

      {hasMore && (
        <LoadMoreWrap>
          <LoadMoreBtn onClick={() => fetchPage(nextOffset, true)}>
            Load more
          </LoadMoreBtn>
        </LoadMoreWrap>
      )}

      {lightbox !== null && (
        <Lightbox
          images={allImages.current}
          index={lightbox}
          onClose={closeLightbox}
          onPrev={prevLightbox}
          onNext={nextLightbox}
        />
      )}
    </>
  );
};

export default Gallery;
