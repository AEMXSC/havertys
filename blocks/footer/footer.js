export default async function decorate(block) {
  block.textContent = '';

  const resp = await fetch('/footer.plain.html');
  if (!resp.ok) return;

  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  const footer = document.createElement('div');
  footer.classList.add('footer-container');

  const sections = tmp.querySelectorAll(':scope > div');
  const sectionArray = [...sections];

  sectionArray.forEach((section) => {
    section.classList.add('default-content-wrapper');
    footer.append(section);
  });

  // Find the section with both h2 headings and split into a grid
  const linksSection = footer.querySelector('.default-content-wrapper:has(h2)');
  if (linksSection) {
    linksSection.classList.add('footer-links');
    const headings = linksSection.querySelectorAll('h2');
    if (headings.length >= 2) {
      const grid = document.createElement('div');
      grid.classList.add('footer-links-grid');

      const col1 = document.createElement('div');
      col1.classList.add('footer-col');
      const col2 = document.createElement('div');
      col2.classList.add('footer-col');

      let currentCol = col1;
      [...linksSection.children].forEach((child) => {
        if (child === headings[1]) currentCol = col2;
        currentCol.append(child);
      });

      grid.append(col1);
      grid.append(col2);
      linksSection.innerHTML = '';
      linksSection.append(grid);
    }
  }

  // decorate icons
  footer.querySelectorAll('span.icon').forEach((icon) => {
    const name = [...icon.classList].find((c) => c.startsWith('icon-') && c !== 'icon')?.replace('icon-', '');
    if (name) {
      const img = document.createElement('img');
      img.src = `/icons/${name}.svg`;
      img.alt = name;
      img.loading = 'lazy';
      icon.append(img);
    }
  });

  // remove button classes from footer links
  footer.querySelectorAll('.button').forEach((link) => link.classList.remove('button'));

  block.append(footer);
}
