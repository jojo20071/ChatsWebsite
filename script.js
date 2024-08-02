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
