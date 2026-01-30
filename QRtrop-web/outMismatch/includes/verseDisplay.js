// verseDisplay.js - JavaScript for displaying verse tables with selectable mismatch highlighting

document.addEventListener('DOMContentLoaded', function() {
  // Initialize mismatch selectors
  const selectors = document.querySelectorAll('.mismatch-selector select');
  selectors.forEach(selector => {
    selector.addEventListener('change', function() {
      const verseContainer = selector.closest('.verse-container');
      const mismatchIndex = selector.value;

      // Hide all mismatch data and show selected one
      const mismatchDatas = verseContainer.querySelectorAll('.mismatch-info .mismatch-data');
      mismatchDatas.forEach(data => {
        data.style.display = 'none';
        data.classList.remove('active-mismatch');
      });
      const selectedMismatchData = verseContainer.querySelector(`.mismatch-info .mismatch-${mismatchIndex}`);
      if (selectedMismatchData) {
        selectedMismatchData.style.display = 'block';
        selectedMismatchData.classList.add('active-mismatch');
      }

      // Update highlighting in tables
      const tables = verseContainer.querySelectorAll('.segment-table');
      tables.forEach(table => {
        // Remove all active highlights
        const cells = table.querySelectorAll('td');
        cells.forEach(cell => {
          cell.classList.remove('active-trop', 'active-syntax');
        });
        const tropSpans = table.querySelectorAll('.verse-trop');
        tropSpans.forEach(span => {
          span.classList.remove('active-trop');
        });
        const syntaxSpans = table.querySelectorAll('.syntax-part, .branch-end, .branch-start');
        syntaxSpans.forEach(span => {
          span.classList.remove('active-syntax');
        });

        // Add active highlights for selected mismatch
        cells.forEach(cell => {
          if (cell.classList.contains(`trop-mismatch-${mismatchIndex}`)) {
            cell.classList.add('active-trop');
          }
          if (cell.classList.contains(`syntax-mismatch-${mismatchIndex}`)) {
            cell.classList.add('active-syntax');
          }
        });
        tropSpans.forEach(span => {
          if (span.classList.contains(`mismatch-trop-${mismatchIndex}`)) {
            span.classList.add('active-trop');
          }
        });
        syntaxSpans.forEach(span => {
          if (span.classList.contains(`mismatch-syntax-${mismatchIndex}`)) {
            span.classList.add('active-syntax');
          }
        });
      });
    });

    // Trigger change event on load to set initial state (first mismatch selected by default)
    if (selector.options.length > 0) {
      selector.dispatchEvent(new Event('change'));
    }
  });
});
