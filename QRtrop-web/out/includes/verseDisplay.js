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

function highlightGroup(prefix, container, type) {
  const leftParen = container.querySelector(`[id="${prefix}-L"]`);
  if (!leftParen) return;

  const parts = leftParen.id.split('-');
  const start = parseInt(parts[5]);
  const end = parseInt(parts[6]);

  // Highlight word cells for this triplet only
  for (let w = start; w <= end; w++) {
    const cell = container.querySelector(`td[data-word="${w}"]`);
    if (cell) {
      cell.classList.add(type === 'syntax' ? 'highlight-syntax-bright' : 'highlight-trop-bright');
    }
  }

  // Highlight the parens and text for this triplet only
  container.querySelectorAll(`[id^="${prefix}"]`).forEach(el => {
    el.classList.add('highlight-pair');
  });
}

function clearGroup(prefix, container) {
  container.querySelectorAll('.highlight-trop-bright, .highlight-syntax-bright').forEach(el => {
    el.classList.remove('highlight-trop-bright', 'highlight-syntax-bright');
  });
  container.querySelectorAll(`[id^="${prefix}"]`).forEach(el => {
    el.classList.remove('highlight-pair');
  });
}

function clearAllGroups(container) {
  container.querySelectorAll('.highlight-trop-bright, .highlight-syntax-bright, .highlight-pair').forEach(el => {
    el.classList.remove('highlight-trop-bright', 'highlight-syntax-bright', 'highlight-pair');
  });
}

function highlightRangeAcrossTables(container, startWord, endWord, color) {
  const tables = Array.from(container.querySelectorAll('.segment-table'));
  if (!tables.length) return;
  // Find the tables that contain the start and end words
  let startTable = null, endTable = null;
  let startCell = null, endCell = null;

  tables.forEach(table => {
    const cells = Array.from(table.rows[0].cells);
    cells.forEach(cell => {
      const wordNum = parseInt(cell.dataset.word);
      if (wordNum === startWord && !startCell) {
        startTable = table;
        startCell = cell;
      }
      if (wordNum === endWord && !endCell) {
        endTable = table;
        endCell = cell;
      }
    });
  });

  if (!startCell || !endCell) return;

  // Determine the direction based on word numbers (lower number is start in reading order)
  const minWord = Math.min(startWord, endWord);
  const maxWord = Math.max(startWord, endWord);
  const isStartLower = startWord < endWord;
  const startTableIndex = tables.indexOf(startTable);
  const endTableIndex = tables.indexOf(endTable);
  const totalTables = Math.abs(endTableIndex - startTableIndex) + 1;
  const step = startTableIndex < endTableIndex ? 1 : -1;

  if (startTable === endTable) {
    // If start and end are in the same table, highlight the range in that table
    const cells = Array.from(startTable.rows[0].cells);
    const startIndex = cells.indexOf(startCell) + 1;
    const endIndex = cells.indexOf(endCell) + 1;
    // Since words are ordered right-to-left, the lower word number should be on the left (higher index in cells array)
    if (isStartLower) {
      // Start is lower, so startIndex should be higher (left side), endIndex lower (right side)
      highlightCellRange(startTable, 1, endIndex, 1, startIndex, color === 'orange' ? 4 : -4, 1.5, color, 'single');
    } else {
      // Start is higher, so startIndex should be lower (right side), endIndex higher (left side)
      highlightCellRange(startTable, 1, startIndex, 1, endIndex, color === 'orange' ? 4 : -4, 1.5, color, 'single');
    }
  } else {
    // If start and end are in different tables, highlight based on table order and word number
    const startTableCells = Array.from(startTable.rows[0].cells);
    const startIndex = startTableCells.indexOf(startCell) + 1;
    if (startTableIndex < endTableIndex) {
      // Tables are ordered top-to-bottom, start table is above end table
      if (isStartLower) {
        // Start word is lower, so it should be on the left, highlight from start to right end of table (left to right in visual order)
        highlightCellRange(startTable, 1, 1, 1, startIndex, color === 'orange' ? 4 : -4, 1.5, color, 'start');
      } else {
        // Start word is higher, so it should be on the right, highlight from start to left end of table (right to left in visual order)
        highlightCellRange(startTable, 1, startIndex, 1, startTableCells.length, color === 'orange' ? 4 : -4, 1.5, color, 'start');
      }
    } else {
      // Start table is below end table
      if (isStartLower) {
        // Start word is lower, so it should be on the left, highlight from start to right end of table (left to right in visual order)
        highlightCellRange(startTable, 1, 1, 1, startIndex, color === 'orange' ? 4 : -4, 1.5, color, 'end');
      } else {
        // Start word is higher, so it should be on the right, highlight from start to left end of table (right to left in visual order)
        highlightCellRange(startTable, 1, startIndex, 1, startTableCells.length, color === 'orange' ? 4 : -4, 1.5, color, 'end');
      }
    }

    const endTableCells = Array.from(endTable.rows[0].cells);
    const endIndex = endTableCells.indexOf(endCell) + 1;
    if (startTableIndex < endTableIndex) {
      // End table is below start table
      if (isStartLower) {
        // End word is higher, so it should be on the right, highlight from left start to end (right to left in visual order)
        highlightCellRange(endTable, 1, endIndex, 1, endTableCells.length, color === 'orange' ? 4 : -4, 1.5, color, 'end');
      } else {
        // End word is lower, so it should be on the left, highlight from end to right end of table (left to right in visual order)
        highlightCellRange(endTable, 1, 1, 1, endIndex, color === 'orange' ? 4 : -4, 1.5, color, 'end');
      }
    } else {
      // End table is above start table
      if (isStartLower) {
        // End word is higher, so it should be on the right, highlight from left start to end (right to left in visual order)
        highlightCellRange(endTable, 1, endIndex, 1, endTableCells.length, color === 'orange' ? 4 : -4, 1.5, color, 'start');
      } else {
        // End word is lower, so it should be on the left, highlight from end to right end of table (left to right in visual order)
        highlightCellRange(endTable, 1, 1, 1, endIndex, color === 'orange' ? 4 : -4, 1.5, color, 'start');
      }
    }

    // Highlight all tables between startTable and endTable
    for (let i = Math.min(startTableIndex, endTableIndex) + 1; i < Math.max(startTableIndex, endTableIndex); i++) {
      const midTable = tables[i];
      const midCells = Array.from(midTable.rows[0].cells);
      highlightCellRange(midTable, 1, 1, 1, midCells.length, color === 'orange' ? 4 : -4, 1.5, color, 'middle');
    }
  }
}

function highlightCellRange(table, startRow = 1, startCol, endRow = 1, endCol, borderPx = 3, borderThickPx = 1, color = 'red', position = 'single') {
  // Remove any existing highlights to prevent duplicates
  const existingHighlights = table.querySelectorAll('.cell-highlight-' + (color === 'orange' ? 'trop' : 'syntax'));
  existingHighlights.forEach(h => h.remove());

  const rect = table.getBoundingClientRect();
  const rowStarts = Array.from(table.rows).slice(startRow - 1, endRow);
  const firstCell = rowStarts[0] && rowStarts[0].cells[startCol - 1];
  const lastCell = rowStarts[rowStarts.length - 1] && rowStarts[rowStarts.length - 1].cells[endCol - 1];

  if (!firstCell || !lastCell) return;

  const firstRect = firstCell.getBoundingClientRect();
  const lastRect = lastCell.getBoundingClientRect();

  const left = firstRect.left - rect.left - borderPx;
  const top = firstRect.top - rect.top - borderPx;
  const width = lastRect.right - firstRect.left + borderPx * 2;
  const height = lastRect.bottom - firstRect.top + borderPx * 2;

  const highlight = document.createElement('div');
  highlight.className = 'cell-highlight cell-highlight-' + (color === 'orange' ? 'trop' : 'syntax') + ' ' + position;
  highlight.style.cssText = `position: absolute; top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px; border: ${borderThickPx}px solid ${color}; pointer-events: none; z-index: 100; box-sizing: border-box;`;

  table.style.position = 'relative';
  table.style.overflow = 'visible';
  table.appendChild(highlight);
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
      
      // Additional hover logic for mismatch spans
      const tropSpan = mismatchDiv.querySelector('.verse-trop');
      const syntaxSpan = mismatchDiv.querySelector('.verse-syntax');
      if (!tropSpan || !syntaxSpan) return;
      const [tropStart, tropEnd] = tropSpan.dataset.words.split('-').map(Number);
      const [syntaxStart, syntaxEnd] = syntaxSpan.dataset.words.split('-').map(Number);
      const container = mismatchDiv.closest('.verse-container').querySelector('.table-container');
      if (container) {
        if (!this.closest('td')) {
          // Compute overlap words
          const overlapWords = new Set();
          for (let w = Math.max(tropStart, syntaxStart); w <= Math.min(tropEnd, syntaxEnd); w++) {
            overlapWords.add(w);
          }
          if (this.classList.contains('verse-trop')) {
            // Hovering over trop words: highlight trop-only gold, overlap violet
            for (let w = tropStart; w <= tropEnd; w++) {
              const td = container.querySelector(`td[data-word="${w}"]`);
              if (td) {
                if (overlapWords.has(w)) {
                  td.classList.add('highlight-overlap');
                } else {
                  td.classList.add('highlight-trop-bright');
                }
              }
            }
          } else if (this.classList.contains('verse-syntax')) {
            // Hovering over syntax words: highlight syntax-only lightblue, overlap violet
            for (let w = syntaxStart; w <= syntaxEnd; w++) {
              const td = container.querySelector(`td[data-word="${w}"]`);
              if (td) {
                if (overlapWords.has(w)) {
                  td.classList.add('highlight-overlap');
                } else {
                  td.classList.add('highlight-syntax-bright');
                }
              }
            }
          }
        }
      }
    });
    
    span.addEventListener('mouseout', function() {
      const mismatchDiv = this.closest('.mismatch-data');
      if (!mismatchDiv) return;
      const tableContainer = mismatchDiv.closest('.verse-container').querySelector('.table-container');
      if (tableContainer) {
        tableContainer.querySelectorAll('.temp-highlight-trop, .temp-highlight-syntax').forEach(cell => {
          cell.classList.remove('temp-highlight-trop', 'temp-highlight-syntax');
        });
      }
      
      // Additionalmouseout logic for mismatch spans
      const tropSpan = mismatchDiv.querySelector('.verse-trop');
      const syntaxSpan = mismatchDiv.querySelector('.verse-syntax');
      if (!tropSpan || !syntaxSpan) return;
      const [tropStart, tropEnd] = tropSpan.dataset.words.split('-').map(Number);
      const [syntaxStart, syntaxEnd] = syntaxSpan.dataset.words.split('-').map(Number);
      const container = mismatchDiv.closest('.verse-container').querySelector('.table-container');
      if (container) {
        // Remove all highlights
        for (let w = Math.min(tropStart, syntaxStart); w <= Math.max(tropEnd, syntaxEnd); w++) {
          const td = container.querySelector(`td[data-word="${w}"]`);
          if (td) {
            td.classList.remove('highlight-overlap', 'highlight-trop-bright', 'highlight-syntax-bright');
          }
        }
      }
    });
  });
  
  // Add hover effects for branch-end and branch-start spans
  document.querySelectorAll('.branch-end, .branch-start').forEach(span => {
    span.addEventListener('mouseenter', function() {
      const id = this.id;
      if (!id) return;
      const parts = id.split('-');
      const prefix = parts.slice(0, -1).join('-');
      const container = span.closest('.table-container');

      // Step 1: Clear ALL existing highlights in this table (so only one triplet shows)
      clearAllGroups(container);

      // Step 2: Highlight only this triplet
      highlightGroup(prefix, container, id.includes('syntax') ? 'syntax' : 'trop');
    });

    span.addEventListener('mouseleave', function(e) {
      const related = e.relatedTarget;
      if (related && span.closest('.table-container').contains(related)) return;

      const id = this.id;
      if (!id) return;
      const parts = id.split('-');
      const prefix = parts.slice(0, -1).join('-');
      const container = span.closest('.table-container');

      // Clear only this group (but since we clear all on enter, it's safe)
      clearGroup(prefix, container);
    });
  });
  
  // Build mismatch colored boxes as they appear on the page
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const container = entry.target;
        const verseContainer = container.closest('.verse-container');
        if (!verseContainer) return;
        const chap = verseContainer.getAttribute('data-chap');
        const verse = verseContainer.getAttribute('data-verse');
        let tropRange, syntaxRange;
        const selectedRadio = verseContainer.querySelector(`input[name="mismatch-select-${chap}-${verse}"]:checked`);
        if (selectedRadio) {
          tropRange = selectedRadio.getAttribute('data-trop').split('-').map(Number);
          syntaxRange = selectedRadio.getAttribute('data-syntax').split('-').map(Number);
        } else {
          // Handle single mismatch case where there is no radio button
          const mismatchDiv = verseContainer.querySelector('.mismatch-selector .mismatch-data');
          if (!mismatchDiv) return;
          const tropSpan = mismatchDiv.querySelector('.verse-trop');
          const syntaxSpan = mismatchDiv.querySelector('.verse-syntax');
          if (!tropSpan || !syntaxSpan) return;
          tropRange = tropSpan.getAttribute('data-words').split('-').map(Number);
          syntaxRange = syntaxSpan.getAttribute('data-words').split('-').map(Number);
          // Add colored borders to mismatch-data spans
          tropSpan.style.border = '1.5px solid orange';
          tropSpan.style.padding = '6px 2px';
          tropSpan.style.display = 'inline-block';
          syntaxSpan.style.border = '1.5px solid blue';
          syntaxSpan.style.padding = '2px';
          syntaxSpan.style.display = 'inline-block';
        }

        // Remove any existing highlights in the container to prevent duplicates
        container.querySelectorAll('.cell-highlight-trop, .cell-highlight-syntax').forEach(h => h.remove());

        // Highlight trope range across all relevant tables
        highlightRangeAcrossTables(container, tropRange[0], tropRange[1], 'orange');

        // Highlight syntax range across all relevant tables
        highlightRangeAcrossTables(container, syntaxRange[0], syntaxRange[1], 'blue');

        observer.unobserve(container);
      }
    });
  });

  document.querySelectorAll('.table-container').forEach(container => {
    observer.observe(container);
  });
});
