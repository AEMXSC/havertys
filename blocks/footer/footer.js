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
  sections.forEach((section, i) => {
    section.classList.add(`footer-section${i}`);
    section.classList.add('default-content-wrapper');
    footer.append(section);
  });

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

  // update copyright year
  const copyright = footer.querySelector('.footer-section6 p, .footer-section5 p');
  if (copyright && copyright.textContent.includes('{currentYear}')) {
    copyright.textContent = copyright.textContent.replace('{currentYear}', new Date().getFullYear());
  }

  block.append(footer);
}
