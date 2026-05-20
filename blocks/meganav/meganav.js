import { loadFragment } from '../fragment/fragment.js';

const decorateNavFragment = (fragment) => {
  const links = fragment.querySelectorAll('a');
  links.forEach((l) => {
    l.classList.remove('button');
  });
};

const renderFragment = async (menu, element) => {
  const timeout = setTimeout(() => {
    menu.classList.remove('hidden');
    menu.setAttribute('aria-hidden', false);
    menu.previousElementSibling.classList.add('active-menu');
    const megamenuColumns = menu.querySelector('.columns div');
    const megamenuCard = megamenuColumns ? megamenuColumns.lastElementChild : null;
    if (megamenuCard?.querySelector('h2') || megamenuCard?.querySelector('h3') || megamenuCard?.querySelector('h4')) {
      const flexContainer = document.createElement('div');
      flexContainer.classList.add('flex-container');
      [...megamenuCard.children].forEach((child) => {
        if (!child.classList.contains('button-container')) {
          flexContainer.append(child);
        }
      });
      megamenuCard.prepend(flexContainer);
    }
  }, 200);

  element.addEventListener('mouseout', () => {
    clearTimeout(timeout);
  });

  const fragmentLoader = async () => {
    if (menu.getAttribute('data-fragment-url')) {
      const fragmentUrl = menu.getAttribute('data-fragment-url');
      // set to false so we don't load every time we want to render
      menu.setAttribute('data-fragment-url', false);
      const fragment = await loadFragment(fragmentUrl);
      while (fragment && fragment.firstElementChild) {
        const fragmentEl = fragment.firstElementChild;
        decorateNavFragment(fragmentEl);
        menu.appendChild(fragmentEl);
      }
    }
  };

  await fragmentLoader();
};

const hideFragment = (menu) => {
  const timeout = setTimeout(() => {
    menu.classList.add('hidden');
    menu.setAttribute('aria-hidden', true);
    menu.previousElementSibling.classList.remove('active-menu');
  }, 200);

  menu.addEventListener('mouseover', () => {
    clearTimeout(timeout);
  });
};

export default async function decorate(block) {
  const [...rows] = block.children;

  rows.forEach((row) => {
    const [labelEl, fragmentUrlEl, styleEl, addHoverEl, hoverTextEl] = row.children;
    const label = labelEl.getElementsByTagName('a')[0];
    const fragmentUrl = fragmentUrlEl.innerText;
    const classList = styleEl.innerText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => !!s);
    fragmentUrlEl.remove();
    styleEl.remove();
    row.classList.add('nav-item');
    row.classList.add(...classList);
    // ADA changes
    row.parentElement.classList.add('primary-links');
    row.classList.add('primaryLink');

    // ADA changes
    label.classList.add('primaryLink-link');
    label.setAttribute('tabindex', 0);

    const addHover = addHoverEl.textContent === 'true';
    const hoverText = addHover ? hoverTextEl.textContent : '';
    addHoverEl.remove();
    hoverTextEl.remove();

    if (fragmentUrl !== '') {
      const menu = document.createElement('div');
      menu.setAttribute('data-fragment-url', fragmentUrl);
      menu.classList.add('nav-drawer');
      menu.classList.add('hidden');
      row.after(menu);
      label.classList.remove('button');
      label.setAttribute('aria-expanded', false);
      label.addEventListener('mouseover', () => renderFragment(menu, label), false);
      block.addEventListener('mouseout', () => hideFragment(menu), false);
      // ADA changes
      // eslint-disable-next-line no-use-before-define
      label.addEventListener('keydown', (event) => handleKeyboardNavigation(event, menu, label), false);
      // eslint-disable-next-line no-undef, no-use-before-define
      document.addEventListener('keydown', (event) => handleKeyboardNavMenu(event, menu, label), false);
    } else if (addHover) {
      // fragments and hover popups are mutually exclusive
      const menuHover = document.createElement('div');
      menuHover.setAttribute('class', 'menu-hover');
      menuHover.innerText = hoverText;
      label.after(menuHover);
    }
  });
}

const handleKeyboardNavigation = (e, menu, label) => {
  const navItems = document.querySelectorAll('.primaryLink-link');
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    renderFragment(menu, label);
    label.setAttribute('aria-expanded', true);
  } else if (e.key !== 'Tab') {
    hideFragment(menu);
  }
  // Focus to nav links
  const navArray = Array.from(navItems);
  navArray.forEach((item, index) => {
    item.addEventListener('keydown', (event) => {
      let newIndex;
      if (event.key === 'ArrowLeft') {
        label.setAttribute('aria-expanded', false);
        newIndex = (index - 1 + navArray.length) % navArray.length;
        navArray[newIndex].focus();
        event.preventDefault();
      } else if (event.key === 'ArrowRight') {
        label.setAttribute('aria-expanded', false);
        newIndex = (index + 1) % navArray.length;
        navArray[newIndex].focus();
        event.preventDefault();
      }
    });
  });
};

const handleKeyboardNavMenu = (e, menu, label) => {
  // eslint-disable-next-line default-case, no-console
  // eslint-disable-next-line default-case
  switch (e.key) {
    case 'ArrowUp':
      hideFragment(menu);
      label.setAttribute('aria-expanded', false);
      break;
    case 'Escape':
      hideFragment(menu);
      label.setAttribute('aria-expanded', false);
      break;
  }
};
