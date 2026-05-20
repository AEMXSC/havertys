export default function decorate(block) {
  const [
    title,
    type,
    fontColor,
    isButtonSmall,
    buttonText,
    buttonLink,
    openInNewWindow,
    icon,
    label,
    desktopAlignment,
    tabletAlignment,
    mobileAlignment,
    marginTop,
    marginBottom,
    id,
  ] = Array.from(block.children).map((child) => child.textContent.trim());

  block.innerHTML = '';
  block.classList.add('button-container');

  const button = document.createElement('a');
  button.classList.add('button');

  // Make adjustments for author urls
  const authorPath = '/content/havertys-eds/us/en';
  if (buttonLink) {
    if (buttonLink.includes(authorPath)) {
      const startIndex = buttonLink.indexOf(authorPath) + authorPath.length;
      button.href = buttonLink.slice(startIndex) || '/';
    } else {
      button.href = buttonLink;
    }
  } else {
    button.href = '/';
  }

  if (type) {
    button.classList.add(...type.split(' '));
  } else {
    button.classList.add('primary');
  }

  if (fontColor && type === 'cta') {
    button.classList.add(`font-color-${fontColor}`);
  }

  const innerText = document.createElement('span');
  innerText.innerText = buttonText;
  button.append(innerText);

  if (isButtonSmall && type !== 'cta') {
    button.classList.add(isButtonSmall);
  }

  if (title) {
    button.title = title;
  }

  if (openInNewWindow) {
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
  }

  if (icon && type !== 'cta') {
    button.classList.add('noarrow');
  }

  if (label) {
    button.setAttribute('aria-label', label);
  }

  if (id) {
    button.id = id;
  }

  // Alignment
  if (!!desktopAlignment && desktopAlignment !== 'unset') {
    block.classList.add(`align-desktop-${desktopAlignment}`);
  } else {
    block.classList.add('align-desktop-left');
  }
  if (!!tabletAlignment && tabletAlignment !== 'unset') {
    block.classList.add(`align-tablet-${tabletAlignment}`);
  } else {
    block.classList.add('align-tablet-left');
  }
  if (!!mobileAlignment && mobileAlignment !== 'unset') {
    block.classList.add(`align-mobile-${mobileAlignment}`);
  } else {
    block.classList.add('align-mobile-left');
  }

  // Margins
  if (marginTop) {
    block.classList.add(marginTop);
  }
  if (marginBottom) {
    block.classList.add(marginBottom);
  }

  block.append(button);
}
