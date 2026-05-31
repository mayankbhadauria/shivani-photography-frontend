import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import SharedNav from "./SharedNav";
import GetInTouch from "./GetInTouch";
import { photoAPI } from "../services/api";

const T = {
  cream: "#fdf8f3", white: "#ffffff", black: "#111111",
  mid: "#6b6155", light: "#a89e92", border: "#e8e3dc",
};

const GlobalPortfolio = createGlobalStyle`body { background: ${T.white}; margin: 0; }`;
const Page = styled.div`min-height: 100vh; background: ${T.white};`;

const Header = styled.section`
  padding: 110px 10% 64px;
  @media (max-width: 768px) { padding: 100px 28px 48px; }
`;

const Label = styled.div`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 9px; font-weight: 300;
  letter-spacing: 0.42em; text-transform: uppercase;
  color: ${T.light}; margin-bottom: 20px;
`;

const PageTitle = styled.h1`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 200; letter-spacing: 0.18em;
  text-transform: uppercase; color: ${T.black};
  margin: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  padding: 0 0 80px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const Tile = styled.div`
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  cursor: pointer;
  background: #1a1a1a;

  img {
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: center top;
    display: block;
    transition: transform 0.7s ease, opacity 0.4s;
    opacity: 0.72;
  }

  &:hover img {
    transform: scale(1.04);
    opacity: 0.55;
  }
`;

const TileOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 36px 40px;
  @media (max-width: 768px) { padding: 24px 24px; }
`;

const TileLabel = styled.div`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 9px; font-weight: 300;
  letter-spacing: 0.42em; text-transform: uppercase;
  color: rgba(255,255,255,0.6);
  margin-bottom: 8px;
`;

const TileName = styled.div`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(1.4rem, 2.6vw, 2.2rem);
  font-weight: 200; letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #ffffff;
  line-height: 1.2;
`;

const TilePlaceholder = styled.div`
  width: 100%; height: 100%;
  background: ${T.border};
`;

const FooterBar = styled.footer`
  background: ${T.cream};
  border-top: 1px solid ${T.border};
  padding: 20px 48px;
  display: flex; justify-content: space-between; align-items: center;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 9px; font-weight: 300;
  letter-spacing: 0.12em; color: ${T.light};
  @media (max-width: 768px) { padding: 16px 24px; }
`;

const PORTFOLIO_CATS = [
  { id: "family-portraits",  apiId: "family-portraits", label: "Family Portraits", num: "01" },
  { id: "maternity",         apiId: "maternity",        label: "Maternity",        num: "02" },
  { id: "newborn",           apiId: "newborn",          label: "Newborn",          num: "03" },
  { id: "brands-and-events", apiId: null,               label: "Brands & Events",  num: "04" },
];

const CF_H = 'https://shivanijadonphotography.com/gallery/highlights';
const INITIAL_COVERS = {
  'family-portraits':  `${CF_H}/cover-family-portraits.webp`,
  'maternity':         `${CF_H}/cover-maternity.webp`,
  'newborn':           `${CF_H}/cover-newborn.webp`,
  'brands-and-events': `${CF_H}/cover-brands-and-events.webp`,
};

const PortfolioPage = (props) => {
  const { onViewGallery } = props;
  const [covers,     setCovers]     = useState(INITIAL_COVERS);
  const [visibility, setVisibility] = useState(null);

  useEffect(() => {
    // Single API call replaces: getVisibility() + getHighlights() + up to 4x getCategoryImages()
    photoAPI.getHomepageData()
      .then(data => {
        if (data.visibility) setVisibility(data.visibility);
        if (data.covers) {
          const c = Object.fromEntries(Object.entries(data.covers).filter(([, v]) => v));
          setCovers(prev => ({ ...prev, ...c }));
        }
      })
      .catch(() => setVisibility({}));
  }, []);

  return (
    <Page>
      <GlobalPortfolio />
      <SharedNav active="portfolio" nav={props} />

      <Header>
        <Label>Work</Label>
        <PageTitle>Portfolio</PageTitle>
      </Header>

      <Grid>
        {PORTFOLIO_CATS.filter(cat => visibility === null || visibility[cat.id] !== false).map((cat) => (
          <Tile key={cat.id} onClick={() => onViewGallery(cat.id)}>
            {covers[cat.id]
              ? <img src={covers[cat.id]} alt={cat.label} onError={(e) => { e.target.style.display = 'none'; }} />
              : <TilePlaceholder />
            }
            <TileOverlay>
              <TileLabel>{cat.num}</TileLabel>
              <TileName>{cat.label}</TileName>
            </TileOverlay>
          </Tile>
        ))}
      </Grid>

      <GetInTouch onContact={props.onContact} />

      <FooterBar>
        <span>© {new Date().getFullYear()} shivanijadonphotography</span>
        <a href="https://instagram.com/shivanijadonphotography" target="_blank" rel="noopener noreferrer" style={{color:'inherit',textDecoration:'none',borderBottom:'1px solid currentColor'}}>@shivanijadonphotography</a>
      </FooterBar>
    </Page>
  );
};

export default PortfolioPage;
