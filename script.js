document.addEventListener('DOMContentLoaded', () => {
    showPage('dashboard');
    loadData('https://api.mocki.io/v1/b043df5a', renderChart);
    loadPreferences();
});

let chartType = 'bar';
let chartData = [];
let filteredData = [];

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

function renderChart(data) {
    const svg = d3.select('#chart');
    svg.selectAll('*').remove();

    if (data.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = svg.attr('width') - margin.left - margin.right;
    const height = svg.attr('height') - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    if (chartType === 'bar') {
        const x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
        const y = d3.scaleLinear().rangeRound([height, 0]);

        x.domain(data.map(d => d.name));
        y.domain([0, d3.max(data, d => d.value)]);

        g.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        g.append('g')
            .attr('class', 'axis axis--y')
            .call(d3.axisLeft(y).ticks(10));

        g.selectAll('.bar')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.name))
            .attr('y', d => y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.value));
    } else if (chartType === 'line') {
        const x = d3.scaleTime().rangeRound([0, width]);
        const y = d3.scaleLinear().rangeRound([height, 0]);

        const line = d3.line()
            .x(d => x(new Date(d.date)))
            .y(d => y(d.value));

        x.domain(d3.extent(data, d => new Date(d.date)));
        y.domain(d3.extent(data, d => d.value));

        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        g.append('g')
            .call(d3.axisLeft(y));

        g.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1.5)
            .attr('d', line);
    } else if (chartType === 'pie') {
        const radius = Math.min(width, height) / 2;
        const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const pie = d3.pie().sort(null).value(d => d.value);
        const path = d3.arc().outerRadius(radius - 10).innerRadius(0);

        const arc = g.selectAll('.arc')
            .data(pie(data))
            .enter().append('g')
            .attr('class', 'arc');

        arc.append('path')
            .attr('d', path)
            .attr('fill', d => color(d.data.name));

        arc.append('text')
            .attr('transform', d => `translate(${path.centroid(d)})`)
            .attr('dy', '0.35em')
            .text(d => d.data.name);
    }
}

function applyFilter() {
    const filter = document.getElementById('filterInput').value.toLowerCase();
    filteredData = chartData.filter(d => d.name.toLowerCase().includes(filter));
    renderChart(filteredData);
}

function applyZoom() {
    const zoomLevel = document.getElementById('zoomInput').value;
    // Implement zoom logic here
}

function uploadData() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const data = d3.csvParse(reader.result);
        chartData = data;
        filteredData = data;
        renderChart(data);
    };
    reader.readAsText(file);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    savePreferences();
}

function validateForm(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    if (name && email && message) {
        alert('Form submitted successfully!');
        document.getElementById('contactForm').reset();
    } else {
        alert('Please fill out all fields.');
    }
}

function savePreferences() {
    const darkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', darkMode);
}

function loadPreferences() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
}
function validateForm(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    const feedback = document.getElementById('formFeedback');

    if (name && email && message) {
        feedback.textContent = 'Form submitted successfully!';
        feedback.style.color = 'green';
        document.getElementById('contactForm').reset();
    } else {
        feedback.textContent = 'Please fill out all fields.';
        feedback.style.color = 'red';
    }
}

function toggleFaq(button) {
    const answer = button.nextElementSibling;
    if (answer.style.display === 'block') {
        answer.style.display = 'none';
    } else {
        answer.style.display = 'block';
    }
}d