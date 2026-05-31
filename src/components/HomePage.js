import React, { useEffect, useState, useRef } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import { photoAPI } from "../services/api";
import SharedNav from "./SharedNav";

/* ─── Design tokens ──────────────────────────────────── */
const T = {
  cream:  "#fdf8f3",
  white:  "#ffffff",
  black:  "#111111",
  mid:    "#6b6155",
  light:  "#a89e92",
  border: "#e8e3dc",
};

/* ─── Global reset for this page ─────────────────────── */
const GlobalHome = createGlobalStyle`
  body { background: ${T.cream}; margin: 0; }
`;

/* ─── Category definitions ──────────────────────────── */
// Edit labels here freely; coverIndex = which loaded image to use as cover
const CATEGORIES = [
  { id: "family-portraits",  label: "FAMILY PORTRAITS" },
  { id: "maternity",         label: "MATERNITY" },
  { id: "newborn",           label: "NEWBORN" },
  { id: "brands-and-events", label: "BRANDS & EVENTS" },
];

/* ─── Styled components ──────────────────────────────── */
/* Hero */
const Hero = styled.section`
  padding-top: 90px;
  background: ${T.cream};
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  justify-content: center;
`;

const HeroFrame = styled.div`
  width: min(88vw, 1200px);
  aspect-ratio: 16/9;
  overflow: hidden;
  position: relative;
  background: #d8d0c8;

  img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }

  @media (max-width: 768px) {
    aspect-ratio: 4/3;
    width: 94vw;
  }
`;

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.12);
`;

const HeroText = styled.h1`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(1.4rem, 3.5vw, 2.8rem);
  font-weight: 200;
  color: #fff;
  text-align: center;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  line-height: 1.4;
  text-shadow: 0 2px 24px rgba(0,0,0,0.3);
  padding: 0 32px;
  margin: 0;
`;

const HeroPlaceholder = styled.div`
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: #d0c8be;
  color: #b8b0a4;
  font-size: 60px;
`;

const scrollPulse = keyframes`
  0%, 100% { opacity: 0.3; transform: scaleY(0.8); }
  50% { opacity: 0.9; transform: scaleY(1); }
`;

const ScrollHint = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 28px;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 9px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: ${T.light};

  .line {
    width: 1px;
    height: 36px;
    background: ${T.light};
    animation: ${scrollPulse} 2s ease-in-out infinite;
    transform-origin: top;
  }
`;

const HeroBookBtn = styled.button`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 10px; font-weight: 300;
  letter-spacing: 0.32em; text-transform: uppercase;
  background: ${T.black}; color: #fff;
  border: none; padding: 14px 36px;
  cursor: pointer; transition: background 0.25s;
  margin-top: 32px;
  &:hover { background: #333; }
`;

/* Portfolio section */
const PortfolioSection = styled.section`
  background: ${T.white};
  padding: 100px 0 120px;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 80px;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 9px;
  letter-spacing: 0.45em;
  text-transform: uppercase;
  color: ${T.light};
`;

const PortfolioGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 80px;
  column-gap: 80px;

  @media (max-width: 1024px) { padding: 0 40px; column-gap: 40px; }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 0 24px;
    gap: 60px;
  }
`;

const CategoryItem = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;

  /* Stagger right-column items downward */
  &:nth-child(even) {
    margin-top: 120px;
    @media (max-width: 768px) { margin-top: 0; }
  }

  &:hover .cat-img img { transform: scale(1.03); }
  &:hover .view-gallery-label { color: ${T.black}; }
`;

const CatImageWrap = styled.div`
  overflow: hidden;
  background: #d8d0c8;
  aspect-ratio: 3/4;
  margin-bottom: 28px;

  &.cat-img {
    img {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.7s ease;
    }
  }
`;

const ViewGalleryLabel = styled.div`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 9px;
  font-weight: 300;
  letter-spacing: 0.42em;
  text-transform: uppercase;
  color: ${T.light};
  margin-bottom: 14px;
  transition: color 0.25s;
`;

const CategoryLabel = styled.div`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(1.5rem, 2.5vw, 2.4rem);
  font-weight: 200;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: ${T.black};
  line-height: 1.2;
`;

/* Footer */
const FooterLinksSection = styled.section`
  background: ${T.cream};
  padding: 80px 10% 80px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 40px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 60px 28px;
    gap: 48px;
  }
`;

const FooterLinkCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FooterLinkLabel = styled.div`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 9px;
  font-weight: 300;
  letter-spacing: 0.38em;
  text-transform: uppercase;
  color: ${T.light};
`;

const FooterLinkHeading = styled.button`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(1.2rem, 2vw, 1.8rem);
  font-weight: 200;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${T.black};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-align: left;
  transition: color 0.2s;
  &:hover { color: ${T.mid}; }
`;

const FooterDivider = styled.div`
  height: 1px;
  background: ${T.border};
  margin: 0;
`;

const FooterIgSection = styled.div`
  background: ${T.cream};
  padding: 64px 0 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const FooterIgIcon = styled.div`
  color: ${T.mid};
  font-size: 20px;
  line-height: 1;
`;

const FooterIgHandle = styled.div`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 10px;
  font-weight: 300;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: ${T.mid};
`;

const FooterBottom = styled.footer`
  background: ${T.cream};
  border-top: 1px solid ${T.border};
  padding: 24px 48px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  @media (max-width: 768px) { padding: 20px 24px; }
`;

const FooterBottomRow1 = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FooterBottomNav = styled.div`
  display: flex;
  gap: 28px;
  @media (max-width: 600px) { gap: 16px; flex-wrap: wrap; }
`;

const FooterBottomLink = styled.button`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 9px;
  font-weight: 300;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${T.mid};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
  &:hover { color: ${T.black}; }
`;

const FooterTopBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${T.mid};
  font-size: 16px;
  padding: 0;
  transition: color 0.2s;
  &:hover { color: ${T.black}; }
`;

const FooterBottomRow2 = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FooterCopy = styled.span`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 9px;
  font-weight: 300;
  letter-spacing: 0.12em;
  color: ${T.light};
`;

const FooterSocial = styled.a`
  color: ${T.mid};
  font-size: 14px;
  text-decoration: none;
  transition: color 0.2s;
  &:hover { color: ${T.black}; }
`;

/* ─── About section ──────────────────────────────────── */
const AboutSection = styled.section`
  background: ${T.cream};
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 80vh;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const AboutText = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80px 80px 80px 10%;
  @media (max-width: 768px) { padding: 60px 28px; order: 2; }
`;

const SmallLabel = styled.div`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 9px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: ${T.light};
  margin-bottom: 20px;
`;

const BigHeading = styled.h2`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  font-weight: 200;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: ${T.black};
  line-height: 1.25;
  margin: 0 0 24px;
`;

const BodyText = styled.p`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 300;
  line-height: 2;
  color: ${T.mid};
  max-width: 420px;
  margin: 0 0 32px;
`;

const TextLink = styled.button`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 9px;
  font-weight: 300;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: ${T.black};
  background: none;
  border: none;
  border-bottom: 1px solid ${T.black};
  padding-bottom: 4px;
  cursor: pointer;
  align-self: flex-start;
  transition: color 0.2s;
  &:hover { color: ${T.mid}; border-color: ${T.mid}; }
`;

const FramedPhoto = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: ${T.cream};
  @media (max-width: 768px) { order: 1; padding: 40px 28px 0; }
`;

const PhotoFrame = styled.div`
  border: 1px solid ${T.border};
  padding: 10px;
  background: ${T.white};
  width: 100%;
  max-width: 420px;

  img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
    aspect-ratio: 3/4;
  }

  .ph {
    width: 100%;
    aspect-ratio: 3/4;
    background: #d8d0c8;
    display: flex; align-items: center; justify-content: center;
    color: #b8b0a4; font-size: 60px;
  }
`;

/* ─── Contact section ────────────────────────────────── */
const ContactSection = styled(AboutSection)``;

const ContactText = styled(AboutText)``;

/* ─── Static highlight URLs — predictable CloudFront paths ───
   Pre-seeding these means all homepage images render on first paint
   without waiting for the /api/highlights API call.
   onError handlers hide broken imgs (shows container bg) if not uploaded yet. */
const CF = 'https://shivanijadonphotography.com/gallery/highlights';
const INITIAL_HIGHLIGHTS = {
  hero:         `${CF}/hero.webp`,
  'hero-mobile': `${CF}/hero-mobile.webp`,
  about:        `${CF}/about.webp`,
  contact:      `${CF}/contact.webp`,
};
const INITIAL_COVERS = {
  'family-portraits':  `${CF}/cover-family-portraits.webp`,
  'maternity':         `${CF}/cover-maternity.webp`,
  'newborn':           `${CF}/cover-newborn.webp`,
  'brands-and-events': `${CF}/cover-brands-and-events.webp`,
};

/* ─── Component ──────────────────────────────────────── */
const HomePage = ({ onViewGallery, onPortfolio, onAbout, onInfo, onReservation, onContact, onBooking, onHome }) => {
  const [coverImages, setCoverImages] = useState(INITIAL_COVERS);
  const [highlights,  setHighlights]  = useState(INITIAL_HIGHLIGHTS);
  const [visibility,  setVisibility]  = useState({});
  const heroRef = useRef(null);

  useEffect(() => {
    // Single API call replaces: getHighlights() + getVisibility() + up to 4x getCategoryImages()
    photoAPI.getHomepageData()
      .then(data => {
        if (data.highlights) {
          const h = Object.fromEntries(Object.entries(data.highlights).filter(([, v]) => v));
          setHighlights(prev => ({ ...prev, ...h }));
        }
        if (data.covers) {
          const c = Object.fromEntries(Object.entries(data.covers).filter(([, v]) => v));
          setCoverImages(prev => ({ ...prev, ...c }));
        }
        if (data.visibility) setVisibility(data.visibility);
      })
      .catch(() => {});
  }, []);

  const heroCover = highlights.hero || null;

  return (
    <>
      <GlobalHome />
      <SharedNav active="home" nav={{ onHome, onPortfolio, onAbout, onInfo, onContact, onBooking }} />

      {/* ── Hero ── */}
      <Hero ref={heroRef}>
        <HeroFrame>
          {heroCover
            ? <><img
                src={heroCover}
                srcSet={`${highlights['hero-mobile'] || heroCover} 1200w, ${heroCover} 2400w`}
                sizes="(max-width: 768px) 94vw, min(88vw, 1200px)"
                alt="Hero"
                fetchpriority="high"
                loading="eager"
              /><HeroOverlay><HeroText>Hi, Soo glad you are here!</HeroText></HeroOverlay></>
            : <HeroPlaceholder>▣</HeroPlaceholder>
          }
        </HeroFrame>
        <HeroBookBtn onClick={onBooking}>Book My Session</HeroBookBtn>
        <ScrollHint>
          <div className="line" />
          <span>Scroll</span>
        </ScrollHint>
      </Hero>

      {/* ── Portfolio Grid ── */}
      <PortfolioSection>
        <SectionHeader>Portfolio</SectionHeader>

        <PortfolioGrid>
          {CATEGORIES.filter(cat => visibility[cat.id] !== false).map((cat) => {
            const cover = coverImages[cat.id] || null;
            return (
              <CategoryItem key={cat.id} onClick={() => onViewGallery(cat.id)}>
                <CatImageWrap className="cat-img">
                  {cover
                    ? <img src={cover} alt={cat.label} loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
                    : <div style={{ width:"100%", height:"100%", background:"#d8d0c8", display:"flex", alignItems:"center", justifyContent:"center", color:"#b8b0a4", fontSize:48 }}>▣</div>
                  }
                </CatImageWrap>
                <ViewGalleryLabel className="view-gallery-label">View Gallery</ViewGalleryLabel>
                <CategoryLabel>{cat.label}</CategoryLabel>
              </CategoryItem>
            );
          })}
        </PortfolioGrid>
      </PortfolioSection>

      {/* ── About section ── */}
      <AboutSection id="about-section">
        <AboutText>
          <SmallLabel>A Portrait Photographer</SmallLabel>
          <BigHeading>Hello,{"\n"}I am Shivani</BigHeading>
          <BodyText>
            A mom, nature lover, light seeker and a self-taught photographer
            obsessed to capture fleeting moments!
          </BodyText>
          <TextLink onClick={onAbout}>More About Me</TextLink>
        </AboutText>
        <FramedPhoto>
          <PhotoFrame>
            {highlights.about
              ? <img src={highlights.about} alt="About Shivani" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
              : <div className="ph">▣</div>
            }
          </PhotoFrame>
        </FramedPhoto>
      </AboutSection>

      {/* ── Contact section ── */}
      <ContactSection id="contact-section">
        <ContactText>
          <SmallLabel>Can you picture yourself in my photos?</SmallLabel>
          <BigHeading>If you see beauty{"\n"}the way I do,{"\n"}let's work together!</BigHeading>
          <TextLink onClick={onContact}>Contact Me</TextLink>
        </ContactText>
        <FramedPhoto>
          <PhotoFrame>
            {highlights.contact
              ? <img src={highlights.contact} alt="Contact" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
              : <div className="ph">▣</div>
            }
          </PhotoFrame>
        </FramedPhoto>
      </ContactSection>

      {/* ── Footer links ── */}
      <FooterLinksSection>
        <FooterLinkCol>
          <FooterLinkLabel>Meet Shivani</FooterLinkLabel>
          <FooterLinkHeading onClick={onAbout}>About</FooterLinkHeading>
        </FooterLinkCol>
        <FooterLinkCol>
          <FooterLinkLabel>View Packages</FooterLinkLabel>
          <FooterLinkHeading onClick={onReservation}>Session Info</FooterLinkHeading>
        </FooterLinkCol>
        <FooterLinkCol>
          <FooterLinkLabel>Book Your Date</FooterLinkLabel>
          <FooterLinkHeading onClick={onContact}>Contact Me</FooterLinkHeading>
        </FooterLinkCol>
      </FooterLinksSection>

      <FooterDivider />

      {/* ── Instagram handle ── */}
      <a href="https://instagram.com/shivanijadonphotography" target="_blank" rel="noopener noreferrer" style={{textDecoration:'none',color:'inherit'}}>
        <FooterIgSection>
          <FooterIgIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
            </svg>
          </FooterIgIcon>
          <FooterIgHandle>@shivanijadonphotography</FooterIgHandle>
        </FooterIgSection>
      </a>

      {/* ── Bottom bar ── */}
      <FooterBottom>
        <FooterBottomRow1>
          <FooterBottomNav>
            <FooterBottomLink onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</FooterBottomLink>
            <FooterBottomLink onClick={onAbout}>About</FooterBottomLink>
            <FooterBottomLink onClick={onInfo}>Info</FooterBottomLink>
            <FooterBottomLink onClick={onPortfolio}>Portfolio</FooterBottomLink>
            <FooterBottomLink onClick={onContact}>Get in Touch</FooterBottomLink>
          </FooterBottomNav>
          <FooterTopBtn onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Back to top">↑</FooterTopBtn>
        </FooterBottomRow1>
        <FooterBottomRow2>
          <FooterCopy>© {new Date().getFullYear()} shivanijadonphotography</FooterCopy>
          <FooterSocial href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </FooterSocial>
        </FooterBottomRow2>
      </FooterBottom>
    </>
  );
};

export default HomePage;
