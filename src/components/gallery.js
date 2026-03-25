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
    label:   "Maternity",
    heading: "Capturing Motherhood",
    tagline: "Every curve, every glow — the magic of new life beautifully told.",
  },
  "newborn": {
    label:   "Newborn",
    heading: "New Beginnings",
    tagline: "Those tiny fingers, fleeting moments — captured forever in their first days.",
  },
  "family-portraits": {
    label:   "Family Portraits",
    heading: "Family Stories",
    tagline: "Genuine laughter, little hands, real moments that last a lifetime.",
  },
  "brands-and-events": {
    label:   "Brands & Events",
    heading: "Brands & Events",
    tagline: "Elevating your brand and celebrating your milestones with images that endure.",
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
  max-width: min(92vw, 1800px);
  max-height: 92vh;
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

  const src = images[index]?.original || images[index]?.display || images[index]?.thumbnail;

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

/* ─── Helpers ─────────────────────────────────────────── */
const SectionDivider = styled.div`
  padding: 56px 80px 32px;
  @media (max-width: 768px) { padding: 40px 24px 20px; }
`;
const SectionLabel = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 9px; font-weight: 300;
  letter-spacing: 0.46em; text-transform: uppercase;
  color: ${T.light}; margin: 0 0 4px;
`;
const SectionTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(1.6rem, 3vw, 2.6rem);
  font-weight: 200; letter-spacing: 0.18em;
  text-transform: uppercase; color: ${T.black};
  margin: 0;
`;

function MasonryGrid({ images, offset, onOpen }) {
  const left  = images.filter((_, i) => i % 2 === 0);
  const right = images.filter((_, i) => i % 2 === 1);
  return (
    <GridWrap>
      <Column>
        {left.map((img, i) => (
          <PhotoItem key={img.id} onClick={() => onOpen(offset + i * 2)}>
            <img src={img.display || img.thumbnail} alt="" loading="lazy" />
            <div className="overlay" />
          </PhotoItem>
        ))}
      </Column>
      <Column>
        {right.map((img, i) => (
          <PhotoItem key={img.id} onClick={() => onOpen(offset + i * 2 + 1)}>
            <img src={img.display || img.thumbnail} alt="" loading="lazy" />
            <div className="overlay" />
          </PhotoItem>
        ))}
      </Column>
    </GridWrap>
  );
}

/* ─── Gallery page ────────────────────────────────────── */
const Gallery = ({ category, onSignOut, onHome, onPortfolio }) => {
  const [images,     setImages]     = useState([]);
  const [hasMore,    setHasMore]    = useState(false);
  const [nextOffset, setNextOffset] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [lightbox,   setLightbox]   = useState(null);
  // brands-and-events specific
  const [brandsImgs, setBrandsImgs] = useState([]);
  const [eventsImgs, setEventsImgs] = useState([]);
  const allImages = useRef([]);

  const isCombined = category === "brands-and-events";

  const meta = CAT_META[category] || { label: category, heading: category, tagline: "" };

  const fetchPage = useCallback(async (offset = 0, append = false) => {
    try {
      const res = await photoAPI.getCategoryImages(category, offset);
      const imgs = res.images || [];
      if (append) {
        allImages.current = [...allImages.current, ...imgs];
      } else {
        allImages.current = imgs;
      }
      setImages([...allImages.current]);
      setHasMore(res.has_more || false);
      setNextOffset(res.next_offset ?? null);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [category]);

  const fetchCombined = useCallback(async () => {
    try {
      const res = await photoAPI.getBrandsAndEvents();
      const brands = res.brands || [];
      const events = res.events || [];
      setBrandsImgs(brands);
      setEventsImgs(events);
      allImages.current = [...brands, ...events];
      setImages([...allImages.current]);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setImages([]);
    allImages.current = [];
    if (isCombined) fetchCombined();
    else fetchPage(0, false);
  }, [isCombined, fetchCombined, fetchPage]);

  const openLightbox  = useCallback((idx) => setLightbox(idx), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prevLightbox  = useCallback(() => setLightbox(i => (i - 1 + allImages.current.length) % allImages.current.length), []);
  const nextLightbox  = useCallback(() => setLightbox(i => (i + 1) % allImages.current.length), []);

  return (
    <>
      <GlobalGallery />

      <Nav>
        <NavLeft>
          <NavBtn onClick={onPortfolio || onHome}>← Portfolio</NavBtn>
        </NavLeft>
        <NavLogo>Shivani Photography</NavLogo>
        <NavRight>
          <NavBtn onClick={onSignOut}>Sign Out</NavBtn>
        </NavRight>
      </Nav>

      <GalleryHeader>
        <HeaderLabel>{meta.label}</HeaderLabel>
        <HeaderTitle>{meta.heading}</HeaderTitle>
        {meta.tagline && <HeaderTagline>{meta.tagline}</HeaderTagline>}
      </GalleryHeader>

      {loading ? (
        <LoadingWrap>Loading</LoadingWrap>
      ) : isCombined ? (
        /* ── Brands & Events two-section layout ── */
        <>
          <SectionDivider>
            <SectionLabel>Section 01</SectionLabel>
            <SectionTitle>Brands</SectionTitle>
          </SectionDivider>
          {brandsImgs.length === 0
            ? <LoadingWrap>No brand photos yet</LoadingWrap>
            : <MasonryGrid images={brandsImgs} offset={0} onOpen={openLightbox} />
          }

          <SectionDivider>
            <SectionLabel>Section 02</SectionLabel>
            <SectionTitle>Events</SectionTitle>
          </SectionDivider>
          {eventsImgs.length === 0
            ? <LoadingWrap>No event photos yet</LoadingWrap>
            : <MasonryGrid images={eventsImgs} offset={brandsImgs.length} onOpen={openLightbox} />
          }
        </>
      ) : images.length === 0 ? (
        <LoadingWrap>No photos yet</LoadingWrap>
      ) : (
        <>
          <MasonryGrid images={images} offset={0} onOpen={openLightbox} />
          {hasMore && (
            <LoadMoreWrap>
              <LoadMoreBtn onClick={() => fetchPage(nextOffset, true)}>Load more</LoadMoreBtn>
            </LoadMoreWrap>
          )}
        </>
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
