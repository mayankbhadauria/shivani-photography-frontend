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

/* ── Hero (about me) ── */
const Hero = styled.section`
  padding: 110px 10% 80px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: start;
  max-width: 1400px;
  margin: 0 auto;
  @media (max-width: 900px) { grid-template-columns: 1fr; padding: 100px 28px 60px; gap: 48px; }
`;

const TextCol = styled.div`display: flex; flex-direction: column; justify-content: flex-start; padding-top: 20px;`;

const Label = styled.div`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 9px; font-weight: 300;
  letter-spacing: 0.42em; text-transform: uppercase;
  color: ${T.light}; margin-bottom: 20px;
`;

const Heading = styled.h1`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 200; letter-spacing: 0.18em;
  text-transform: uppercase; color: ${T.black};
  margin: 0 0 28px; line-height: 1.2;
`;

const Body = styled.p`
  font-family: system-ui, -apple-system, sans-serif;
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
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  font-weight: 300; font-style: italic;
  color: ${T.black}; margin: 0 0 28px;
  letter-spacing: 0.04em;
`;

const Divider = styled.div`height: 1px; background: ${T.border};`;

/* ── Session Info (merged from InfoPage) ── */
const SectionTitle = styled.h2`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(1.4rem, 2.5vw, 2rem);
  font-weight: 200; letter-spacing: 0.22em;
  text-transform: uppercase; color: ${T.black};
  margin: 0 0 40px;
`;

const WearSection = styled.section`
  padding: 80px 10%;
  background: ${T.cream};
  @media (max-width: 768px) { padding: 60px 28px; }
`;

const TipGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 40px;
`;

const TipCard = styled.div`
  border-left: 1px solid ${T.border};
  padding-left: 28px;
`;

const TipTitle = styled.div`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 10px; font-weight: 400;
  letter-spacing: 0.28em; text-transform: uppercase;
  color: ${T.black}; margin-bottom: 14px;
`;

const TipBody = styled.p`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px; font-weight: 300;
  line-height: 2; color: ${T.mid};
  margin: 0;
`;

const FaqSection = styled.section`
  padding: 80px 10%;
  background: ${T.white};
  @media (max-width: 768px) { padding: 60px 28px; }
`;

const FaqItem = styled.div`border-bottom: 1px solid ${T.border};`;

const FaqQuestion = styled.button`
  width: 100%;
  display: flex; justify-content: space-between; align-items: center;
  background: none; border: none; cursor: pointer;
  padding: 24px 0;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px; font-weight: 300;
  letter-spacing: 0.06em; color: ${T.black};
  text-align: left; gap: 20px;
  transition: color 0.2s;
  &:hover { color: ${T.mid}; }
`;

const FaqChevron = styled.span`
  font-size: 16px; color: ${T.light}; flex-shrink: 0;
  transform: ${props => props.$open ? "rotate(180deg)" : "rotate(0)"};
  transition: transform 0.25s;
`;

const FaqAnswer = styled.div`
  overflow: hidden;
  max-height: ${props => props.$open ? "400px" : "0"};
  transition: max-height 0.35s ease;
  p {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px; font-weight: 300;
    line-height: 2.2; color: ${T.mid};
    margin: 0 0 24px; max-width: 700px;
  }
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

/* ── Data ── */
const WEAR_TIPS = [
  { title: "Keep it cohesive", body: "Choose a colour palette of 2–3 complementary tones for the group. Avoid matching outfits exactly — coordinated looks feel more natural and timeless." },
  { title: "Avoid busy patterns", body: "Small stripes, large logos, and neon colours can be distracting in photos. Solid colours and subtle textures photograph beautifully." },
  { title: "Dress for the location", body: "Think about the setting. Flowy dresses and linen look stunning outdoors; sleek, clean lines work well for studio and brand sessions." },
  { title: "Comfort matters", body: "Wear something you feel confident and comfortable in. If you're fidgeting with your outfit during the session, it shows. Wear shoes you can walk in!" },
  { title: "Layers add interest", body: "Blazers, cardigans, and scarves give us options during the session. We can shoot with and without for variety in your final gallery." },
  { title: "Send me a photo", body: "Not sure? Send me a photo of your outfit before the session and I'll let you know if it will photograph well. I'm always happy to help." },
];

const FAQS = [
  { q: "How far in advance should I book?", a: "I recommend booking 4–6 weeks in advance, especially for spring and fall — my busiest seasons. For holiday mini sessions I typically open the booking window 2–3 months ahead. That said, reach out even if your date is sooner; I do my best to accommodate." },
  { q: "Where do sessions take place?", a: "Most outdoor sessions take place at locations around the DMV area — parks, waterfronts, urban spaces. I'm also happy to shoot at a location that's meaningful to you. Studio sessions can be arranged on request. We'll discuss the best option when you reach out." },
  { q: "What happens if it rains?", a: "Weather happens! If conditions are unsafe or the light is unflattering, we'll reschedule at no extra charge. I'll keep an eye on the forecast in the days before your session and we'll communicate early if a reschedule looks likely." },
  { q: "How long until I receive my photos?", a: "Portrait sessions are delivered within 2 weeks. Standard sessions are delivered within 2–3 weeks. You'll receive a private online gallery link where you can view, download, and share your images." },
  { q: "Can I bring props?", a: "Absolutely. If you have something meaningful — a blanket, flowers, a favourite toy for the kids — bring it along. Just give me a heads-up beforehand so we can plan the shoot around it." },
  { q: "Do you travel for sessions?", a: "Yes! I'm available for travel sessions. A travel fee applies for locations more than 30 miles from the DMV area. Contact me with your location and I'll provide a quote." },
  { q: "What is your cancellation policy?", a: "Life happens and I understand. Please give me at least 48 hours notice to reschedule. Cancellations within 48 hours of the session may forfeit any deposit paid. I'm always willing to work with you — just reach out." },
];

/* ── Component ── */
const CF_H = 'https://shivanijadonphotography.com/gallery/highlights';

const AboutMePage = (props) => {
  const { onContact } = props;
  const [highlights, setHighlights] = useState({ about: `${CF_H}/about.webp` });
  const [openIdx, setOpenIdx] = useState(null);

  useEffect(() => {
    photoAPI.getHighlights().then(setHighlights).catch(() => {});
  }, []);

  const toggle = (i) => setOpenIdx(prev => prev === i ? null : i);

  return (
    <Page>
      <GlobalAbout />
      <SharedNav active="about" nav={props} />

      {/* ── About Me hero ── */}
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
              ? <img src={highlights.about} alt="Shivani" onError={(e) => { e.target.style.display = 'none'; }} />
              : <div className="ph">▣</div>}
          </PhotoFrame>
        </PhotoCol>
      </Hero>

      <Divider />

      {/* ── My Approach ── */}
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

      <Divider />

      {/* ── What to Wear (from Info) ── */}
      <WearSection>
        <SectionTitle>What to Wear</SectionTitle>
        <TipGrid>
          {WEAR_TIPS.map(tip => (
            <TipCard key={tip.title}>
              <TipTitle>{tip.title}</TipTitle>
              <TipBody>{tip.body}</TipBody>
            </TipCard>
          ))}
        </TipGrid>
      </WearSection>

      <Divider />

      {/* ── FAQ (from Info) ── */}
      <FaqSection>
        <SectionTitle>Frequently Asked Questions</SectionTitle>
        {FAQS.map((faq, i) => (
          <FaqItem key={i}>
            <FaqQuestion onClick={() => toggle(i)}>
              {faq.q}
              <FaqChevron $open={openIdx === i}>∨</FaqChevron>
            </FaqQuestion>
            <FaqAnswer $open={openIdx === i}>
              <p>{faq.a}</p>
            </FaqAnswer>
          </FaqItem>
        ))}
      </FaqSection>

      <GetInTouch onContact={onContact} />

      <FooterBar>
        <span>© {new Date().getFullYear()} shivanijadonphotography</span>
        <a href="https://instagram.com/shivanijadonphotography" target="_blank" rel="noopener noreferrer" style={{color:'inherit',textDecoration:'none',borderBottom:'1px solid currentColor'}}>@shivanijadonphotography</a>
      </FooterBar>
    </Page>
  );
};

export default AboutMePage;
