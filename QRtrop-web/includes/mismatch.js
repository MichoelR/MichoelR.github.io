document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.branch-end, .branch-start').forEach(span => {
    span.addEventListener('mouseover', function() {
      const id = this.id;
      if (!id) return;
      const parts = id.split('-');
      const start = parseInt(parts[4]);
      const end = parseInt(parts[5]);
      const isTrope = id.startsWith('trop-');
      const table = span.closest('table');
      if (table) {
        for (let w = start; w <= end; w++) {
          const td = table.querySelector(`td[data-word="${w}"]`);
          if (td) {
            td.classList.add(isTrope ? 'highlight-trop-bright' : 'highlight-syntax-bright');
          }
        }
        // Highlight matching bracket
        const dirIndex = isTrope ? 6 : 8;
        const direction = parts[dirIndex];
        const pairDirection = direction === 'L' ? 'R' : 'L';
        const pairParts = [...parts];
        pairParts[dirIndex] = pairDirection;
        const pairId = pairParts.join('-');
        const pairSpan = document.getElementById(pairId);
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
            // find the paired left paren
            const pairDirection = 'L';
            const pairParts = [...parts];
            pairParts[dirIndex] = pairDirection;
            const pairId = pairParts.join('-');
            leftParen = document.getElementById(pairId);
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
        document.querySelectorAll('.highlight-trop-bright.highlight-syntax-bright').forEach(td => {
          overlappingWords.add(td.dataset.word);
        });
        overlappingWords.forEach(word => {
          const td = table.querySelector('td[data-word="' + word + '"]');
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
      const start = parseInt(parts[4]);
      const end = parseInt(parts[5]);
      const isTrope = id.startsWith('trop-');
      const table = span.closest('table');
      if (table) {
        for (let w = start; w <= end; w++) {
          const td = table.querySelector(`td[data-word="${w}"]`);
          if (td) {
            td.classList.remove(isTrope ? 'highlight-trop-bright' : 'highlight-syntax-bright', 'highlight-overlap');
          }
        }
        // Remove highlight from matching bracket
        const dirIndex = isTrope ? 6 : 8;
        const direction = parts[dirIndex];
        const pairDirection = direction === 'L' ? 'R' : 'L';
        const pairParts = [...parts];
        pairParts[dirIndex] = pairDirection;
        const pairId = pairParts.join('-');
        const pairSpan = document.getElementById(pairId);
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
            // find the paired left paren
            const pairDirection = 'L';
            const pairParts = [...parts];
            pairParts[dirIndex] = pairDirection;
            const pairId = pairParts.join('-');
            leftParen = document.getElementById(pairId);
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
      const [tropStart, tropEnd] = tropSpan.dataset.words.split('-').map(Number);
      const [syntaxStart, syntaxEnd] = syntaxSpan.dataset.words.split('-').map(Number);
      const table = mismatchDiv.nextElementSibling;
      if (table) {
        if (!this.closest('td')) {
          // Compute overlap words
          const overlapWords = new Set();
          for (let w = Math.max(tropStart, syntaxStart); w <= Math.min(tropEnd, syntaxEnd); w++) {
            overlapWords.add(w);
          }
          if (this.classList.contains('verse-trop')) {
            // Hovering over trop words: highlight trop-only gold, overlap violet
            for (let w = tropStart; w <= tropEnd; w++) {
              const td = table.querySelector(`td[data-word="${w}"]`);
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
              const td = table.querySelector(`td[data-word="${w}"]`);
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
      const [tropStart, tropEnd] = tropSpan.dataset.words.split('-').map(Number);
      const [syntaxStart, syntaxEnd] = syntaxSpan.dataset.words.split('-').map(Number);
      const table = mismatchDiv.nextElementSibling;
      if (table) {
        // Remove all highlights
        for (let w = Math.min(tropStart, syntaxStart); w <= Math.max(tropEnd, syntaxEnd); w++) {
          const td = table.querySelector(`td[data-word="${w}"]`);
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
  document.querySelectorAll('table tr:nth-child(2) .verse-trop').forEach(span => {  // second row is trope row
    // Only add listeners if it's a mafsik: has a left paren directly to its left
    if (!span.previousElementSibling || !span.previousElementSibling.classList.contains('branch-end')) return;
    span.addEventListener('mouseover', function() {
      const table = this.closest('table');
      if (!table) return;
      // Get left paren
      const leftParen = this.previousElementSibling;
      if (!leftParen || !leftParen.classList.contains('branch-end')) return;
      // Parse left paren's id for start, end
      const id = leftParen.id;
      if (!id) return;
      const parts = id.split('-');
      const start = parseInt(parts[4]);
      const end = parseInt(parts[5]);
      const isTrope = id.startsWith('trop-');
      // Highlight word range
      for (let w = start; w <= end; w++) {
        const td = table.querySelector(`td[data-word="${w}"]`);
        if (td) {
          td.classList.add(isTrope ? 'highlight-trop-bright' : 'highlight-syntax-bright');
        }
      }
      // Highlight mafsik
      this.classList.add('highlight-pair');
      // Highlight left paren
      leftParen.classList.add('highlight-pair');
      // Highlight right paren (paired)
      const dirIndex = isTrope ? 6 : 8;
      const direction = parts[dirIndex];
      const pairDirection = direction === 'L' ? 'R' : 'L';
      const pairParts = [...parts];
      pairParts[dirIndex] = pairDirection;
      const pairId = pairParts.join('-');
      const rightParen = document.getElementById(pairId);
      if (rightParen) {
        rightParen.classList.add('highlight-pair');
      }
      // Handle overlaps
      const overlappingWords = new Set();
      document.querySelectorAll('.highlight-trop-bright.highlight-syntax-bright').forEach(td => {
        overlappingWords.add(td.dataset.word);
      });
      overlappingWords.forEach(word => {
        const td = table.querySelector('td[data-word="' + word + '"]');
        if (td) {
          td.classList.remove('highlight-trop-bright', 'highlight-syntax-bright');
          td.classList.add('highlight-overlap');
        }
      });
    });
    span.addEventListener('mouseout', function() {
      const table = this.closest('table');
      if (!table) return;
      // Get left paren
      const leftParen = this.previousElementSibling;
      if (!leftParen || !leftParen.classList.contains('branch-end')) return;
      // Parse left paren's id for start, end
      const id = leftParen.id;
      if (!id) return;
      const parts = id.split('-');
      const start = parseInt(parts[4]);
      const end = parseInt(parts[5]);
      const isTrope = id.startsWith('trop-');
      // Remove word highlights
      for (let w = start; w <= end; w++) {
        const td = table.querySelector(`td[data-word="${w}"]`);
        if (td) {
          td.classList.remove(isTrope ? 'highlight-trop-bright' : 'highlight-syntax-bright', 'highlight-overlap');
        }
      }
      // Remove mafsik highlight
      this.classList.remove('highlight-pair');
      // Remove left paren highlight
      leftParen.classList.remove('highlight-pair');
      // Remove right paren highlight
      const dirIndex = isTrope ? 6 : 8;
      const direction = parts[dirIndex];
      const pairDirection = direction === 'L' ? 'R' : 'L';
      const pairParts = [...parts];
      pairParts[dirIndex] = pairDirection;
      const pairId = pairParts.join('-');
      const rightParen = document.getElementById(pairId);
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
        const table = entry.target;
        const mismatchDiv = table.previousElementSibling;
        if (!mismatchDiv) return;
        if (!mismatchDiv.classList.contains('mismatch_data')) return;

        const tropSpan = mismatchDiv.querySelector('.verse-trop');
        const syntaxSpan = mismatchDiv.querySelector('.verse-syntax');
        if (!tropSpan || !syntaxSpan) return;
        const [tropStart, tropEnd] = tropSpan.dataset.words.split('-').map(Number);
        const [syntaxStart, syntaxEnd] = syntaxSpan.dataset.words.split('-').map(Number);

        const row = table.rows[0]; // words row
        const cells = Array.from(row.cells);

        // For trope
        const tropCells = cells.filter(td => {
          const w = +td.dataset.word;
          return w >= tropStart && w <= tropEnd;
        });
        if (tropCells.length) {
          const startCol = cells.indexOf(tropCells[0]) + 1;
          const endCol = cells.indexOf(tropCells[tropCells.length - 1]) + 1;
          highlightCellRange(table, 1, startCol, 1, endCol, 4, 1.5, 'orange'); // borderPx=4 for trope
        }

        // For syntax
        const syntaxCells = cells.filter(td => {
          const w = +td.dataset.word;
          return w >= syntaxStart && w <= syntaxEnd;
        });
        if (syntaxCells.length) {
          const startCol = cells.indexOf(syntaxCells[0]) + 1;
          const endCol = cells.indexOf(syntaxCells[syntaxCells.length - 1]) + 1;
          highlightCellRange(table, 1, startCol, 1, endCol, -4, 1.5, 'blue'); // borderPx=-4 for syntax
        }

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

        observer.unobserve(table);
      }
    });
  });

  document.querySelectorAll('table').forEach(table => {
    observer.observe(table);
  });
});

function highlightCellRange(table, startRow = 1, startCol, endRow = 1, endCol, borderPx = 3, borderThickPx = 1, color = 'red') {
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
  highlight.className = 'cell-highlight';
  highlight.style.cssText = `position: absolute; top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px; border: ${borderThickPx}px solid ${color}; pointer-events: none; z-index: 100; box-sizing: border-box;`;
  
  table.style.position = 'relative';
  table.style.overflow = 'visible';
  table.appendChild(highlight);
}