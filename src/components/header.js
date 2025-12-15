import React from "react";
import styled from "styled-components";

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h1`
  font-size: 3rem;
  margin: 0 0 10px 0;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin: 0 0 20px 0;
  opacity: 0.9;
  font-weight: 300;

  @media (max-width: 768px) {
    font-size: 1rem;
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

const Header = ({ apiHealth }) => {
  const isConnected = apiHealth?.s3_connected && apiHealth?.status === "healthy";

  return (
    <HeaderContainer>
      <Title>📸 Shivani Photography</Title>
      <Subtitle>Capturing Life's Beautiful Moments</Subtitle>
      {apiHealth && (
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
