const cytoscape = require('cytoscape');
const style = require("./style");

// Function to generate Cytoscape-compatible elements from slimo flow data
function generateGraphElements(flowData) {
  const elements = [];
  const nodesMap = new Map();

  const addNode = (step) => {
    const nodeId = `step-${step.index}`;
    if (!nodesMap.has(nodeId)) {
      nodesMap.set(nodeId, true);
      elements.push({
        data: { id: nodeId, label: step.msg }
      });
    }
    return nodeId;
  };

  const processStep = (step) => {
    const nodeId = addNode(step);
    step.nextStep.forEach((next) => {
      if (typeof next === 'string') {
        const loopIndex = next.match(/step (\d+)/)[1];
        elements.push({
          data: { source: nodeId, target: `step-${loopIndex}`, label: 'Loop' }
        });
      } else {
        const nextId = addNode(next);
        elements.push({
          data: { source: nodeId, target: nextId }
        });
        processStep(next);
      }
    });
  };

  flowData.steps.forEach(processStep);
  return elements;
}

// Function to initialize Cytoscape graph in a provided container
function initializeGraph(container, flowData) {
  const graphElements = generateGraphElements(flowData);

  const cy = cytoscape({
    container: container, // User will pass the container
    elements: graphElements,
    style: style,
    layout: {
      name: 'breadthfirst', // Can be customized by the user
      directed: true
    }
  });

  // Example interaction: Highlight node on hover
  cy.on('mouseover', 'node', (event) => {
    event.target.style('background-color', '#f00');
  });

  // Allow further interactions (clicks, etc.) to be defined outside this package
  return cy;
}

// Export the functions for external usage
module.exports = {
  generateGraphElements,
  initializeGraph
};
