document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.branch-end, .branch-start').forEach(span => {
    span.addEventListener('mouseover', function() {
      const id = this.id;
      if (!id) return;
      const parts = id.split('-');
      const start = parseInt(parts[5]);
      const end = parseInt(parts[6]);
      const isTrope = id.startsWith('trop-');
      const container = span.closest('.table-container');
      if (container) {
        for (let w = start; w <= end; w++) {
          const td = container.querySelector(`td[data-word="${w}"]`);
          if (td) {
            td.classList.add(isTrope ? 'highlight-trop-bright' : 'highlight-syntax-bright');
          }
        }
        // Highlight matching bracket
        const dirIndex = parts.length - 1; // Last part is always the direction
        const direction = parts[dirIndex];
        const pairDirection = direction === 'L' ? 'R' : 'L';
        const pairParts = [...parts];
        pairParts[dirIndex] = pairDirection;
        const pairId = pairParts.join('-');
        // Search for the pair within the same container
        const pairSpan = container.querySelector(`[id="${pairId}"]`);
        if (pairSpan) {
          pairSpan.classList.add('highlight-pair');
        }
        span.classList.add('highlight-pair');
        // Highlight associated trop text
        let tropSpan = null;
        if (isTrope) {
          // For trope, highlight the mafsik: the trop in the td of the left paren
          let leftParen;
          if (parts[dirIndex] === 'L') {
            leftParen = span; // this is the left paren
          } else {
            // find the paired left paren within the same container
            const pairDirection = 'L';
            const pairParts = [...parts];
            pairParts[dirIndex] = pairDirection;
            const pairId = pairParts.join('-');
            leftParen = container.querySelector(`[id="${pairId}"]`);
          }
          if (leftParen) {
            const td = leftParen.closest('td');
            tropSpan = td ? td.querySelector('.verse-trop') : null;
          }
        } else {
          const td = span.closest('td');
          tropSpan = td ? td.querySelector('.verse-trop') : null;
        }
        if (tropSpan) {
          tropSpan.classList.add('highlight-pair');
        }
        // Handle overlaps
        const overlappingWords = new Set();
        container.querySelectorAll('.highlight-trop-bright.highlight-syntax-bright').forEach(td => {
          overlappingWords.add(td.dataset.word);
        });
        overlappingWords.forEach(word => {
          const td = container.querySelector('td[data-word="' + word + '"]');
          if (td) {
            td.classList.remove('highlight-trop-bright', 'highlight-syntax-bright');
            td.classList.add('highlight-overlap');
          }
        });
      }
    });
    span.addEventListener('mouseout', function() {
      const id = this.id;
      if (!id) return;
      const parts = id.split('-');
      const start = parseInt(parts[5]);
      const end = parseInt(parts[6]);
      const isTrope = id.startsWith('trop-');
      const container = span.closest('.table-container');
      if (container) {
        for (let w = start; w <= end; w++) {
          const td = container.querySelector(`td[data-word="${w}"]`);
          if (td) {
            td.classList.remove(isTrope ? 'highlight-trop-bright' : 'highlight-syntax-bright', 'highlight-overlap');
          }
        }
        // Remove highlight from matching bracket
        const dirIndex = parts.length - 1; // Last part is always the direction
        const direction = parts[dirIndex];
        const pairDirection = direction === 'L' ? 'R' : 'L';
        const pairParts = [...parts];
        pairParts[dirIndex] = pairDirection;
        const pairId = pairParts.join('-');
        // Search for the pair within the same container
        const pairSpan = container.querySelector(`[id="${pairId}"]`);
        if (pairSpan) {
          pairSpan.classList.remove('highlight-pair');
        }
        span.classList.remove('highlight-pair');
        // Remove highlight from associated trop text
        let tropSpan = null;
        if (isTrope) {
          // For trope, the mafsik: the trop in the td of the left paren
          let leftParen;
          if (parts[dirIndex] === 'L') {
            leftParen = span; // this is the left paren
          } else {
            // find the paired left paren within the same container
            const pairDirection = 'L';
            const pairParts = [...parts];
            pairParts[dirIndex] = pairDirection;
            const pairId = pairParts.join('-');
            leftParen = container.querySelector(`[id="${pairId}"]`);
          }
          if (leftParen) {
            const td = leftParen.closest('td');
            tropSpan = td ? td.querySelector('.verse-trop') : null;
          }
        } else {
          const td = span.closest('td');
          tropSpan = td ? td.querySelector('.verse-trop') : null;
        }
        if (tropSpan) {
          tropSpan.classList.remove('highlight-pair');
        }
      }
    });
  });

  document.querySelectorAll('.verse-trop, .verse-syntax').forEach(span => {
    span.addEventListener('mouseover', function() {
      const mismatchDiv = this.closest('.mismatch_data');
      if (!mismatchDiv) return;
      const tropSpan = mismatchDiv.querySelector('.verse-trop');
      const syntaxSpan = mismatchDiv.querySelector('.verse-syntax');
      if (!tropSpan || !syntaxSpan) return;
      const [tropStart, tropEnd] = tropSpan.dataset.words.split('-').map(Number);
      const [syntaxStart, syntaxEnd] = syntaxSpan.dataset.words.split('-').map(Number);
      // Find the associated container - it should be the next sibling after the mismatch_data div
      const container = mismatchDiv.nextElementSibling && mismatchDiv.nextElementSibling.classList.contains('table-container') ? mismatchDiv.nextElementSibling : null;
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
      const mismatchDiv = this.closest('.mismatch_data');
      if (!mismatchDiv) return;
      const tropSpan = mismatchDiv.querySelector('.verse-trop');
      const syntaxSpan = mismatchDiv.querySelector('.verse-syntax');
      if (!tropSpan || !syntaxSpan) return;
      const [tropStart, tropEnd] = tropSpan.dataset.words.split('-').map(Number);
      const [syntaxStart, syntaxEnd] = syntaxSpan.dataset.words.split('-').map(Number);
      // Find the associated container - it should be the next sibling after the mismatch_data div
      const container = mismatchDiv.nextElementSibling && mismatchDiv.nextElementSibling.classList.contains('table-container') ? mismatchDiv.nextElementSibling : null;
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
});

// Add listeners for mafsik (last trop in trope row)
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.segment-table tr:nth-child(2) .verse-trop').forEach(span => {  // second row is trope row
    // Only add listeners if it's a mafsik: has a left paren directly to its left
    if (!span.previousElementSibling || !span.previousElementSibling.classList.contains('branch-end')) return;
    span.addEventListener('mouseover', function() {
      const container = this.closest('.table-container');
      if (!container) return;
      // Get left paren
      const leftParen = this.previousElementSibling;
      if (!leftParen || !leftParen.classList.contains('branch-end')) return;
      // Parse left paren's id for start, end
      const id = leftParen.id;
      if (!id) return;
      const parts = id.split('-');
      const start = parseInt(parts[5]);
      const end = parseInt(parts[6]);
      const isTrope = id.startsWith('trop-');
      // Highlight word range
      for (let w = start; w <= end; w++) {
        const td = container.querySelector(`td[data-word="${w}"]`);
        if (td) {
          td.classList.add(isTrope ? 'highlight-trop-bright' : 'highlight-syntax-bright');
        }
      }
      // Highlight mafsik
      this.classList.add('highlight-pair');
      // Highlight left paren
      leftParen.classList.add('highlight-pair');
      // Highlight right paren (paired)
      const dirIndex = parts.length - 1; // Last part is always the direction
      const direction = parts[dirIndex];
      const pairDirection = direction === 'L' ? 'R' : 'L';
      const pairParts = [...parts];
      pairParts[dirIndex] = pairDirection;
      const pairId = pairParts.join('-');
      // Search for the pair within the same container
      const rightParen = container.querySelector(`[id="${pairId}"]`);
      if (rightParen) {
        rightParen.classList.add('highlight-pair');
      }
      // Handle overlaps
      const overlappingWords = new Set();
      container.querySelectorAll('.highlight-trop-bright.highlight-syntax-bright').forEach(td => {
        overlappingWords.add(td.dataset.word);
      });
      overlappingWords.forEach(word => {
        const td = container.querySelector('td[data-word="' + word + '"]');
        if (td) {
          td.classList.remove('highlight-trop-bright', 'highlight-syntax-bright');
          td.classList.add('highlight-overlap');
        }
      });
    });
    span.addEventListener('mouseout', function() {
      const container = this.closest('.table-container');
      if (!container) return;
      // Get left paren
      const leftParen = this.previousElementSibling;
      if (!leftParen || !leftParen.classList.contains('branch-end')) return;
      // Parse left paren's id for start, end
      const id = leftParen.id;
      if (!id) return;
      const parts = id.split('-');
      const start = parseInt(parts[5]);
      const end = parseInt(parts[6]);
      const isTrope = id.startsWith('trop-');
      // Remove word highlights
      for (let w = start; w <= end; w++) {
        const td = container.querySelector(`td[data-word="${w}"]`);
        if (td) {
          td.classList.remove(isTrope ? 'highlight-trop-bright' : 'highlight-syntax-bright', 'highlight-overlap');
        }
      }
      // Remove mafsik highlight
      this.classList.remove('highlight-pair');
      // Remove left paren highlight
      leftParen.classList.remove('highlight-pair');
      // Remove right paren highlight
      const dirIndex = parts.length - 1; // Last part is always the direction
      const direction = parts[dirIndex];
      const pairDirection = direction === 'L' ? 'R' : 'L';
      const pairParts = [...parts];
      pairParts[dirIndex] = pairDirection;
      const pairId = pairParts.join('-');
      // Search for the pair within the same container
      const rightParen = container.querySelector(`[id="${pairId}"]`);
      if (rightParen) {
        rightParen.classList.remove('highlight-pair');
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const container = entry.target;
        const mismatchDiv = container.previousElementSibling;
        if (!mismatchDiv) return;
        if (!mismatchDiv.classList.contains('mismatch_data')) return;

        const tropSpan = mismatchDiv.querySelector('.verse-trop');
        const syntaxSpan = mismatchDiv.querySelector('.verse-syntax');
        if (!tropSpan || !syntaxSpan) return;
        const [tropStart, tropEnd] = tropSpan.dataset.words.split('-').map(Number);
        const [syntaxStart, syntaxEnd] = syntaxSpan.dataset.words.split('-').map(Number);

        // Remove any existing highlights in the container to prevent duplicates
        container.querySelectorAll('.cell-highlight').forEach(h => h.remove());

        // Highlight trope range across all relevant tables
        highlightRangeAcrossTables(container, tropStart, tropEnd, 'orange');
        
        // Highlight syntax range across all relevant tables
        highlightRangeAcrossTables(container, syntaxStart, syntaxEnd, 'blue');

        // Add colored borders to mismatch_data spans to match highlight colors
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

        observer.unobserve(container);
      }
    });
  });

  document.querySelectorAll('.table-container').forEach(container => {
    observer.observe(container);
  });
});

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
