import { useEffect, useState } from 'react'

function Eyes({ light = false }) {
  return (
    <span className="character-eyes">
      <i className={light ? 'light-eye' : ''} />
      <i className={light ? 'light-eye' : ''} />
    </span>
  )
}

export function LoginCharacters({ isTyping, passwordLength, showPassword }) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handlePointer = (event) => {
      const x = Math.max(-1, Math.min(1, (event.clientX / window.innerWidth - 0.5) * 2))
      const y = Math.max(
        -1,
        Math.min(1, (event.clientY / window.innerHeight - 0.5) * 2),
      )
      setPointer({ x, y })
    }
    window.addEventListener('mousemove', handlePointer)
    return () => window.removeEventListener('mousemove', handlePointer)
  }, [])

  const isSecret = passwordLength > 0 && !showPassword
  const style = {
    '--look-x': `${pointer.x * 5}px`,
    '--look-y': `${pointer.y * 5}px`,
  }

  return (
    <div
      className={`login-characters ${isTyping ? 'is-typing' : ''} ${
        isSecret ? 'is-secret' : ''
      } ${showPassword && passwordLength ? 'is-peeking' : ''}`}
      style={style}
      aria-hidden="true"
    >
      <div className="character character-purple">
        <Eyes light />
      </div>
      <div className="character character-black">
        <Eyes light />
      </div>
      <div className="character character-orange">
        <Eyes />
      </div>
      <div className="character character-yellow">
        <Eyes />
        <span className="character-mouth" />
      </div>
    </div>
  )
}
