import React from 'react'
import type { SVGAttributes } from 'react'

interface MissedUserSvgProps extends SVGAttributes<SVGElement> {
  scale?: number
}

const MissedUserSVG: React.FC<MissedUserSvgProps> = ({ scale = 1, ...props }) => {
  const size = 24 * scale // Scale the SVG dynamically
  return (
    <svg width={size} height={size} viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        d='M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM13.61 6.34C14.68 6.34 15.54 7.2 15.54 8.27C15.54 9.34 14.68 10.2 13.61 10.2C12.54 10.2 11.68 9.34 11.68 8.27C11.67 7.2 12.54 6.34 13.61 6.34ZM7.61 4.76C8.91 4.76 9.97 5.82 9.97 7.12C9.97 8.42 8.91 9.48 7.61 9.48C6.31 9.48 5.25 8.42 5.25 7.12C5.25 5.81 6.3 4.76 7.61 4.76ZM7.61 13.89V17.64C5.21 16.89 3.31 15.04 2.47 12.68C3.52 11.56 6.14 10.99 7.61 10.99C8.14 10.99 8.81 11.07 9.51 11.21C7.87 12.08 7.61 13.23 7.61 13.89ZM10 18C9.73 18 9.47 17.99 9.21 17.96V13.89C9.21 12.47 12.15 11.76 13.61 11.76C14.68 11.76 16.53 12.15 17.45 12.91C16.28 15.88 13.39 18 10 18Z'
        fill='#FF3E1D'
      />
    </svg>
  )
}

export default MissedUserSVG
