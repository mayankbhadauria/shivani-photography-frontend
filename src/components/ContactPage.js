import React, { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import SharedNav from "./SharedNav";

const T = {
  cream: "#fdf8f3", white: "#ffffff", black: "#111111",
  mid: "#6b6155", light: "#a89e92", border: "#e8e3dc", red: "#c0392b",
};

const GlobalContact = createGlobalStyle`body { background: ${T.cream}; margin: 0; }`;

const Page = styled.div`min-height: 100vh; background: ${T.cream};`;

const Main = styled.section`
  padding: 140px 10% 100px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 100px;
  max-width: 1400px;
  margin: 0 auto;
  @media (max-width: 900px) { grid-template-columns: 1fr; gap: 48px; padding: 120px 28px 80px; }
`;

const TextCol = styled.div``;

const Label = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 9px; font-weight: 300;
  letter-spacing: 0.42em; text-transform: uppercase;
  color: ${T.light}; margin-bottom: 20px;
`;

const PageTitle = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(2rem, 4vw, 3.4rem);
  font-weight: 200; letter-spacing: 0.18em;
  text-transform: uppercase; color: ${T.black};
  margin: 0 0 28px;
`;

const Body = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px; font-weight: 300;
  line-height: 2.2; color: ${T.mid};
  margin: 0 0 20px;
`;

const Detail = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px; font-weight: 300;
  letter-spacing: 0.12em; color: ${T.mid};
  line-height: 2.2; margin-top: 32px;
  span { color: ${T.black}; letter-spacing: 0.08em; }
`;

/* Form */
const FormCol = styled.div``;

const Field = styled.div`
  margin-bottom: 32px;
  border-bottom: 1px solid ${props => props.$focused ? T.black : T.border};
  padding-bottom: 8px;
  transition: border-color 0.2s;
  label {
    display: block;
    font-family: 'Montserrat', sans-serif;
    font-size: 9px; letter-spacing: 0.3em;
    text-transform: uppercase; color: ${T.light};
    margin-bottom: 10px;
  }
  input, textarea {
    width: 100%; background: none; border: none; outline: none;
    font-family: 'Montserrat', sans-serif;
    font-size: 14px; font-weight: 300;
    color: ${T.black}; padding: 4px 0;
    letter-spacing: 0.02em; resize: none;
    box-sizing: border-box;
  }
  textarea { min-height: 96px; }
`;

const SubmitBtn = styled.button`
  width: 100%;
  font-family: 'Montserrat', sans-serif;
  font-size: 10px; font-weight: 300;
  letter-spacing: 0.3em; text-transform: uppercase;
  background: ${T.black}; color: #fff;
  border: none; padding: 16px;
  cursor: pointer; transition: background 0.25s;
  margin-top: 8px;
  &:hover:not(:disabled) { background: #333; }
  &:disabled { background: #999; cursor: not-allowed; }
`;

const SuccessWrap = styled.div`
  text-align: center; padding: 80px 40px;
`;

const SuccessHeading = styled.h2`
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 300; font-style: italic;
  color: ${T.black}; margin: 0 0 20px;
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

const FocusField = ({ label, type = "text", value, onChange, placeholder, multiline }) => {
  const [focused, setFocused] = useState(false);
  return (
    <Field $focused={focused}>
      <label>{label}</label>
      {multiline
        ? <textarea value={value} onChange={onChange} placeholder={placeholder}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} required />
        : <input type={type} value={value} onChange={onChange} placeholder={placeholder}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} required />
      }
    </Field>
  );
};

const ContactPage = (props) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate send — wire up email service later
    setTimeout(() => { setSending(false); setSubmitted(true); }, 800);
  };

  return (
    <Page>
      <GlobalContact />
      <SharedNav active="contact" nav={props} isAdmin={props.isAdmin} />

      <Main>
        <TextCol>
          <Label>Let's Connect</Label>
          <PageTitle>Get in Touch</PageTitle>
          <Body>
            I'd love to hear from you. Whether you have a session in mind or just
            want to say hello, fill out the form and I'll get back to you within
            24–48 hours.
          </Body>
          <Body>
            I'm based in the DMV area and available for travel sessions upon request.
          </Body>
          <Detail>
            <span>Instagram</span><br />
            @shivanijadonphotography
          </Detail>
        </TextCol>

        <FormCol>
          {submitted ? (
            <SuccessWrap>
              <SuccessHeading>Thank you, {form.name.split(" ")[0]}!</SuccessHeading>
              <Body>Your message has been sent. I'll be in touch soon.</Body>
            </SuccessWrap>
          ) : (
            <form onSubmit={handleSubmit}>
              <FocusField label="Your Name" value={form.name} onChange={set("name")} placeholder="Jane Smith" />
              <FocusField label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="jane@example.com" />
              <FocusField label="Phone Number" type="tel" value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" />
              <FocusField label="Message" value={form.message} onChange={set("message")}
                placeholder="Tell me a little about your session idea..." multiline />
              <SubmitBtn type="submit" disabled={sending}>
                {sending ? "Sending..." : "Send Message"}
              </SubmitBtn>
            </form>
          )}
        </FormCol>
      </Main>

      <FooterBar>
        <span>© {new Date().getFullYear()} shivanijadonphotography</span>
        <span>@shivanijadonphotography</span>
      </FooterBar>
    </Page>
  );
};

export default ContactPage;
