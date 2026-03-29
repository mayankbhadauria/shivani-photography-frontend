import React, { useState, useEffect } from "react";
import styled from "styled-components";

const T = {
  cream: "#fdf8f3", white: "#ffffff", black: "#111111",
  mid: "#6b6155", light: "#a89e92", border: "#e8e3dc",
};

const Nav = styled.nav`
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  display: flex; align-items: center; justify-content: space-between;
  padding: 24px 48px;
  background: ${T.cream};
  border-bottom: 1px solid ${props => props.$scrolled ? T.border : "transparent"};
  transition: border-color 0.3s;
  @media (max-width: 768px) { padding: 18px 20px; }
`;

const NavGroup = styled.div`
  display: flex; align-items: center; gap: 32px; min-width: 180px;
  @media (max-width: 900px) { gap: 20px; }
  @media (max-width: 768px) { display: none; }
`;

const NavBtn = styled.button`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px; font-weight: 400;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: ${props => props.$active ? T.black : "#888"};
  background: none; border: none; cursor: pointer; padding: 0;
  transition: color 0.2s;
  &:hover { color: ${T.black}; }
`;

const Logo = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px; font-weight: 400;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: ${T.black}; flex: 1; text-align: center; cursor: pointer;
  white-space: nowrap;
  @media (max-width: 600px) { font-size: 10px; letter-spacing: 0.12em; }
`;

const NavRight = styled(NavGroup)`justify-content: flex-end; min-width: 180px;`;

const SharedNav = ({ active, nav }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <Nav $scrolled={scrolled}>
      <NavGroup>
        <NavBtn $active={active === "home"} onClick={nav.onHome}>Home</NavBtn>
        <NavBtn $active={active === "about"} onClick={nav.onAbout}>About</NavBtn>
      </NavGroup>

      <Logo onClick={nav.onHome}>ShivaniJadonPhotography</Logo>

      <NavRight>
        <NavBtn $active={active === "info"} onClick={nav.onInfo}>Info</NavBtn>
        <NavBtn $active={active === "portfolio" || active === "gallery"} onClick={nav.onPortfolio}>Portfolio</NavBtn>
        <NavBtn $active={active === "reservation"} onClick={nav.onReservation}>Reservation</NavBtn>
      </NavRight>
    </Nav>
  );
};

export default SharedNav;
