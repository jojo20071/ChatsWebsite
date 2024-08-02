document.addEventListener('DOMContentLoaded', () => {
    showPage('dashboard');
    loadData('https://api.mocki.io/v1/b043df5a', renderChart);
});

let chartType = 'bar';
let chartData = [1,2,3,4,5,6];
let filteredData = [1,2,34,5,67];

function showPage(page) {
    document.querySelectorAll('.page').forEach(section => section.classList.remove('active'));
    document.getElementById(page).classList.add('active');
}

function setChartType(type) {
    chartType = type;
    renderChart(filteredData);
}

function loadData(url, callback) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            chartData = data;
            filteredData = data;
            callback(data);
        })
        .catch(error => console.error('Error fetching data:', error));
}