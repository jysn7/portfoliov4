export function lockScroll() {
  const sw = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.paddingRight = sw > 0 ? `${sw}px` : '';
}

export function unlockScroll() {
  document.documentElement.style.overflow = '';
  document.body.style.paddingRight = '';
}