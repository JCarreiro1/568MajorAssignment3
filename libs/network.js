// Function to create the network
function simulate(data,svg)
{
    // Defining the width/height of the viewbox as constants
    let width = parseInt(svg.attr("viewBox").split(' ')[2])
    let height = parseInt(svg.attr("viewBox").split(' ')[3])

    // Creating a group for the nodes and links to be appended to
    let main_group = svg.append("g")

   // Place to store node degrees:
    let node_degree={}; //initiate an object

    // Actually calculating the degrees
   d3.map(data.links, (d)=>{
       if(node_degree.hasOwnProperty(d.source))
       {
           node_degree[d.source]++
       }
       else{
           node_degree[d.source]=0
       }
       if(node_degree.hasOwnProperty(d.target))
       {
           node_degree[d.target]++
       }
       else{
           node_degree[d.target]=0
       }
   })

    // Creating a scale to give nodes different sizes
    let scale_radius = d3.scaleLinear()
        .domain(d3.extent(Object.values(node_degree)))
        .range([3,12]);

    let color = d3.scaleOrdinal(d3.schemeCategory10);

    // Adding links
    let link_elements = main_group.append("g")
        .attr('transform',`translate(${width/2},${height/2})`)
        .selectAll(".line")
        .data(data.links)
        .enter()
        .append("line")
        .style("stroke", "black")
        .style("stroke-width", "0.5px");

    // Adding nodes
    let node_elements = main_group.append("g")
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll(".circle")
        .data(data.nodes)
        .enter()
        .append("g")
        .attr("class", function (d) {
            return d.id
        })
        // Encoding color based on the country affiliated with each author
        .attr("fill", (d,i)=>color(d.Country))

    // Using the scale to size based on degree of the node
    node_elements.append("circle")
        .attr("r", function (d, i) {
            if(node_degree[d.id] !== undefined){
                return scale_radius(node_degree[d.id])
            }
            else {
                return scale_radius(0)
            }
        })

    // Creating the force simulation to arrange nodes
    // Uses charge and collide to avoid node overlap
    let ForceSimulation = d3.forceSimulation(data.nodes)
        .force("collide",
            d3.forceCollide().radius( (d,i)=> scale_radius(node_degree[d.id])*1.2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody())
        .force("link",d3.forceLink(data.links)
            .id(function (d){
                return d.id
            })
            // .distance(d=>d.value)
            // .strength(d=>d.value*.1)
        )
        .on("tick", ticked);

    // Tick function to update position of elements on every tick
    function ticked()
    {
        // Updating nodes
        node_elements
            .attr('transform', function (d){return `translate(${d.x}, ${d.y})`})

        // Updating links
        link_elements
            .attr("x1",function(d){return d.source.x})
            .attr("x2",function(d){return d.target.x})
            .attr("y1",function(d){return d.source.y})
            .attr("y2",function(d){return d.target.y})

    }

    // Calling the zoom function to allow the user to zoom in the svg
    svg.call(d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([1, 8])
        .on("zoom", zoomed));

    // Function for zooming
    function zoomed ({transform}) {
        main_group.attr("transform", transform)
    }
}

