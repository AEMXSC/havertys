export default function decorate(block) {
  const mainContainer = document.createElement('div');
  mainContainer.classList.add('call-to-action-signup-main-container');

  const textDiv = document.createElement('div');
  textDiv.classList.add('call-to-action-signup-text');

  const ctaDiv = document.createElement('div');
  ctaDiv.classList.add('call-to-action-signup-cta');

  const rows = [...block.querySelectorAll(':scope > div')];
  rows.forEach((row) => {
    const cols = [...row.querySelectorAll(':scope > div')];
    if (cols.length > 0) {
      const content = cols[0];
      const buttons = content.querySelectorAll('.button-container');
      if (buttons.length > 0) {
        buttons.forEach((btn) => ctaDiv.append(btn));
        textDiv.append(content);
      } else {
        textDiv.append(content);
      }
    }
    row.remove();
  });

  mainContainer.append(textDiv);
  mainContainer.append(ctaDiv);
  block.append(mainContainer);
}
