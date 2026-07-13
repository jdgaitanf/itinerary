export function toggleCard(card) {
  const expanded = card.querySelector('.nodo-card-expanded, .arista-card-expanded');
  const toggleIcon = card.querySelector('.nodo-card-toggle, .arista-card-toggle');

  if (!expanded || !toggleIcon) return;

  // Cerrar cualquier otra card abierta
  const allCards = document.querySelectorAll('.nodo-card.expanded, .arista-card.expanded');
  allCards.forEach(otherCard => {
    if (otherCard !== card) {
      const otherExpanded = otherCard.querySelector('.nodo-card-expanded, .arista-card-expanded');
      const otherToggle = otherCard.querySelector('.nodo-card-toggle, .arista-card-toggle');
      if (otherExpanded && otherToggle) {
        otherExpanded.style.maxHeight = '0';
        otherExpanded.style.opacity = '0';
        otherToggle.textContent = 'expand_more';
        otherCard.classList.remove('expanded');
      }
    }
  });

  if (card.classList.contains('expanded')) {
    // Contraer
    expanded.style.maxHeight = '0';
    expanded.style.opacity = '0';
    toggleIcon.textContent = 'expand_more';
    card.classList.remove('expanded');
  } else {
    // Expandir
    expanded.style.maxHeight = expanded.scrollHeight + 'px';
    expanded.style.opacity = '1';
    toggleIcon.textContent = 'expand_less';
    card.classList.add('expanded');
  }
}

export function createElementFromHTML(htmlString) {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstElementChild;
}

export function findParentCard(element) {
  return element.closest('.nodo-card, .arista-card');
}

export function addToggleListeners(container) {
  const cards = container.querySelectorAll('.nodo-card, .arista-card');
  cards.forEach(card => {
    const header = card.querySelector('.nodo-card-header, .arista-card-header');
    if (header) {
      header.addEventListener('click', () => {
        toggleCard(card);
      });
    }
  });
}