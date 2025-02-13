import React from 'react'
import type { SVGAttributes } from 'react'

interface UserSvgProps extends SVGAttributes<SVGElement> {
  scale?: number
}

const UserSvg: React.FC<UserSvgProps> = ({ scale = 1, ...props }) => {
  const size = 24 * scale // Scale the SVG dynamically
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12 2.00098C6.47773 2.00098 2 6.47783 2 12.0005C2 17.5232 6.47729 22.0001 12 22.0001C17.5231 22.0001 22 17.5232 22 12.0005C22 6.47783 17.5231 2.00098 12 2.00098ZM12 4.99096C13.8273 4.99096 15.308 6.47212 15.308 8.29853C15.308 10.1254 13.8273 11.6061 12 11.6061C10.1736 11.6061 8.69288 10.1254 8.69288 8.29853C8.69288 6.47212 10.1736 4.99096 12 4.99096ZM11.9978 19.3857C10.1753 19.3857 8.50619 18.722 7.21875 17.6234C6.90512 17.3559 6.72415 16.9636 6.72415 16.5521C6.72415 14.6997 8.22332 13.2173 10.0761 13.2173H13.9248C15.778 13.2173 17.2715 14.6997 17.2715 16.5521C17.2715 16.9641 17.0914 17.3555 16.7773 17.623C15.4903 18.722 13.8207 19.3857 11.9978 19.3857Z'
        fill='#71DD37'
      />
    </svg>
  )
}

export default UserSvg
