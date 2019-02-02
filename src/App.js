import React, { Component } from "react";
import "./App.css";
var d3 = require("d3");

class App extends Component {
  constructor(props) {
    super(props);
    this.addNode = this.addNode.bind(this);
    this.selectForDeletion = this.selectForDeletion.bind(this);
    this.nodeForLink = this.nodeForLink.bind(this);
    this.restart = this.restart.bind(this);
    this.deleteNode = this.deleteNode.bind(this);
  }

  componentDidMount() {
    this.createD3Layout();
  }

  createD3Layout() {
    const width = 500;
    const height = 500;

    this.currentNode = {};
    this.lastNode = {};
    this.sourceNode = undefined;
    this.nodeToDelete = undefined;

    this.svg = d3
      .select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    this.force = d3.layout
      .force()
      .size([width, height])
      .nodes([])
      .linkDistance(30)
      .charge(-160)
      .gravity(0.015);

    this.nodes = this.force.nodes();
    this.links = this.force.links();
    this.node = this.svg.selectAll(".node");
    this.link = this.svg.selectAll(".link");

    this.force.on("tick", () => {
      this.svg
        .selectAll(".link")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      this.node.attr("transform", d => "translate(" + d.x + "," + d.y + ")");
    });
  }

  addNode() {
    var newNode = {
      x: 0,
      y: 0,
      text: document.getElementById("nodeN").value,
      isSelected: false
    };

    this.nodes.push(newNode);
    this.restart();
  }

  selectForDeletion(node, index) {
    var isSelected = node.isSelected;
    d3.selectAll("g").style("fill", "#000000");
    this.nodes.forEach(node => (node.isSelected = false));

    d3.selectAll("g")
      .filter(g => g.index === index)
      .style("fill", n => {
        n.isSelected = !isSelected;
        if (n.isSelected) {
          this.nodeToDelete = n;
          return "#ff0000";
        } else {
          return "#000000";
        }
      });
  }

  nodeForLink(node, index) {
    if (this.sourceNode) {
      this.links.push({ source: this.sourceNode, target: node });
      this.sourceNode = undefined;
    } else {
      this.sourceNode = node;
    }
    this.restart();
  }

  deleteNode() {
    if (this.nodeToDelete !== undefined) {
      this.nodes.splice(this.nodeToDelete.index, 1);
      this.links = this.links.filter(link => {
        return (
          (link.source !== this.nodeToDelete) &
          (this.link.target !== this.nodeToDelete)
        );
      });
    }
    this.nodeToDelete = undefined;
    this.sourceNode = undefined;

    this.restart();
  }

  restart() {
    this.node = this.node.data(this.nodes, d => d.x + d.y);

    var groupElement = this.node
      .enter()
      .append("g")
      .attr("class", "node")
      .on("dblclick", this.selectForDeletion);

    groupElement
      .append("circle")
      .attr("class", "circle")
      .attr("r", 10)
      .call(this.force.drag)
      .on("mousedown", this.nodeForLink);

    groupElement
      .append("text")
      .attr("dx", 15)
      .attr("dy", 1)
      .text(node => {
        return node.text;
      });

    this.node.exit().remove();

    this.link = this.link.data(this.links);

    this.link
      .enter()
      .insert("line", ".node")
      .attr("class", "link");

    this.link.exit().remove();

    this.force.start();
  }

  render() {
    return (
      <div>
        <p>d3 visualization layout force example</p>
        <div className="something" />
        <input type="text" id="nodeN" />
        <button onClick={this.addNode}> Add </button>
        <button onClick={this.deleteNode}> Delete </button>
      </div>
    );
  }
}

export default App;
