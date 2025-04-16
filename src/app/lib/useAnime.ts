import anime from 'animejs';

export const animateEntrance = (selector: string) => {
  anime({
    targets: selector,
    opacity: [0, 1],
    translateY: [20, 0],
    scale: [0.95, 1],
    duration: 800,
    easing: 'easeOutCubic',
    delay: (el, i) => i * 100, // Sequential delay without stagger
  });
};

export const animatePulse = (selector, string) => {
  anime({
    targets: selector,
    scale: [1, 1.05],
    opacity: [1, 0.8],
    duration: 1000,
    easing: 'easeInOutQuad',
    direction: 'alternate',
    loop: true,
  });
};