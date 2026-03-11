// import type { ComponentPropsWithoutRef } from "react"

// type ButtonProps = ComponentPropsWithoutRef<'button'> & {
//   label: string;
// }

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
}

export const Button: React.FC<ButtonProps> = ({ label, ...rest}: ButtonProps) => {
  return (
    <button {...rest}>{ label }</button>
  )
}
