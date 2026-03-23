import React, { useState, useEffect } from "react";
import styled from "styled-components";

const T = {
  cream: "#fdf8f3", white: "#ffffff", black: "#111111",
  mid: "#6b6155", light: "#a89e92", border: "#e8e3dc",
};

const Nav = styled.nav`
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 48px;
  background: ${T.cream};
  border-bottom: 1px solid ${props => props.$scrolled ? T.border : "transparent"};
  transition: border-color 0.3s;
  @media (max-width: 768px) { padding: 16px 20px; }
`;

const NavGroup = styled.div`
  display: flex; align-items: center; gap: 28px; min-width: 200px;
  @media (max-width: 900px) { gap: 16px; }
  @media (max-width: 768px) { display: none; }
`;

const NavBtn = styled.button`
  font-family: 'Montserrat', sans-serif;
  font-size: 10px; font-weight: 300;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: ${props => props.$active ? T.black : T.mid};
  background: none; border: none; cursor: pointer; padding: 0;
  transition: color 0.2s;
  &:hover { color: ${T.black}; }
`;

const AdminBtn = styled(NavBtn)`color: ${props => props.$active ? "#b8962e" : "#c9a84c"};`;

const Logo = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px; font-weight: 300;
  letter-spacing: 0.28em; text-transform: uppercase;
  color: ${T.black}; flex: 1; text-align: center; cursor: pointer;
  @media (max-width: 600px) { font-size: 9px; letter-spacing: 0.15em; }
`;

const NavRight = styled(NavGroup)`justify-content: flex-end; min-width: 200px;`;

const SharedNav = ({ active, nav, isAdmin }) => {
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
        <NavBtn $active={active === "info"} onClick={nav.onInfo}>Info</NavBtn>
        {isAdmin && <AdminBtn onClick={nav.onAdmin}>Admin</AdminBtn>}
      </NavGroup>

      <Logo onClick={nav.onHome}>Shivani Photography</Logo>

      <NavRight>
        <NavBtn $active={active === "gallery"} onClick={() => nav.onViewGallery()}>Portfolio</NavBtn>
        <NavBtn $active={active === "reservation"} onClick={nav.onReservation}>Reservation</NavBtn>
        <NavBtn $active={active === "contact"} onClick={nav.onContact}>Contact</NavBtn>
        <NavBtn onClick={nav.onSignOut}>Sign Out</NavBtn>
      </NavRight>
    </Nav>
  );
};

export default SharedNav;
