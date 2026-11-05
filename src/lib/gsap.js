import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)
gsap.defaults({ ease: 'power3.out' })
ScrollTrigger.config({ ignoreMobileResize: true })
// ScrollTrigger re-applies the scrollRestoration it saw at load ("auto"); force manual so
// back/forward navigation in this SPA always starts at the top of the new page.
ScrollTrigger.clearScrollMemory('manual')

export { gsap, ScrollTrigger, SplitText, useGSAP }
