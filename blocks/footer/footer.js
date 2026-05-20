export default async function decorate(block) {
  block.textContent = '';

  const resp = await fetch('/footer.plain.html');
  if (!resp.ok) return;

  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  const footer = document.createElement('div');
  footer.classList.add('footer-container');

  // Structure: 0=logo, 1=buttons, 2=socials, 3=about links, 4=service links, 5=copyright, 6=legal
  const sections = [...tmp.querySelectorAll(':scope > div')];

  // Row 1: Logo + Buttons
  const row1 = document.createElement('div');
  row1.classList.add('footer-row', 'footer-row-top');
  if (sections[0]) row1.append(sections[0]);
  if (sections[1]) row1.append(sections[1]);
  footer.append(row1);

  // Row 2: Socials + Link columns
  const row2 = document.createElement('div');
  row2.classList.add('footer-row', 'footer-row-main');

  const socialsCol = document.createElement('div');
  socialsCol.classList.add('footer-socials');
  if (sections[2]) socialsCol.append(sections[2]);
  row2.append(socialsCol);

  const linksGrid = document.createElement('div');
  linksGrid.classList.add('footer-links-grid');
  if (sections[3]) linksGrid.append(sections[3]);
  if (sections[4]) linksGrid.append(sections[4]);
  row2.append(linksGrid);

  footer.append(row2);

  // Row 3: Copyright + Legal
  const row3 = document.createElement('div');
  row3.classList.add('footer-row', 'footer-row-bottom');
  if (sections[5]) row3.append(sections[5]);
  if (sections[6]) row3.append(sections[6]);
  footer.append(row3);

  // Decorate icons
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

  // Remove button classes
  footer.querySelectorAll('.button').forEach((link) => link.classList.remove('button'));

  block.append(footer);
}
