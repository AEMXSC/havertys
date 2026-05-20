import { createOptimizedPicture } from '../../scripts/aem.js';

function isMobileDevice() {
  return window.innerWidth <= 768;
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach(async (col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
        const imgEl = pic.querySelector('img');
        if (isMobileDevice()) {
          imgEl.closest('picture').replaceWith(
            createOptimizedPicture(imgEl.src, imgEl.alt, false, [
              { media: '(max-width: 750px)', width: '284' },
              { width: '284', height: '400' },
            ]),
          );
        } else {
          imgEl.closest('picture').replaceWith(
            createOptimizedPicture(imgEl.src, imgEl.alt, false, [
              { media: '(max-width: 750px)', width: '750' },
              { width: '750', height: '700' },
            ]),
          );
        }
      }

      // removing button class for 4 columns component and appending picture inside anchor tag
      if (block.classList.contains('columns-4-cols') && col.children[1]) {
        col.children[1].children[0]?.classList.remove('button');
        const picture = col.querySelector('picture');
        if (picture) {
          const link = document.createElement('a');
          const buttonEle = col.children[1].children[0];
          link.href = buttonEle.href;
          picture.parentElement.insertBefore(link, picture);
          link.appendChild(picture);
          if (buttonEle.textContent?.toLowerCase() === 'button') {
            buttonEle.innerHTML = '';
          }
        }
      }
    });
  });
}
