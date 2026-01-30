// JavaScript for mismatch highlighting in verse display
function highlightMismatch(element, type, chap, verse) {
  const container = document.querySelector(`.verse-container[data-chap="${chap}"][data-verse="${verse}"]`);
  if (!container) return;
  const words = element.getAttribute('data-words').split('-');
  const startWord = parseInt(words[0]);
  const endWord = parseInt(words[1]);
  const tables = container.querySelectorAll('.segment-table');
  tables.forEach(table => {
    const cells = table.querySelectorAll('td[data-word]');
    cells.forEach(cell => {
      const wordNum = parseInt(cell.getAttribute('data-word'));
      if (wordNum >= startWord && wordNum <= endWord) {
        if (type === 'trop') {
          cell.classList.add('highlight-trop');
          cell.classList.remove('highlight-syntax');
        } else {
          cell.classList.add('highlight-syntax');
          cell.classList.remove('highlight-trop');
        }
      } else {
        cell.classList.remove('highlight-trop', 'highlight-syntax');
      }
    });
  });
}

function highlightWordRange(cell, chap, verse) {
  const container = document.querySelector(`.verse-container[data-chap="${chap}"][data-verse="${verse}"]`);
  if (!container) return;
  const selectedRadio = container.querySelector(`input[name="mismatch-select-${chap}-${verse}"]:checked`);
  if (!selectedRadio) return;
  const tropRange = selectedRadio.getAttribute('data-trop').split('-');
  const syntaxRange = selectedRadio.getAttribute('data-syntax').split('-');
  const startTrop = parseInt(tropRange[0]);
  const endTrop = parseInt(tropRange[1]);
  const startSyntax = parseInt(syntaxRange[0]);
  const endSyntax = parseInt(syntaxRange[1]);
  const tables = container.querySelectorAll('.segment-table');
  tables.forEach(table => {
    const cells = table.querySelectorAll('td[data-word]');
    cells.forEach(c => {
      c.classList.remove('highlight-trop', 'highlight-syntax'); // Ensure previous highlights are cleared
      const wordNum = parseInt(c.getAttribute('data-word'));
      if (wordNum >= startTrop && wordNum <= endTrop) {
        c.classList.add('highlight-trop');
      } else {
        c.classList.remove('highlight-trop');
      }
      if (wordNum >= startSyntax && wordNum <= endSyntax) {
        c.classList.add('highlight-syntax');
      } else {
        c.classList.remove('highlight-syntax');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  // Initialize radio button listeners for mismatch selection
  const radioButtons = document.querySelectorAll('input[type="radio"][name^="mismatch-select-"]');
  radioButtons.forEach(radio => {
    radio.addEventListener('change', function() {
      const name = radio.getAttribute('name');
      const chapVerse = name.split('mismatch-select-')[1].split('-');
      const chap = chapVerse[0];
      const verse = chapVerse[1];
      // Clear all existing highlights for this verse before applying new ones
      const container = document.querySelector(`.verse-container[data-chap="${chap}"][data-verse="${verse}"]`);
      if (container) {
        const cells = container.querySelectorAll('td[data-word]');
        cells.forEach(cell => {
          cell.classList.remove('highlight-trop', 'highlight-syntax');
        });
      }
      highlightWordRange(null, chap, verse);
    });
  });
  // Trigger highlighting for all verses with mismatches on page load
  const containers = document.querySelectorAll('.verse-container');
  containers.forEach(container => {
    const chap = container.getAttribute('data-chap');
    const verse = container.getAttribute('data-verse');
    const radio = container.querySelector(`input[type="radio"][name="mismatch-select-${chap}-${verse}"]:checked`);
    if (radio) {
      highlightWordRange(null, chap, verse);
    }
  });
});
