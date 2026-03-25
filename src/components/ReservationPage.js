import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import SharedNav from "./SharedNav";
import GetInTouch from "./GetInTouch";
import { photoAPI } from "../services/api";

const T = {
  white: "#ffffff", black: "#111111",
  mid: "#6b6155", light: "#a89e92", border: "#ddd",
};

const GlobalRes = createGlobalStyle`body { background: ${T.white}; margin: 0; }`;
const Page = styled.div`min-height: 100vh; background: ${T.white};`;

/* ── Hero Banner ─────────────────────────────────────────────────── */
const Hero = styled.section`
  position: relative;
  width: 100%;
  height: 58vh;
  min-height: 340px;
  background: #1a1a1a;
  overflow: hidden;
`;

const HeroImg = styled.img`
  width: 100%; height: 100%;
  object-fit: cover;
  opacity: 0.7;
  display: block;
`;

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeroTitle = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-weight: 200;
  font-size: clamp(2.4rem, 6vw, 5.5rem);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${T.white};
  text-align: center;
  line-height: 1.18;
  margin: 0;
`;

/* ── Packages label ──────────────────────────────────────────────── */
const PackagesLabel = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 10px; font-weight: 300;
  letter-spacing: 0.46em; text-transform: uppercase;
  color: ${T.mid};
  padding: 80px 7% 48px;
  @media (max-width: 768px) { padding: 56px 28px 36px; }
`;

/* ── Session Row ─────────────────────────────────────────────────── */
const SessionRow = styled.div`
  display: grid;
  grid-template-columns: ${p => p.$reverse ? "40% 60%" : "60% 40%"};
  min-height: 560px;
  margin-bottom: 80px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    margin-bottom: 60px;
  }
`;

/* Image column — order swaps for reverse rows on mobile */
const ImageCol = styled.div`
  position: relative;
  order: ${p => p.$reverse ? 2 : 1};
  @media (max-width: 900px) { order: 1; }
`;

const SessionImg = styled.img`
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  min-height: 420px;
  @media (max-width: 900px) { min-height: 300px; max-height: 420px; }
`;

/* Thin horizontal rule across the image at ~90% height */
const ImgRule = styled.div`
  position: absolute;
  bottom: 10%;
  left: 0; right: 0;
  height: 1px;
  background: rgba(255,255,255,0.55);
`;

/* Text column */
const TextCol = styled.div`
  order: ${p => p.$reverse ? 1 : 2};
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${p => p.$reverse ? "60px 7% 60px 7%" : "60px 7% 60px 7%"};
  @media (max-width: 900px) { order: 2; padding: 40px 28px; }
`;

const SessionName = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(2rem, 3.8vw, 3.6rem);
  font-weight: 200;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${T.black};
  margin: 0 0 20px;
  line-height: 1.15;
`;

const BookLink = styled.button`
  font-family: 'Montserrat', sans-serif;
  font-size: 10px; font-weight: 300;
  letter-spacing: 0.34em; text-transform: uppercase;
  color: ${T.black};
  background: none; border: none; padding: 0;
  cursor: pointer;
  text-align: left;
  margin-bottom: 52px;
  transition: color 0.2s;
  &:hover { color: ${T.mid}; }
`;

const IdealLabel = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px; font-weight: 300;
  color: ${T.black}; margin: 0 0 10px;
`;

const IdealItem = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px; font-weight: 300;
  color: ${T.mid}; margin: 0 0 6px;
  line-height: 1.9;
`;

const Deliverable = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px; font-weight: 300;
  color: ${T.mid}; margin: 12px 0 0;
  font-style: italic;
`;

/* Placeholder when no image is uploaded yet */
const ImgPlaceholder = styled.div`
  width: 100%; height: 100%;
  min-height: 420px;
  background: #f0ece7;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Montserrat', sans-serif;
  font-size: 10px; font-weight: 300;
  letter-spacing: 0.28em; text-transform: uppercase;
  color: ${T.light};
`;

const FooterBar = styled.footer`
  background: #fdf8f3;
  border-top: 1px solid #e8e3dc;
  padding: 20px 48px;
  display: flex; justify-content: space-between; align-items: center;
  font-family: 'Montserrat', sans-serif;
  font-size: 9px; font-weight: 300;
  letter-spacing: 0.12em; color: ${T.light};
  @media (max-width: 768px) { padding: 16px 24px; }
`;

const ReservationPage = (props) => {
  const { onContact } = props;
  const [images, setImages] = useState({});

  useEffect(() => {
    photoAPI.getHighlights().then(h => setImages(h)).catch(() => {});
  }, []);

  return (
    <Page>
      <GlobalRes />
      <SharedNav active="reservation" nav={props} isAdmin={props.isAdmin} />

      {/* Hero Banner */}
      <Hero>
        {images["reservation-hero"]
          ? <HeroImg src={images["reservation-hero"]} alt="Session Reservation" />
          : null
        }
        <HeroOverlay>
          <HeroTitle>Session<br />Reservation</HeroTitle>
        </HeroOverlay>
      </Hero>

      <PackagesLabel>Packages</PackagesLabel>

      {/* Portrait Session — image left, text right */}
      <SessionRow>
        <ImageCol>
          {images["portrait-session"]
            ? <SessionImg src={images["portrait-session"]} alt="Portrait Session" />
            : <ImgPlaceholder>Portrait Session</ImgPlaceholder>
          }
          <ImgRule />
        </ImageCol>
        <TextCol>
          <SessionName>Portrait Session</SessionName>
          <BookLink onClick={onContact}>Contact for Booking</BookLink>
          <IdealLabel>Ideal for :</IdealLabel>
          <IdealItem>Headshot</IdealItem>
          <IdealItem>Mini session</IdealItem>
          <IdealItem>Studio family portrait</IdealItem>
          <Deliverable>(Provide 5 digitally edited images)</Deliverable>
        </TextCol>
      </SessionRow>

      {/* Standard Session — text left, image right */}
      <SessionRow $reverse>
        <TextCol $reverse>
          <SessionName>Standard Session</SessionName>
          <BookLink onClick={onContact}>Contact for Booking</BookLink>
          <IdealLabel>Ideal for:</IdealLabel>
          <IdealItem>Maternity</IdealItem>
          <IdealItem>Outdoor family session</IdealItem>
          <Deliverable>(Provide 20 digitally edited images)</Deliverable>
        </TextCol>
        <ImageCol $reverse>
          {images["standard-session"]
            ? <SessionImg src={images["standard-session"]} alt="Standard Session" />
            : <ImgPlaceholder>Standard Session</ImgPlaceholder>
          }
          <ImgRule />
        </ImageCol>
      </SessionRow>

      <GetInTouch onContact={onContact} />

      <FooterBar>
        <span>© {new Date().getFullYear()} shivanijadonphotography</span>
        <span>@shivanijadonphotography</span>
      </FooterBar>
    </Page>
  );
};

export default ReservationPage;
