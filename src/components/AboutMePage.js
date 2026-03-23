import React, { useEffect, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import SharedNav from "./SharedNav";
import GetInTouch from "./GetInTouch";
import { photoAPI } from "../services/api";

const T = {
  cream: "#fdf8f3", white: "#ffffff", black: "#111111",
  mid: "#6b6155", light: "#a89e92", border: "#e8e3dc",
};

const GlobalAbout = createGlobalStyle`body { background: ${T.cream}; margin: 0; }`;

const Page = styled.div`min-height: 100vh; background: ${T.cream};`;

const Hero = styled.section`
  padding: 140px 10% 80px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: start;
  max-width: 1400px;
  margin: 0 auto;
  @media (max-width: 900px) { grid-template-columns: 1fr; padding: 120px 28px 60px; gap: 48px; }
`;

const TextCol = styled.div`display: flex; flex-direction: column; justify-content: flex-start; padding-top: 20px;`;

const Label = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 9px; font-weight: 300;
  letter-spacing: 0.42em; text-transform: uppercase;
  color: ${T.light}; margin-bottom: 20px;
`;

const Heading = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 200; letter-spacing: 0.18em;
  text-transform: uppercase; color: ${T.black};
  margin: 0 0 28px; line-height: 1.2;
`;

const Body = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px; font-weight: 300;
  line-height: 2.2; color: ${T.mid};
  margin: 0 0 24px; max-width: 480px;
`;

const PhotoCol = styled.div`
  display: flex; align-items: flex-start; justify-content: center;
`;

const PhotoFrame = styled.div`
  border: 1px solid ${T.border};
  padding: 10px;
  background: ${T.white};
  width: 100%; max-width: 480px;
  img {
    width: 100%; display: block;
    aspect-ratio: 3/4; object-fit: cover;
  }
  .ph {
    width: 100%; aspect-ratio: 3/4;
    background: #d8d0c8;
    display: flex; align-items: center; justify-content: center;
    color: #b8b0a4; font-size: 60px;
  }
`;

const SecondSection = styled.section`
  background: ${T.white};
  padding: 100px 10%;
  max-width: 1400px;
  margin: 0 auto;
  @media (max-width: 768px) { padding: 60px 28px; }
`;

const SecondHeading = styled.h2`
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  font-weight: 300; font-style: italic;
  color: ${T.black}; margin: 0 0 28px;
  letter-spacing: 0.04em;
`;

const Divider = styled.div`height: 1px; background: ${T.border};`;

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

const AboutMePage = (props) => {
  const { onContact } = props;
  const [highlights, setHighlights] = useState({});

  useEffect(() => {
    photoAPI.getHighlights().then(setHighlights).catch(() => {});
  }, []);

  return (
    <Page>
      <GlobalAbout />
      <SharedNav active="about" nav={props} isAdmin={props.isAdmin} />

      {/* Hero: text left, photo right */}
      <Hero>
        <TextCol>
          <Label>About Me</Label>
          <Heading>Hello,{"\n"}I'm Shivani</Heading>
          <Body>
            I'm a self-taught portrait photographer based in the DMV area, and I
            believe every family, every face, every fleeting moment deserves to be
            remembered beautifully. Photography found me when I became a mom — I
            fell in love with the light, the candid laughter, the quiet in-between
            seconds that tell the real story.
          </Body>
          <Body>
            My sessions are relaxed and fun — I want you to feel comfortable, not
            posed. Whether we're chasing golden hour at the beach or capturing the
            magic of a growing belly, my goal is always the same: photographs that
            feel as good as the moment did.
          </Body>
        </TextCol>

        <PhotoCol>
          <PhotoFrame>
            {highlights.about
              ? <img src={highlights.about} alt="Shivani" />
              : <div className="ph">▣</div>}
          </PhotoFrame>
        </PhotoCol>
      </Hero>

      <Divider />

      {/* Second text section */}
      <SecondSection>
        <Label>My Approach</Label>
        <SecondHeading>Light, laughter, and real moments</SecondHeading>
        <Body style={{ maxWidth: 680 }}>
          I specialize in maternity, family, creative portrait, and brand sessions.
          Every session is a collaboration — we'll talk through locations, outfits,
          and what matters most to you before we ever pick up a camera. My editing
          style leans natural and timeless: soft tones, genuine expressions, nothing
          that will look dated in ten years.
        </Body>
        <Body style={{ maxWidth: 680 }}>
          When I'm not behind the lens, you'll find me exploring hiking trails with
          my family, obsessing over good coffee, or planning our next adventure.
          I bring all of that warmth and curiosity into every session I photograph.
        </Body>
      </SecondSection>

      <GetInTouch onContact={onContact} />

      <FooterBar>
        <span>© {new Date().getFullYear()} shivanijadonphotography</span>
        <span>@shivanijadonphotography</span>
      </FooterBar>
    </Page>
  );
};

export default AboutMePage;
