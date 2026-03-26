import React from "react";
import styled from "styled-components";

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #4a9fd4 0%, #87ceeb 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 30px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(74, 159, 212, 0.35);
`;

const Title = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 3rem;
  margin: 0 0 10px 0;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-shadow: 1px 2px 8px rgba(0, 0, 0, 0.25);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-family: 'Raleway', sans-serif;
  font-size: 1.1rem;
  margin: 0 0 20px 0;
  opacity: 0.85;
  font-weight: 300;
  letter-spacing: 0.12em;
  text-transform: uppercase;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const StatusIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 14px;

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${(props) => (props.connected ? "#28a745" : "#dc3545")};
    box-shadow: 0 0 10px ${(props) => (props.connected ? "#28a745" : "#dc3545")};
  }
`;

const Header = ({ apiHealth, isAdmin }) => {
  const isConnected = apiHealth?.s3_connected && apiHealth?.status === "healthy";

  return (
    <HeaderContainer>
      <Title>Shivani Jadon Photography</Title>
      <Subtitle>Capturing Life's Beautiful Moments</Subtitle>
      {isAdmin && apiHealth && (
        <StatusIndicator connected={isConnected}>
          <div className="status-dot"></div>
          <span>
            {isConnected ? `✅ Connected to ${apiHealth.bucket}` : "❌ Connection Issue"}
          </span>
        </StatusIndicator>
      )}
    </HeaderContainer>
  );
};

export default Header;
