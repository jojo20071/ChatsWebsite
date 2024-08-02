document.addEventListener('DOMContentLoaded', () => {
    showPage('dashboard');
    loadData('https://api.mocki.io/v1/b043df5a', renderChart);
});