// React Imports
import { useEffect, useRef } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Chip from '@mui/material/Chip'
import { styled } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { ThemeColor } from '@core/types'

// Hook Imports
import { useIntersection } from '@/hooks/useIntersection'

// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'
import styles from './styles.module.css'

// Data
const team = [
  {
    name: 'Sophie Gilbert',
    position: 'Project Manager',
    image: '/images/front-pages/landing-page/sophie.png',
    color: 'var(--mui-palette-primary-lightOpacity)'
  },
  {
    name: 'Paul Miles',
    position: 'UI Designer',
    image: '/images/front-pages/landing-page/paul.png',
    color: 'var(--mui-palette-info-lightOpacity)'
  },
  {
    name: 'Nannie Ford',
    position: 'Development Lead',
    image: '/images/front-pages/landing-page/nannie.png',
    color: 'var(--mui-palette-error-lightOpacity)'
  },
  {
    name: 'Chris Watkins',
    position: 'Marketing Manager',
    image: '/images/front-pages/landing-page/chris.png',
    color: 'var(--mui-palette-success-lightOpacity)'
  }
]

const Card = styled('div')`
  border-color: ${(props: { color: ThemeColor }) => props.color};
  border-start-start-radius: 90px;
  border-start-end-radius: 20px;
  border-end-start-radius: 6px;
  border-end-end-radius: 6px;
`

const OurTeam = () => {
  // Refs
  const skipIntersection = useRef(true)
  const ref = useRef<null | HTMLDivElement>(null)

  // Hooks
  const { updateIntersections } = useIntersection()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (skipIntersection.current) {
          skipIntersection.current = false

          return
        }

        updateIntersections({ [entry.target.id]: entry.isIntersecting })
      },
      { threshold: 0.35 }
    )

    ref.current && observer.observe(ref.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section id='team' className='plb-[100px]' ref={ref}>
      <div className={frontCommonStyles.layoutSpacing}>
        <div className='flex flex-col items-center justify-center gap-4'>
          <Chip size='small' variant='tonal' color='primary' label='Our Great Team' />
          <div className='flex flex-wrap flex-col items-center justify-center gap-1 text-center'>
            <Typography variant='h4'>
              <span className='relative z-[1] font-extrabold'>
                Supported
                <img
                  src='/images/front-pages/landing-page/bg-shape.png'
                  alt='bg-shape'
                  className='absolute block-end-0 z-[1] bs-[40%] is-[132%] -inline-start-[19%] block-start-[17px]'
                />
              </span>{' '}
              by Real People
            </Typography>
            <Typography>Who is behind these great-looking interfaces?</Typography>
          </div>
        </div>
        <Grid container rowSpacing={16} columnSpacing={6} className='pbs-[100px]'>
          {team.map((member, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 3 }} key={index}>
              <Card className='border overflow-visible' color={member.color as ThemeColor}>
                <div className='flex flex-col items-center justify-center p-0'>
                  <div
                    className={classnames(
                      'flex justify-center is-full mli-auto text-center bs-[185px] relative overflow-visible',
                      styles.teamCard
                    )}
                    style={{ backgroundColor: member.color }}
                  >
                    <img src={member.image} alt={member.name} className='bs-[240px] absolute block-start-[-55px]' />
                  </div>
                  <div className='flex flex-col gap-3 p-4 is-full'>
                    <div className='flex flex-col gap-0.5 text-center'>
                      <Typography variant='h5'>{member.name}</Typography>
                      <Typography color='text.disabled'>{member.position}</Typography>
                    </div>
                  </div>
                </div>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </section>
  )
}

export default OurTeam
