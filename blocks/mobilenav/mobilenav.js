import { loadFragment } from '../fragment/fragment.js';

const createMobileToggle = (block) => {
  const mobileToggle = document.createElement('div');
  const bar1 = document.createElement('div');
  const bar2 = document.createElement('div');
  const bar3 = document.createElement('div');
  mobileToggle.classList.add('mobile-toggle');
  mobileToggle.append(bar1, bar2, bar3);
  mobileToggle.setAttribute('tabindex', 0);
  mobileToggle.setAttribute('aria-controls', 'mobilenav-menu');
  mobileToggle.setAttribute('aria-label', 'Open navigation menu');
  mobileToggle.setAttribute('role', 'button');

  const toggleMenu = async () => {
    if (mobileToggle.classList.contains('open')) {
      mobileToggle.setAttribute('aria-label', 'Open navigation menu');
    } else {
      mobileToggle.setAttribute('aria-label', 'Close navigation menu');
    }

    block.children[0].classList.toggle('open');
    block.children[0].classList.toggle('mobilenav-scroll');
    mobileToggle.classList.toggle('open');
    document.querySelector('.search-wrapper').classList.toggle('hide-submenu', mobileToggle.classList.contains('open'));
    document.querySelectorAll('#mobilenav-menu button, #mobilenav-menu a').forEach((el) => {
      el.setAttribute('tabindex', mobileToggle.classList.contains('open') ? '0' : '-1');
    });
    document.body.classList.toggle('disable-scroll');
  };

  mobileToggle.addEventListener('click', toggleMenu);
  // ADA changes
  mobileToggle.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
      toggleMenu();
    }
  });
  document.addEventListener('keydown', async (event) => {
    const escDown = event.key === 'Escape';
    const arrowUp = event.key === 'ArrowUp';
    if (escDown || arrowUp) {
      if (mobileToggle.classList.contains('open')) {
        // only close if open
        toggleMenu();
      }
    }
  });
  return mobileToggle;
};

const adjustMobileMenu = (fragment) => {
  const topList = fragment.querySelector('ul');
  const allNavUl = topList.querySelectorAll('ul');
  topList.classList.add('list-root');
  topList.setAttribute('id', 'mobilenav-menu');
  topList.querySelectorAll('li a').forEach((li) => {
    li.setAttribute('tabindex', '-1');
    li.setAttribute('role', 'menuitem');
    li.classList.add('mobilenav-links');
  });
  topList.querySelectorAll('li ul').forEach((ul) => {
    let listTitle = '';
    if (ul.previousElementSibling) {
      listTitle = ul.previousElementSibling.innerText;
    }
    ul.classList.add('hide-submenu');
    // adding sub menu button
    ul.insertAdjacentHTML(
      'beforebegin',
      `<button role="menuitem" class="mobilenav-links" tabindex="-1" aria-haspopup="true" aria-label='View Sub menu ${listTitle}'></button>`,
    );
    ul.previousElementSibling.addEventListener('click', () => {
      topList.classList.remove('mobilenav-scroll');
      allNavUl.forEach((el) => el.classList.remove('mobilenav-scroll'));
      ul.classList.remove('hide-submenu');
      ul.classList.add('open', 'mobilenav-scroll');
    });

    const parentList = ul.parentElement.closest('ul');
    let parentListTitle = 'top';
    if (parentList && parentList.previousElementSibling) {
      parentListTitle = parentList.previousElementSibling.innerText;
    }

    // adding back button
    const li = document.createElement('li');
    const backBtn = document.createElement('button');
    backBtn.setAttribute('aria-label', `Back to ${parentListTitle} menu`);
    backBtn.classList.add('mobilenav-links');
    backBtn.innerText = listTitle || 'Back';
    li.append(backBtn);
    ul.prepend(li);
    backBtn.addEventListener('click', () => {
      allNavUl.forEach((el) => el.classList.remove('mobilenav-scroll'));
      const prevUl = ul.parentElement.parentElement;
      prevUl.classList.add('mobilenav-scroll');
      ul.classList.add('hide-submenu');
      ul.classList.remove('open', 'mobilenav-scroll');
    });
  });
  return topList;
};

/* Handle Hamberger menu on resize */
function handleMobileMenu() {
  const mobileToggle = document.querySelector('.mobile-toggle');
  if (!mobileToggle) {
    return;
  }
  if (window.innerWidth <= 1199 && mobileToggle) {
    mobileToggle.style.display = 'block';
  } else {
    mobileToggle.style.display = 'none';
  }
}
window.addEventListener('resize', handleMobileMenu);

export default async function decorate(block) {
  let mobileNavFragment = block;
  const mobileNavPath = block.querySelector('p')?.innerText;
  if (!block.querySelector('ul') && mobileNavPath) {
    mobileNavFragment = await loadFragment(mobileNavPath);
  }

  if (mobileNavFragment) {
    const mobileMenu = adjustMobileMenu(mobileNavFragment);

    // eslint-disable-next-line no-param-reassign
    block.prepend(mobileMenu);
    block.children[1].remove();

    const mobileToggle = createMobileToggle(block);

    setTimeout(() => {
      let mobileToggleParent = document.querySelector('.header-top .columns > div > div:first-child');

      if (mobileToggleParent) {
        mobileToggleParent.prepend(mobileToggle);
      } else {
        const loadMobileToggle = (e) => {
          e.target.removeEventListener('header-content-loaded', loadMobileToggle);

          mobileToggleParent = document.querySelector('.header-top .columns > div > div:first-child');
          mobileToggleParent.prepend(mobileToggle);
        };
        document.addEventListener('header-content-loaded', loadMobileToggle);
      }
    }, 100);
  }
}
