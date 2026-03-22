import styled from 'styled-components';

import styles from './Button.module.css';

const BaseButton = styled.button`
  padding: 8px 16px;
  margin: 5px;
  border-radius: 4px;
  font-size: 14px;
`;

const PrimaryButton = styled(BaseButton)`
  background-color: blue;
  color: white;
`;

const DangerButton = styled(BaseButton)`
  background-color: red;
  color: white;
`;

export const Button = () => {
  return (
    // <button className={`${styles.primary}`}>Primary</button>
    <>
      <PrimaryButton>Primary</PrimaryButton>
      <DangerButton>Danger</DangerButton>
    </>
  );
}
