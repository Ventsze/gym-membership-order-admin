import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoginCharacters } from './LoginCharacters'

describe('LoginCharacters', () => {
  it('moves character bodies and pupils toward the pointer', () => {
    const { container } = render(
      <LoginCharacters isTyping={false} passwordLength={0} showPassword={false} />,
    )

    fireEvent.mouseMove(window, { clientX: 900, clientY: 500 })

    expect(container.querySelector('.character-purple').style.transform).toContain(
      'skewX(-6deg)',
    )
    expect(
      container.querySelector('.character-purple .character-pupil').style.transform,
    ).not.toBe('translate(0px, 0px)')
  })

  it('makes every character look left when the password is visible', () => {
    const { container } = render(
      <LoginCharacters isTyping passwordLength={4} showPassword />,
    )

    expect(container.querySelector('.character-purple').style.transform).toBe(
      'skewX(0deg)',
    )
    expect(
      container.querySelector('.character-purple .character-pupil').style.transform,
    ).toBe('translate(-4px, -4px)')
    expect(
      container.querySelector('.character-orange .character-pupil').style.transform,
    ).toBe('translate(-5px, -4px)')
    expect(
      container.querySelector('.character-yellow .character-pupil').style.transform,
    ).toBe('translate(-5px, -4px)')
  })
})
