export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  const imageContainer = document.createElement('div');
  imageContainer.classList.add('commerce-teaser-split-image-container');

  const contentContainer = document.createElement('div');
  contentContainer.classList.add('commerce-teaser-split-content-container');

  rows.forEach((row) => {
    const cols = [...row.querySelectorAll(':scope > div')];
    cols.forEach((col) => {
      const hasImage = col.querySelector('picture, img, video');
      if (hasImage && !contentContainer.querySelector('.commerce-teaser-split-titles')) {
        imageContainer.append(col);
      } else {
        const titles = document.createElement('div');
        titles.classList.add('commerce-teaser-split-titles');

        const description = document.createElement('div');
        description.classList.add('commerce-teaser-split-description');

        const headings = col.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const paragraphs = col.querySelectorAll('p:not(.button-container)');
        const buttons = col.querySelectorAll('.button-container');

        headings.forEach((h) => titles.append(h));
        paragraphs.forEach((p) => description.append(p));

        contentContainer.append(titles);
        if (description.children.length) contentContainer.append(description);
        buttons.forEach((btn) => contentContainer.append(btn));
      }
    });
    row.remove();
  });

  block.append(imageContainer);
  block.append(contentContainer);
}
