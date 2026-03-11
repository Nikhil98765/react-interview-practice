import type { ComponentPropsWithoutRef, MouseEvent, MouseEventHandler } from "react"

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  label: string;
}

// type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
//   label: string;
// }

export const Button: React.FC<ButtonProps> = ({ label, ...rest }: ButtonProps) => {
  
  const clickHandler:  MouseEventHandler<HTMLButtonElement> = (event) => {

  }

  const clickHandler1 = (event: MouseEvent<HTMLButtonElement>) => {

  }

  return (
    <button {...rest} onClick={clickHandler}>{ label }</button>
  )
}
