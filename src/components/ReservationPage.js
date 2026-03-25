import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import SharedNav from "./SharedNav";
import GetInTouch from "./GetInTouch";
import { photoAPI } from "../services/api";

const T = {
  cream: "#fdf8f3", white: "#ffffff", black: "#111111",
  mid: "#6b6155", light: "#a89e92", border: "#e8e3dc",
};

const GlobalRes = createGlobalStyle`body { background: ${T.white}; margin: 0; }`;

const Page = styled.div`min-height: 100vh; background: ${T.white};`;

const Header = styled.section`
  padding: 140px 10% 72px;
  background: ${T.white};
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

const CardsSection = styled.section`
  padding: 0 10% 100px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
  @media (max-width: 900px) { grid-template-columns: 1fr; gap: 28px; }
  @media (max-width: 768px) { padding: 0 28px 72px; }
`;

const Card = styled.div`
  border: 1px solid ${T.border};
  background: ${T.cream};
  display: flex; flex-direction: column;
  overflow: hidden;
`;

const CardImage = styled.div`
  width: 100%;
  aspect-ratio: 4 / 3;
  background: ${T.border};
  overflow: hidden;
  img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
  }
  &:hover img { transform: scale(1.03); }
`;

const CardBody = styled.div`
  padding: 48px 48px 44px;
  display: flex; flex-direction: column; flex: 1;
  @media (max-width: 768px) { padding: 32px 28px; }
`;

const SessionType = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 9px; font-weight: 300;
  letter-spacing: 0.38em; text-transform: uppercase;
  color: ${T.light}; margin-bottom: 16px;
`;

const SessionName = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: 200; letter-spacing: 0.18em;
  text-transform: uppercase; color: ${T.black};
  margin: 0 0 32px;
`;

const Divider = styled.div`height: 1px; background: ${T.border}; margin-bottom: 32px;`;

const IdealLabel = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 9px; font-weight: 400;
  letter-spacing: 0.3em; text-transform: uppercase;
  color: ${T.black}; margin-bottom: 16px;
`;

const IdealList = styled.ul`
  list-style: none; padding: 0; margin: 0 0 32px;
  li {
    font-family: 'Montserrat', sans-serif;
    font-size: 13px; font-weight: 300;
    line-height: 2; color: ${T.mid};
    padding-left: 16px; position: relative;
    &::before {
      content: '—';
      position: absolute; left: 0;
      color: ${T.light};
    }
  }
`;

const Includes = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px; font-weight: 300;
  letter-spacing: 0.12em; color: ${T.mid};
  margin-bottom: 40px; line-height: 1.8;
  flex: 1;
  span { color: ${T.black}; }
`;

const BookBtn = styled.button`
  font-family: 'Montserrat', sans-serif;
  font-size: 10px; font-weight: 300;
  letter-spacing: 0.3em; text-transform: uppercase;
  background: ${T.black}; color: #fff;
  border: none; padding: 16px;
  cursor: pointer; transition: background 0.25s;
  &:hover { background: #333; }
  align-self: stretch;
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

      <Header>
        <Label>Work With Me</Label>
        <PageTitle>Book a Session</PageTitle>
        <Intro>
          Every session is customized to you. Choose the experience that fits
          your vision — then reach out and let's make it happen.
        </Intro>
      </Header>

      <CardsSection>
        {/* Portrait Session */}
        <Card>
          {images["portrait-session"] && (
            <CardImage>
              <img src={images["portrait-session"]} alt="Portrait Session" />
            </CardImage>
          )}
          <CardBody>
            <SessionType>Session Type 01</SessionType>
            <SessionName>Portrait Session</SessionName>
            <Divider />

            <IdealLabel>Ideal for</IdealLabel>
            <IdealList>
              <li>Headshots</li>
              <li>Mini sessions</li>
              <li>Studio family portraits</li>
            </IdealList>

            <Includes>
              <span>5</span> digitally edited high-resolution images<br />
              Online gallery delivered within 2 weeks<br />
              1–2 hour session
            </Includes>

            <BookBtn onClick={onContact}>Contact for Booking</BookBtn>
          </CardBody>
        </Card>

        {/* Standard Session */}
        <Card>
          {images["standard-session"] && (
            <CardImage>
              <img src={images["standard-session"]} alt="Standard Session" />
            </CardImage>
          )}
          <CardBody>
            <SessionType>Session Type 02</SessionType>
            <SessionName>Standard Session</SessionName>
            <Divider />

            <IdealLabel>Ideal for</IdealLabel>
            <IdealList>
              <li>Maternity sessions</li>
              <li>Outdoor family sessions</li>
              <li>Creative portrait series</li>
              <li>Brand photo days</li>
            </IdealList>

            <Includes>
              <span>20</span> digitally edited high-resolution images<br />
              Online gallery delivered within 2–3 weeks<br />
              2–3 hour session · multiple locations
            </Includes>

            <BookBtn onClick={onContact}>Contact for Booking</BookBtn>
          </CardBody>
        </Card>
      </CardsSection>

      <GetInTouch onContact={onContact} />

      <FooterBar>
        <span>© {new Date().getFullYear()} shivanijadonphotography</span>
        <span>@shivanijadonphotography</span>
      </FooterBar>
    </Page>
  );
};

export default ReservationPage;
