


// Define margins and dimensions for the SVG container.
var margin = {top: 20, right: 20, bottom: 20, left: 20};
var width  = 450 - margin.left - margin.right;
var height = 300 - margin.top - margin.bottom;

// Data arrays for each box plot.
var bleu  = [86, 51, 42, 29, 89, 56, 73, 37, 81, 57, 54, 74, 72, 85, 56, 60, 72,
             75, 57, 89, 53, 77, 97, 77, 60, 86, 86, 60, 53, 77, 74, 50, 64, 90,
             51, 90, 73, 86, 55, 74, 64, 57, 75, 66, 58, 79, 55, 65, 62, 68, 20,
             50, 82, 76, 79, 71, 63, 78, 69, 76, 53, 91, 92, 83, 47, 72, 91, 80,
             51, 71, 64, 75, 78, 49, 92, 52, 82, 78, 57, 41, 28];
var rouge = [56, 77, 74, 50, 64, 90, 51, 90, 67, 98, 100, 54, 65];
var vert  = [62, 68, 50, 11, 63, 18, 69, 16, 53];

// Create the SVG container.
var svg = d3.select("#chart-container").selectAll("svg").data([null])
    .enter().append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Define the x-scale (linear scale for data values).
var x = d3.scaleLinear()
    .domain([0, 100])  // Assuming data is in range [0, 100].
    .range([0, width]);

// Add the x-axis.
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

// Function to calculate the box plot stats (min, Q1, median, Q3, max).
function calculateBoxPlotStats(data) {
    data.sort(d3.ascending);
    const q1 = d3.quantile(data, 0.25);
    const median = d3.quantile(data, 0.5);
    const q3 = d3.quantile(data, 0.75);
    const interQuantileRange = q3 - q1;
    const min = d3.max([d3.min(data), q1 - 1.5 * interQuantileRange]);
    const max = d3.min([d3.max(data), q3 + 1.5 * interQuantileRange]);
    return {min: min, q1: q1, median: median, q3: q3, max: max};
}

// Function to draw the box plot.
function moustache(svg, data, y, h, strokeC, fillC, x) {
    var stats = calculateBoxPlotStats(data);
    
    // Draw the main box (from Q1 to Q3).
    svg.append("rect")
        .attr("x", x(stats.q1))
        .attr("y", y - h / 2)
        .attr("width", x(stats.q3) - x(stats.q1))
        .attr("height", h)
        .attr("stroke", strokeC)
        .attr("fill", fillC);
    
    // Draw the median line.
    svg.append("line")
        .attr("x1", x(stats.median))
        .attr("x2", x(stats.median))
        .attr("y1", y - h / 2)
        .attr("y2", y + h / 2)
        .attr("stroke", strokeC);
    
    // Draw min and max lines (whiskers).
    svg.append("line")
        .attr("x1", x(stats.min))
        .attr("x2", x(stats.q1))
        .attr("y1", y)
        .attr("y2", y)
        .attr("stroke", strokeC);
    
    svg.append("line")
        .attr("x1", x(stats.max))
        .attr("x2", x(stats.q3))
        .attr("y1", y)
        .attr("y2", y)
        .attr("stroke", strokeC);
    
    // Draw vertical lines at min and max.
    svg.append("line")
        .attr("x1", x(stats.min))
        .attr("x2", x(stats.min))
        .attr("y1", y - h / 4)
        .attr("y2", y + h / 4)
        .attr("stroke", strokeC);
    
    svg.append("line")
        .attr("x1", x(stats.max))
        .attr("x2", x(stats.max))
        .attr("y1", y - h / 4)
        .attr("y2", y + h / 4)
        .attr("stroke", strokeC);
}

// Render the box plots for each dataset.
d3.select(window).on("load", function() {
    moustache(svg, bleu, 50, 30, "blue", "lightblue", x);
    moustache(svg, vert, 130, 30, "green", "lightgreen", x);
    moustache(svg, rouge, 210, 30, "red", "pink", x);
});