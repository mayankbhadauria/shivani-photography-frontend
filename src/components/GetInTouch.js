import React from "react";
import styled from "styled-components";

const T = {
  cream: "#fdf8f3", black: "#111111", mid: "#6b6155", light: "#a89e92", border: "#e8e3dc",
};

const Section = styled.section`
  background: ${T.cream};
  text-align: center;
  padding: 100px 40px;
  border-top: 1px solid ${T.border};
`;

const Label = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 9px; font-weight: 300;
  letter-spacing: 0.42em; text-transform: uppercase;
  color: ${T.light}; margin-bottom: 20px;
`;

const Heading = styled.h2`
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 300; font-style: italic;
  color: ${T.black}; margin: 0 0 20px;
  letter-spacing: 0.04em;
`;

const Body = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px; font-weight: 300;
  line-height: 2; color: ${T.mid};
  max-width: 440px; margin: 0 auto 36px;
`;

const Btn = styled.button`
  font-family: 'Montserrat', sans-serif;
  font-size: 10px; font-weight: 300;
  letter-spacing: 0.3em; text-transform: uppercase;
  background: ${T.black}; color: #fff;
  border: none; padding: 16px 52px;
  cursor: pointer; transition: background 0.25s;
  &:hover { background: #333; }
`;

const GetInTouch = ({ onContact }) => (
  <Section>
    <Label>Let's Create Together</Label>
    <Heading>Ready to capture your story?</Heading>
    <Body>
      I'd love to learn more about you and what you have in mind.
      Reach out and let's start planning your session.
    </Body>
    <Btn onClick={onContact}>Get in Touch</Btn>
  </Section>
);

export default GetInTouch;
