import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import SharedNav from "./SharedNav";
import { photoAPI } from "../services/api";

const T = {
  cream: "#fdf8f3", white: "#ffffff", black: "#111111",
  mid: "#6b6155", light: "#a89e92", border: "#e8e3dc",
};

const GlobalPortfolio = createGlobalStyle`body { background: ${T.white}; margin: 0; }`;
const Page = styled.div`min-height: 100vh; background: ${T.white};`;

const Header = styled.section`
  padding: 140px 10% 64px;
  @media (max-width: 768px) { padding: 120px 28px 48px; }
`;

const Label = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 9px; font-weight: 300;
  letter-spacing: 0.42em; text-transform: uppercase;
  color: ${T.light}; margin-bottom: 20px;
`;

const PageTitle = styled.h1`
  font-family: 'Montserrat', sans-serif;
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
  aspect-ratio: 4 / 3;
  overflow: hidden;
  cursor: pointer;
  background: #1a1a1a;

  img {
    width: 100%; height: 100%;
    object-fit: cover;
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
  font-family: 'Montserrat', sans-serif;
  font-size: 9px; font-weight: 300;
  letter-spacing: 0.42em; text-transform: uppercase;
  color: rgba(255,255,255,0.6);
  margin-bottom: 8px;
`;

const TileName = styled.div`
  font-family: 'Montserrat', sans-serif;
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
  font-family: 'Montserrat', sans-serif;
  font-size: 9px; font-weight: 300;
  letter-spacing: 0.12em; color: ${T.light};
  @media (max-width: 768px) { padding: 16px 24px; }
`;

const PORTFOLIO_CATS = [
  { id: "maternity",         apiId: "maternity",  label: "Maternity",        num: "01" },
  { id: "newborn",           apiId: "newborn",    label: "Newborn",           num: "02" },
  { id: "family-portraits",  apiId: "family-portraits", label: "Family Portraits", num: "03" },
  { id: "brands-and-events", apiId: null,         label: "Brands & Events",  num: "04" },
];

const PortfolioPage = (props) => {
  const { onViewGallery } = props;
  const [covers, setCovers] = useState({});

  useEffect(() => {
    // Fetch first image from each single category as cover
    const fetchCovers = async () => {
      const results = {};
      await Promise.allSettled(
        PORTFOLIO_CATS
          .filter(c => c.apiId)
          .map(async (cat) => {
            try {
              const res = await photoAPI.getCategoryImages(cat.apiId, 0);
              const imgs = res.images || [];
              if (imgs[0]) results[cat.id] = imgs[0].thumbnail || imgs[0].display;
            } catch { /* no cover */ }
          })
      );
      // For brands-and-events, try brands first
      try {
        const res = await photoAPI.getCategoryImages("brands", 0);
        const imgs = res.images || [];
        if (imgs[0]) results["brands-and-events"] = imgs[0].thumbnail || imgs[0].display;
      } catch { /* no cover */ }
      setCovers(results);
    };
    fetchCovers();
  }, []);

  return (
    <Page>
      <GlobalPortfolio />
      <SharedNav active="portfolio" nav={props} isAdmin={props.isAdmin} />

      <Header>
        <Label>Work</Label>
        <PageTitle>Portfolio</PageTitle>
      </Header>

      <Grid>
        {PORTFOLIO_CATS.map((cat) => (
          <Tile key={cat.id} onClick={() => onViewGallery(cat.id)}>
            {covers[cat.id]
              ? <img src={covers[cat.id]} alt={cat.label} />
              : <TilePlaceholder />
            }
            <TileOverlay>
              <TileLabel>{cat.num}</TileLabel>
              <TileName>{cat.label}</TileName>
            </TileOverlay>
          </Tile>
        ))}
      </Grid>

      <FooterBar>
        <span>© {new Date().getFullYear()} shivanijadonphotography</span>
        <span>@shivanijadonphotography</span>
      </FooterBar>
    </Page>
  );
};

export default PortfolioPage;
