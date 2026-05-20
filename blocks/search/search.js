/**
 * decorates the header search
 * @param {Element} block The search block element
 */
export default async function decorate(block) {
  const searchForm = document.createElement('form');
  searchForm.action = 'https://www.havertys.com/search';
  searchForm.method = 'GET';
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.name = 'search_query';
  searchInput.placeholder = 'Search';
  const searchSubmit = document.createElement('button');
  searchSubmit.type = 'submit';
  searchSubmit.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>`;
  searchSubmit.setAttribute('aria-label', 'Search');
  searchForm.append(searchSubmit, searchInput);
  // stamp nav DOM
  block.append(searchForm);
}
