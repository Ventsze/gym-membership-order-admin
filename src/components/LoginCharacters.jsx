import { useEffect, useRef, useState } from 'react'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

function getMotion(element, pointer, maxDistance = 5) {
  if (!element) {
    return { bodySkew: 0, faceX: 0, faceY: 0, pupilX: 0, pupilY: 0 }
  }

  const rect = element.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 3
  const deltaX = pointer.x - centerX
  const deltaY = pointer.y - centerY
  const angle = Math.atan2(deltaY, deltaX)
  const distance = Math.min(Math.hypot(deltaX, deltaY), maxDistance)

  return {
    bodySkew: clamp(-deltaX / 120, -6, 6),
    faceX: clamp(deltaX / 20, -15, 15),
    faceY: clamp(deltaY / 30, -10, 10),
    pupilX: Math.cos(angle) * distance,
    pupilY: Math.sin(angle) * distance,
  }
}

function useRandomBlink() {
  const [blinking, setBlinking] = useState(false)

  useEffect(() => {
    let blinkTimer
    let reopenTimer

    const scheduleBlink = () => {
      blinkTimer = window.setTimeout(
        () => {
          setBlinking(true)
          reopenTimer = window.setTimeout(() => {
            setBlinking(false)
            scheduleBlink()
          }, 150)
        },
        3000 + Math.random() * 4000,
      )
    }

    scheduleBlink()
    return () => {
      window.clearTimeout(blinkTimer)
      window.clearTimeout(reopenTimer)
    }
  }, [])

  return blinking
}

function Eyes({ light = false, blinking = false, x = 0, y = 0, style }) {
  return (
    <span className="character-eyes" style={style}>
      {[0, 1].map((eye) => (
        <i
          className={`character-eye ${light ? 'light-eye' : 'dark-eye'} ${
            blinking ? 'is-blinking' : ''
          }`}
          key={eye}
        >
          {!blinking && (
            <b
              className="character-pupil"
              style={{ transform: `translate(${x}px, ${y}px)` }}
            />
          )}
        </i>
      ))}
    </span>
  )
}

export function LoginCharacters({ isTyping, passwordLength, showPassword }) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const [lookingAtEachOther, setLookingAtEachOther] = useState(false)
  const [purplePeeking, setPurplePeeking] = useState(false)
  const purpleRef = useRef(null)
  const blackRef = useRef(null)
  const orangeRef = useRef(null)
  const yellowRef = useRef(null)
  const purpleBlinking = useRandomBlink()
  const blackBlinking = useRandomBlink()

  useEffect(() => {
    const handlePointer = (event) => setPointer({ x: event.clientX, y: event.clientY })
    window.addEventListener('mousemove', handlePointer)
    return () => window.removeEventListener('mousemove', handlePointer)
  }, [])

  useEffect(() => {
    if (!isTyping) {
      setLookingAtEachOther(false)
      return undefined
    }

    setLookingAtEachOther(true)
    const timer = window.setTimeout(() => setLookingAtEachOther(false), 800)
    return () => window.clearTimeout(timer)
  }, [isTyping])

  useEffect(() => {
    if (!showPassword || !passwordLength) {
      setPurplePeeking(false)
      return undefined
    }

    let peekTimer
    let resetTimer
    const schedulePeek = () => {
      peekTimer = window.setTimeout(
        () => {
          setPurplePeeking(true)
          resetTimer = window.setTimeout(() => {
            setPurplePeeking(false)
            schedulePeek()
          }, 800)
        },
        2000 + Math.random() * 3000,
      )
    }
    schedulePeek()

    return () => {
      window.clearTimeout(peekTimer)
      window.clearTimeout(resetTimer)
    }
  }, [passwordLength, showPassword])

  const purple = getMotion(purpleRef.current, pointer, 5)
  const black = getMotion(blackRef.current, pointer, 4)
  const orange = getMotion(orangeRef.current, pointer, 5)
  const yellow = getMotion(yellowRef.current, pointer, 5)
  const hasVisiblePassword = passwordLength > 0 && showPassword
  const isHidingPassword = passwordLength > 0 && !showPassword

  const purpleTransform = hasVisiblePassword
    ? 'skewX(0deg)'
    : isTyping || isHidingPassword
      ? `skewX(${purple.bodySkew - 12}deg) translateX(40px)`
      : `skewX(${purple.bodySkew}deg)`
  const blackTransform = hasVisiblePassword
    ? 'skewX(0deg)'
    : lookingAtEachOther
      ? `skewX(${black.bodySkew * 1.5 + 10}deg) translateX(20px)`
      : `skewX(${isTyping || isHidingPassword ? black.bodySkew * 1.5 : black.bodySkew}deg)`

  return (
    <div className="login-characters" aria-hidden="true">
      <div
        ref={purpleRef}
        className="character character-purple"
        style={{
          height: isTyping || isHidingPassword ? '100%' : '92%',
          transform: purpleTransform,
        }}
      >
        <Eyes
          light
          blinking={purpleBlinking}
          x={
            hasVisiblePassword
              ? purplePeeking
                ? 4
                : -4
              : lookingAtEachOther
                ? 3
                : purple.pupilX
          }
          y={
            hasVisiblePassword
              ? purplePeeking
                ? 5
                : -4
              : lookingAtEachOther
                ? 4
                : purple.pupilY
          }
          style={{
            left: hasVisiblePassword
              ? '11%'
              : lookingAtEachOther
                ? '31%'
                : `calc(25% + ${purple.faceX}px)`,
            top: hasVisiblePassword
              ? '9%'
              : lookingAtEachOther
                ? '15%'
                : `calc(10% + ${purple.faceY}px)`,
          }}
        />
      </div>

      <div
        ref={blackRef}
        className="character character-black"
        style={{ transform: blackTransform }}
      >
        <Eyes
          light
          blinking={blackBlinking}
          x={hasVisiblePassword ? -4 : lookingAtEachOther ? 0 : black.pupilX}
          y={hasVisiblePassword ? -4 : lookingAtEachOther ? -4 : black.pupilY}
          style={{
            left: hasVisiblePassword
              ? '8%'
              : lookingAtEachOther
                ? '27%'
                : `calc(22% + ${black.faceX}px)`,
            top: hasVisiblePassword
              ? '9%'
              : lookingAtEachOther
                ? '4%'
                : `calc(10% + ${black.faceY}px)`,
          }}
        />
      </div>

      <div
        ref={orangeRef}
        className="character character-orange"
        style={{
          transform: hasVisiblePassword
            ? 'skewX(0deg)'
            : `skewX(${orange.bodySkew}deg)`,
        }}
      >
        <Eyes
          x={hasVisiblePassword ? -5 : orange.pupilX}
          y={hasVisiblePassword ? -4 : orange.pupilY}
          style={{
            left: hasVisiblePassword ? '21%' : `calc(34% + ${orange.faceX}px)`,
            top: hasVisiblePassword ? '43%' : `calc(45% + ${orange.faceY}px)`,
          }}
        />
      </div>

      <div
        ref={yellowRef}
        className="character character-yellow"
        style={{
          transform: hasVisiblePassword
            ? 'skewX(0deg)'
            : `skewX(${yellow.bodySkew}deg)`,
        }}
      >
        <Eyes
          x={hasVisiblePassword ? -5 : yellow.pupilX}
          y={hasVisiblePassword ? -4 : yellow.pupilY}
          style={{
            left: hasVisiblePassword ? '14%' : `calc(37% + ${yellow.faceX}px)`,
            top: hasVisiblePassword ? '15%' : `calc(17% + ${yellow.faceY}px)`,
          }}
        />
        <span
          className="character-mouth"
          style={{
            left: hasVisiblePassword ? '7%' : `calc(50% + ${yellow.faceX}px)`,
            top: `calc(38% + ${hasVisiblePassword ? 0 : yellow.faceY}px)`,
            transform: hasVisiblePassword ? 'none' : 'translateX(-50%)',
          }}
        />
      </div>
    </div>
  )
}
