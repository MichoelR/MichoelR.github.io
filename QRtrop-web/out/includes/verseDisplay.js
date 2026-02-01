// JavaScript for mismatch highlighting in verse display
function highlightMismatch(element, type, chap, verse) {
  const container = document.querySelector(`.verse-container[data-chap="${chap}"][data-verse="${verse}"]`);
  if (!container) return;
  const words = element.getAttribute('data-words').split('-');
  const startWord = parseInt(words[0]);
  const endWord = parseInt(words[1]);
  const tableContainer = container.querySelector('.table-container');
  if (tableContainer) {
    // Remove any existing temporary highlights
    tableContainer.querySelectorAll('.temp-highlight-trop, .temp-highlight-syntax').forEach(cell => {
      cell.classList.remove('temp-highlight-trop', 'temp-highlight-syntax');
    });
    
    // Apply temporary highlight for the hovered range
    for (let w = startWord; w <= endWord; w++) {
      const td = tableContainer.querySelector(`td[data-word="${w}"]`);
      if (td) {
        td.classList.add(type === 'trop' ? 'temp-highlight-trop' : 'temp-highlight-syntax');
      }
    }
  }
}

function highlightWordRange(cell, chap, verse) {
  const container = document.querySelector(`.verse-container[data-chap="${chap}"][data-verse="${verse}"]`);
  if (!container) return;
  const selectedRadio = container.querySelector(`input[name="mismatch-select-${chap}-${verse}"]:checked`);
  if (!selectedRadio) {
    // Handle single mismatch case where there is no radio button
    const mismatchDiv = container.querySelector('.mismatch-selector .mismatch-data');
    if (!mismatchDiv) return;
    const tropSpan = mismatchDiv.querySelector('.verse-trop');
    const syntaxSpan = mismatchDiv.querySelector('.verse-syntax');
    if (!tropSpan || !syntaxSpan) return;
    const tropRange = tropSpan.getAttribute('data-words').split('-').map(Number);
    const syntaxRange = syntaxSpan.getAttribute('data-words').split('-').map(Number);
    applyHighlights(container, tropRange[0], tropRange[1], syntaxRange[0], syntaxRange[1]);
  } else {
    const tropRange = selectedRadio.getAttribute('data-trop').split('-').map(Number);
    const syntaxRange = selectedRadio.getAttribute('data-syntax').split('-').map(Number);
    applyHighlights(container, tropRange[0], tropRange[1], syntaxRange[0], syntaxRange[1]);
  }
}

function applyHighlights(container, startTrop, endTrop, startSyntax, endSyntax) {
  const tableContainer = container.querySelector('.table-container');
  if (!tableContainer) return;
  
  // Remove existing highlights
  tableContainer.querySelectorAll('.cell-highlight-trop, .cell-highlight-syntax').forEach(h => h.remove());
  
  // Highlight trope range across all relevant tables
  highlightRangeAcrossTables(tableContainer, startTrop, endTrop, 'orange');
  
  // Highlight syntax range across all relevant tables
  highlightRangeAcrossTables(tableContainer, startSyntax, endSyntax, 'blue');
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
      highlightWordRange(null, chap, verse);
      
      // Update borders on mismatch spans
      const container = document.querySelector(`.verse-container[data-chap="${chap}"][data-verse="${verse}"]`);
      if (container) {
        const mismatchDivs = container.querySelectorAll('.mismatch-data');
        mismatchDivs.forEach(div => {
          const tropSpan = div.querySelector('.verse-trop');
          const syntaxSpan = div.querySelector('.verse-syntax');
          if (tropSpan) tropSpan.style.border = '';
          if (syntaxSpan) syntaxSpan.style.border = '';
        });
        const selectedMismatchDiv = container.querySelector(`.mismatch-data.mismatch-${radio.value}`);
        if (selectedMismatchDiv) {
          const tropSpan = selectedMismatchDiv.querySelector('.verse-trop');
          const syntaxSpan = selectedMismatchDiv.querySelector('.verse-syntax');
          if (tropSpan) {
            tropSpan.style.border = '1.5px solid orange';
            tropSpan.style.padding = '6px 2px';
            tropSpan.style.display = 'inline-block';
          }
          if (syntaxSpan) {
            syntaxSpan.style.border = '1.5px solid blue';
            syntaxSpan.style.padding = '2px';
            syntaxSpan.style.display = 'inline-block';
          }
        }
      }
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
    } else if (container.querySelector('.mismatch-selector .mismatch-data')) {
      highlightWordRange(null, chap, verse);
    }
  });
  
  // Add hover effects for verse-trop and verse-syntax spans
  document.querySelectorAll('.verse-trop, .verse-syntax').forEach(span => {
    span.addEventListener('mouseover', function() {
      const mismatchDiv = this.closest('.mismatch-data');
      if (!mismatchDiv) return;
      const chap = mismatchDiv.closest('.verse-container').getAttribute('data-chap');
      const verse = mismatchDiv.closest('.verse-container').getAttribute('data-verse');
      highlightMismatch(this, this.classList.contains('verse-trop') ? 'trop' : 'syntax', chap, verse);
    });
    
    span.addEventListener('paren', function() {
      const mismatchDiv = this.closest('.mismatch-data');
      if (!mismatchDiv) return;
      const tableContainer = mismatchDiv.closest('.verse-container').querySelector('.table-container');
      if (tableContainer) {
        tableContainer.querySelectorAll('.temp-highlight-trop, .temp-highlight-syntax').forEach(cell => {
          cell.classList.remove('temp-highlight-trop', 'temp-highlight-syntax');
        });
      }
    });
  });
});
