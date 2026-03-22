import styled from 'styled-components';

import styles from './Button.module.css';

// const BaseButton = styled.button`
//   padding: 8px 16px;
//   margin: 5px;
//   border-radius: 4px;
//   font-size: 14px;
// `;

// const PrimaryButton = styled(BaseButton)`
//   background-color: blue;
//   color: white;
// `;

// const DangerButton = styled(BaseButton)`
//   background-color: red;
//   color: white;
// `;

const StyledButton = styled.button`
    padding: 8px 16px;
    margin: 5px;
    border-radius: 4px;
    font-size: 14px;
    background: ${props => props.$variant === 'primary' ? 'blue' : 'gray'};
    color: ${props => props.$variant === 'primary' ? 'white' : 'black'};
    opacity: ${props => props.$disabled ? 0.5 : 1 };
`;

export const Button = () => {
  return (
    // <button className={`${styles.primary}`}>Primary</button>
    <>
      {/* <PrimaryButton>Primary</PrimaryButton>
      <DangerButton>Danger</DangerButton> */}
      <StyledButton $variant="primary">Primary</StyledButton>
      <StyledButton $variant="secondary">secondary</StyledButton>
      <StyledButton $disabled>Disabled</StyledButton>
    </>
  );
}
