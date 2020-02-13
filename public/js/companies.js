const CHART_SIZE = { width: 800, height: 600 };
const MARGIN = { left: 100, right: 10, top: 10, bottom: 150 };
const WIDTH = CHART_SIZE.width - (MARGIN.left + MARGIN.right);
const HEIGHT = CHART_SIZE.height - (MARGIN.top + MARGIN.bottom);

const renderList = function(companies, property) {
  const toLine = c => `<strong>${c.Name}</strong> <i>${c[property]}</i>`;

  document.querySelector("#chart-data").innerHTML = companies
    .map(toLine)
    .join("<hr/>");
};

const RsFormat = d => `${d} ₹`;
const percentageFormat = d => `${d}%`;
const kCroresFormat = d => `${d / 1000}K Cr ₹`;

const formats = {
  CMP: RsFormat,
  PE: RsFormat,
  MarketCap: kCroresFormat,
  DivYld: percentageFormat,
  ROCE: percentageFormat,
  QNetProfit: kCroresFormat,
  QSales: kCroresFormat
};

const updateCompanies = function(companies, fieldName) {
  renderList(companies, fieldName);

  const svg = d3.select("#chart-area svg");
  svg.select(".y.axis-label").text(fieldName);

  const maxValue = _.get(_.maxBy(companies, fieldName), fieldName, 0);

  const y = d3
    .scaleLinear()
    .domain([0, maxValue])
    .range([HEIGHT, 0]);

  const yAxis = d3
    .axisLeft(y)
    .tickFormat(formats[fieldName])
    .ticks(5);

  svg.select(".y-axis").call(yAxis);

  const t = d3
    .transition()
    .duration(1000)
    .ease(d3.easeLinear);

  const x = d3
    .scaleBand()
    .range([0, WIDTH])
    .domain(_.map(companies, "Name"))
    .padding(0.3);

  const xAxis = d3.axisBottom(x);
  svg.select(".x-axis").call(xAxis);

  svg
    .selectAll("rect")
    .transition(t)
    .attr("y", c => y(c[fieldName]))
    .attr("height", c => y(0) - y(c[fieldName]) || 0)
    .attr("x", c => x(c.Name))
    .attr("width", x.bandwidth);

  svg
    .selectAll("rect")
    .data(companies, c => c.Name)
    .exit()
    .remove()
    .transition(t);
};

const drawcompanies = companies => {
  let HEADING = "CMP";
  const MAX_HEIGHT_OF_DOMAIN = _.maxBy(companies, HEADING);

  renderList(companies, HEADING);

  const container = d3.select("#chart-area");

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  const svg = container
    .select("#chart-area svg")
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
    .attr("id", "Y-axis-header")
    .attr("x", -HEIGHT / 2)
    .attr("y", -60)
    .attr("class", "y axis-label")
    .attr("transform", "rotate(-90)")
    .text(`${HEADING}`);

  const y = d3
    .scaleLinear()
    .domain([0, MAX_HEIGHT_OF_DOMAIN[HEADING]])
    .range([HEIGHT, 0]);

  const x = d3
    .scaleBand()
    .range([0, WIDTH])
    .domain(_.map(companies, "Name"))
    .padding(0.3);

  const xAxis = d3.axisBottom(x);

  const yAxis = d3
    .axisLeft(y)
    .tickFormat(d => d + "₹")
    .ticks(5);

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

  // const headings = ["CMP", "PE", "MarketCap"];
  // let changer = setInterval(() => {
  //   headings.push(headings.shift());
  //   const curr_head = headings[0];

  //   renderList(companies, curr_head);
  //   d3.select("#Y-axis-header").text(`${curr_head} (₹)`);
  //   y.domain([0, _.maxBy(companies, curr_head)[curr_head]]);
  //   d3.select(".y-axis").call(yAxis);

  //   newRects
  //     .attr("y", c => y(c[curr_head]))
  //     .attr("height", c => y(0) - y(c[curr_head]));
  // }, 2000);
};

const parseCompany = function({ Name, ...numerics }) {
  _.forEach(numerics, (v, k) => (numerics[k] = +v));
  return { Name, ...numerics };
};

const main = () => {
  d3.csv("data/companies.csv", parseCompany).then(companies => {
    drawcompanies(companies);
    const fields = "CMP,PE,MarketCap,DivYld,QNetProfit,QSales,ROCE".split(",");
    let step = 1;
    setInterval(
      () => updateCompanies(companies, fields[step++ % fields.length]),
      2000
    );
    setInterval(() => {
      companies.shift();
    }, 5000);
  });
};

window.onload = main;
