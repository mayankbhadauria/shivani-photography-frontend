import React, { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import SharedNav from "./SharedNav";
import GetInTouch from "./GetInTouch";

const T = {
  cream: "#fdf8f3", white: "#ffffff", black: "#111111",
  mid: "#6b6155", light: "#a89e92", border: "#e8e3dc",
};

const GlobalInfo = createGlobalStyle`body { background: ${T.white}; margin: 0; }`;

const Page = styled.div`min-height: 100vh; background: ${T.white};`;

const Header = styled.section`
  padding: 140px 10% 72px;
  @media (max-width: 768px) { padding: 120px 28px 56px; }
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
  margin: 0 0 20px;
`;

const Intro = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px; font-weight: 300;
  line-height: 2; color: ${T.mid};
  max-width: 560px; margin: 0;
`;

const Divider = styled.div`height: 1px; background: ${T.border};`;

/* What to Wear */
const WearSection = styled.section`
  padding: 80px 10%;
  background: ${T.cream};
  @media (max-width: 768px) { padding: 60px 28px; }
`;

const SectionTitle = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(1.4rem, 2.5vw, 2rem);
  font-weight: 200; letter-spacing: 0.22em;
  text-transform: uppercase; color: ${T.black};
  margin: 0 0 40px;
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
  font-family: 'Montserrat', sans-serif;
  font-size: 10px; font-weight: 400;
  letter-spacing: 0.28em; text-transform: uppercase;
  color: ${T.black}; margin-bottom: 14px;
`;

const TipBody = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px; font-weight: 300;
  line-height: 2; color: ${T.mid};
  margin: 0;
`;

/* FAQ */
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
  font-family: 'Montserrat', sans-serif;
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
    font-family: 'Montserrat', sans-serif;
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
  font-family: 'Montserrat', sans-serif;
  font-size: 9px; font-weight: 300;
  letter-spacing: 0.12em; color: ${T.light};
  @media (max-width: 768px) { padding: 16px 24px; }
`;

const WEAR_TIPS = [
  {
    title: "Keep it cohesive",
    body: "Choose a colour palette of 2–3 complementary tones for the group. Avoid matching outfits exactly — coordinated looks feel more natural and timeless.",
  },
  {
    title: "Avoid busy patterns",
    body: "Small stripes, large logos, and neon colours can be distracting in photos. Solid colours and subtle textures photograph beautifully.",
  },
  {
    title: "Dress for the location",
    body: "Think about the setting. Flowy dresses and linen look stunning outdoors; sleek, clean lines work well for studio and brand sessions.",
  },
  {
    title: "Comfort matters",
    body: "Wear something you feel confident and comfortable in. If you're fidgeting with your outfit during the session, it shows. Wear shoes you can walk in!",
  },
  {
    title: "Layers add interest",
    body: "Blazers, cardigans, and scarves give us options during the session. We can shoot with and without for variety in your final gallery.",
  },
  {
    title: "Send me a photo",
    body: "Not sure? Send me a photo of your outfit before the session and I'll let you know if it will photograph well. I'm always happy to help.",
  },
];

const FAQS = [
  {
    q: "How far in advance should I book?",
    a: "I recommend booking 4–6 weeks in advance, especially for spring and fall — my busiest seasons. For holiday mini sessions I typically open the booking window 2–3 months ahead. That said, reach out even if your date is sooner; I do my best to accommodate.",
  },
  {
    q: "Where do sessions take place?",
    a: "Most outdoor sessions take place at locations around the DMV area — parks, waterfronts, urban spaces. I'm also happy to shoot at a location that's meaningful to you. Studio sessions can be arranged on request. We'll discuss the best option when you reach out.",
  },
  {
    q: "What happens if it rains?",
    a: "Weather happens! If conditions are unsafe or the light is unflattering, we'll reschedule at no extra charge. I'll keep an eye on the forecast in the days before your session and we'll communicate early if a reschedule looks likely.",
  },
  {
    q: "How long until I receive my photos?",
    a: "Portrait sessions are delivered within 2 weeks. Standard sessions are delivered within 2–3 weeks. You'll receive a private online gallery link where you can view, download, and share your images.",
  },
  {
    q: "Can I bring props?",
    a: "Absolutely. If you have something meaningful — a blanket, flowers, a favourite toy for the kids — bring it along. Just give me a heads-up beforehand so we can plan the shoot around it.",
  },
  {
    q: "Do you travel for sessions?",
    a: "Yes! I'm available for travel sessions. A travel fee applies for locations more than 30 miles from the DMV area. Contact me with your location and I'll provide a quote.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Life happens and I understand. Please give me at least 48 hours notice to reschedule. Cancellations within 48 hours of the session may forfeit any deposit paid. I'm always willing to work with you — just reach out.",
  },
];

const InfoPage = (props) => {
  const { onContact } = props;
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (i) => setOpenIdx(prev => prev === i ? null : i);

  return (
    <Page>
      <GlobalInfo />
      <SharedNav active="info" nav={props} isAdmin={props.isAdmin} />

      <Header>
        <Label>Session Info</Label>
        <PageTitle>What to Expect</PageTitle>
        <Intro>
          Everything you need to know before your session — from what to wear
          to what happens after we wrap.
        </Intro>
      </Header>

      <Divider />

      {/* What to Wear */}
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

      {/* FAQ */}
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
        <span>@shivanijadonphotography</span>
      </FooterBar>
    </Page>
  );
};

export default InfoPage;
