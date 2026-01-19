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
        // Handle overlaps
        const overlappingWords = new Set();
        document.querySelectorAll('.highlight-trop-bright.highlight-syntax-bright').forEach(td => {
          overlappingWords.add(td.dataset.word);
        });
        overlappingWords.forEach(word => {
          const td = table.querySelector(`td[data-word="${word}"]`);
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
        // Highlight trope dim
        for (let w = tropStart; w <= tropEnd; w++) {
          const td = table.querySelector(`td[data-word="${w}"]`);
          if (td) {
            td.classList.add('highlight-trop-dim');
          }
        }
        // Highlight syntax bright
        for (let w = syntaxStart; w <= syntaxEnd; w++) {
          const td = table.querySelector(`td[data-word="${w}"]`);
          if (td) {
            td.classList.add('highlight-syntax-bright');
          }
        }
        // Handle overlaps
        const overlappingWords = new Set();
        document.querySelectorAll('.highlight-trop-dim.highlight-syntax-bright').forEach(td => {
          overlappingWords.add(td.dataset.word);
        });
        overlappingWords.forEach(word => {
          const td = table.querySelector(`td[data-word="${word}"]`);
          if (td) {
            td.classList.remove('highlight-trop-dim', 'highlight-syntax-bright');
            td.classList.add('highlight-overlap');
          }
        });
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
        // Remove trope highlights
        for (let w = tropStart; w <= tropEnd; w++) {
          const td = table.querySelector(`td[data-word="${w}"]`);
          if (td) {
            td.classList.remove('highlight-trop-bright', 'highlight-trop-dim');
          }
        }
        // Remove syntax highlights
        for (let w = syntaxStart; w <= syntaxEnd; w++) {
          const td = table.querySelector(`td[data-word="${w}"]`);
          if (td) {
            td.classList.remove('highlight-syntax-bright', 'highlight-syntax-dim');
          }
        }
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
          highlightCellRange(table, 1, startCol, 1, endCol, 4, 1); // borderPx=4 for trope
        }

        // For syntax
        const syntaxCells = cells.filter(td => {
          const w = +td.dataset.word;
          return w >= syntaxStart && w <= syntaxEnd;
        });
        if (syntaxCells.length) {
          const startCol = cells.indexOf(syntaxCells[0]) + 1;
          const endCol = cells.indexOf(syntaxCells[syntaxCells.length - 1]) + 1;
          highlightCellRange(table, 1, startCol, 1, endCol, -4, 1); // borderPx=-4 for syntax
        }

        observer.unobserve(table);
      }
    });
  });

  document.querySelectorAll('table').forEach(table => {
    observer.observe(table);
  });
});

function highlightCellRange(table, startRow = 1, startCol, endRow = 1, endCol, borderPx = 3, borderThickPx = 1) {
  const rect = table.getBoundingClientRect();
  const rowStarts = Array.from(table.rows).slice(startRow - 1, endRow);
  const firstCell = rowStarts[0]?.cells[startCol - 1];
  const lastCell = rowStarts[rowStarts.length - 1]?.cells[endCol - 1];
  
  if (!firstCell || !lastCell) return;
  
  const firstRect = firstCell.getBoundingClientRect();
  const lastRect = lastCell.getBoundingClientRect();
  
  const left = firstRect.left - rect.left - borderPx;
  const top = firstRect.top - rect.top - borderPx;
  const width = lastRect.right - firstRect.left + borderPx * 2;
  const height = lastRect.bottom - firstRect.top + borderPx * 2;
  
  const highlight = document.createElement('div');
  highlight.className = 'cell-highlight';
  highlight.style.cssText = `
    position: absolute;
    top: ${top}px;
    left: ${left}px;
    width: ${width}px;
    height: ${height}px;
    border: ${borderThickPx}px solid red;
    pointer-events: none;
    z-index: 100;
    box-sizing: border-box;
  `;
  
  table.style.position = 'relative';
  table.style.overflow = 'visible';
  table.appendChild(highlight);
}