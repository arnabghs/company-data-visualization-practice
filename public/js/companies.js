const drawcompanies = companies => {
  let HEADING = "CMP";
  const MAX_HEIGHT_OF_DOMAIN = _.maxBy(companies, HEADING);
  const CHART_SIZE = { width: 800, height: 600 };
  const MARGIN = { left: 100, right: 10, top: 10, bottom: 150 };
  const WIDTH = CHART_SIZE.width - (MARGIN.left + MARGIN.right);
  const HEIGHT = CHART_SIZE.height - (MARGIN.top + MARGIN.bottom);

  const toLine = c => `<strong>${c.Name}</strong> <i>${c[HEADING]}</i>`;

  document.querySelector("#chart-data").innerHTML = companies
    .map(toLine)
    .join("<hr/>");

  const container = d3.select("#chart-area");

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  const svg = container
    .append("svg")
    .attr("width", CHART_SIZE.width)
    .attr("height", CHART_SIZE.height);

  g = svg
    .append("g")
    .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

  g.append("text")
    .attr("x", WIDTH / 2)
    .attr("y", HEIGHT + 140)
    .attr("class", "axis-label")
    .text("Companies");

  g.append("text")
    .attr("x", -HEIGHT / 2)
    .attr("y", -60)
    .attr("class", "y axis-label")
    .attr("transform", "rotate(-90)")
    .text(`${HEADING} (Rs.)`);

  const y = d3
    .scaleLinear()
    .domain([0, MAX_HEIGHT_OF_DOMAIN[HEADING]])
    .range([HEIGHT, 0]);

  const x = d3
    .scaleBand()
    .range([0, WIDTH])
    .domain(_.map(companies, "Name"))
    .padding(0.3);

  const yAxis = d3
    .axisLeft(y)
    .tickFormat(d => d + "Rs.")
    .ticks(5);

  const xAxis = d3.axisBottom(x);

  g.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${HEIGHT})`)
    .call(xAxis);

  g.selectAll(".x-axis text")
    .attr("y", 10)
    .attr("x", -5)
    .attr("transform", "rotate(-40)")
    .attr("text-anchor", "end");

  const rectangles = g.selectAll("rect").data(companies);
  const newRects = rectangles
    .enter()
    .append("rect")
    .attr("y", c => y(c[HEADING]))
    .attr("x", c => x(c.Name))
    .attr("width", x.bandwidth)
    .attr("height", c => y(0) - y(c[HEADING]))
    .attr("fill", c => colorScale(c.Name));
};

const parseCompany = function({ Name, ...numerics }) {
  _.forEach(numerics, (v, k) => (numerics[k] = +v));
  return { Name, ...numerics };
};

const main = () => {
  d3.csv("data/companies.csv", parseCompany).then(drawcompanies);
};

window.onload = main;
