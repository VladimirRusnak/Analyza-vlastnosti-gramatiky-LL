// This file is for the input tree editor, which is used for defining grammar rules

// Elements
const consoleTree = document.getElementById("tree--console-output");
const execudeCodeBtnTree = document.getElementById("tree--btn-run");
const resetCodeBtnTree = document.getElementById("tree--btn-reset");
const exampleBtnTree = document.getElementById("tree--btn-example");

// Default settings for the input tree editor
const defaultTreeElements = [
  { data: { id: "node0", label: "S" }, position: { x: 0, y: 0 } },
];

exampleBtnEditor.addEventListener("click", () => {
  sessionStorage.setItem(
    "userTree",
    JSON.stringify(
      cy.elements().map((el) => {
        return el.json();
      })
    )
  );

  code_editor_lib.clearConsoleScreen();
  sessionStorage.setItem("isProcessed", "false");
  deactivateTabs();
});

// Setting the events on execute and reset buttons
execudeCodeBtnTree.addEventListener("click", () => {
  // Get input from the parse tree
  const userTree = getRules(cy.nodes());
  sessionStorage.setItem("editorContent", userTree);

  fetch("/process_grammar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grammar: userTree,
      sessionId: sessionStorage.getItem("sessionId"),
    }),
  }).then(() => {
    fetch("/get_message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: sessionStorage.getItem("sessionId"),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((response) => {
        if (response.includes("(e)")) {
          sessionStorage.setItem("isProcessed", "false");
          response = response.substring(3);
          deactivateTabs();

          consoleTree.classList.remove("editor--console-output-animate-in");
          consoleTree.innerHTML = response;
          consoleTree.classList.add("editor--console-output-animate-in");
        } else {
          fetch("/get_table", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: sessionStorage.getItem("sessionId"),
          }).then(() => {
            fetch("/is_found_conflict", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: sessionStorage.getItem("sessionId"),
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Network response was not ok");
                }
                return response.json();
              })
              .then((response) => {
                localStorage.setItem("found_conflict", response);
              })
              .catch((error) => {
                console.error("Error fetching string:", error);
              });
          });
        }
      });

    consoleTree.classList.remove("editor--console-output-animate-in");
    consoleTree.innerHTML =
      'Gramatika bola <span class="success">úspešne</span> spracovaná. Výsledky analýzy nájdete na karte <strong>Množiny analýzy</strong>.  ';
    consoleTree.classList.add("editor--console-output-animate-in");

    sessionStorage.removeItem("input_word");
    sessionStorage.setItem(
      "userTree",
      JSON.stringify(
        cy.elements().map((el) => {
          return el.json();
        })
      )
    );
    sessionStorage.setItem("isProcessed", "true");
    activateTabs();
  });
});

resetCodeBtnTree.addEventListener("click", () => {
  cy.elements().remove();
  cy.add(defaultTreeElements);

  consoleTree.classList.remove("editor--console-output-animate-in");
  consoleTree.innerHTML =
    "Strom odvodenia bol <strong>odstránený</strong>. Prosím, skonštruujte nový strom a <strong>spracujte</strong> ho.";
  consoleTree.classList.add("editor--console-output-animate-in");

  sessionStorage.setItem("isProcessed", "false");
  deactivateTabs();
});

// Initializing the cy variable (cytoscape libraries), which is responsible for the drawing of the input tree
var cy = cytoscape({
  container: document.getElementById("input-tree"),
  elements: defaultTreeElements,
  style: [
    {
      selector: "node",
      style: {
        width: "45px",
        height: "45px",
        "font-family": "Jaldi, sans-serif",
        "background-color": "white",
        "font-size": "21px",
        "border-width": 1,
        "border-color": "#000000",
        "border-opacity": 0.2,
        "border-style": "solid",
        "text-valign": "center",
        "text-halign": "center",
        label: "data(label)",
      },
    },
    {
      selector: "node[[outdegree = 0]]",
      style: {
        "border-color": "#009B48",
        "border-opacity": 0.5,
        "font-weight": "bolder",
        color: "#009B48",
      },
    },
    {
      selector: "edge",
      style: {
        width: 1,
        "line-color": "#000000",
        "line-opacity": 0.3,
        "line-style": "solid",
      },
    },
  ],
  layout: { name: "preset" },
  wheelSensitivity: 0.2,
  grabbable: true,
});

// Adjusting the zooming in and out
cy.on("wheel", (event) => {
  const deltaY = event.originalEvent.deltaY;
  const zoomAmount = deltaY > 0 ? -0.001 : 0.001;
  const currentZoom = cy.zoom();
  const newZoom = currentZoom + zoomAmount;

  cy.zoom({
    level: newZoom,
    renderedPosition: {
      x: event.renderedPosition.x,
      y: event.renderedPosition.y,
    },
  });
});

// Calculate the zoom level based on the graph's dimensions
var graphWidth = cy.width();
var graphHeight = cy.height();
var initialZoomLevel =
  Math.min(
    cy.container().clientWidth / graphWidth,
    cy.container().clientHeight / graphHeight
  ) * 2.5;

// Adjust the initial zoom
cy.zoom(initialZoomLevel);

// Defining the new event for adding new nodes
cy.on("dbltap", "node", function (evt) {
  var clickedNode = evt.target;
  var newNodeId = "node" + (cy.nodes().length + 1);
  cy.add([
    {
      data: { id: newNodeId, label: "" },
      position: {
        x: clickedNode.position().x,
        y: clickedNode.position().y + 100,
      },
    },
    {
      data: {
        id: "edge" + newNodeId,
        source: clickedNode.id(),
        target: newNodeId,
      },
    },
  ]);
});

// Defining the new event for deleting the nodes
cy.on("cxttap", "node", function (evt) {
  var tgt = evt.target || evt.cyTarget;
  if (!(tgt.id() == "start")) tgt.remove();
});

// Defining the new event for naming the nodes
cy.on("taphold", function (evt) {
  if (evt.target.isNode()) {
    var clickedNode = evt.target;
    var nodeName = prompt("Enter a new name for the node:");

    if (nodeName !== null) {
      clickedNode.data("id", "node_" + nodeName);
      clickedNode.data("label", nodeName);
    }
  }
});

// My defined functions for tree

// Getting the degree of the given node
function getNodeDegree(nodeId) {
  var node = cy.getElementById(nodeId);
  var edges = node.connectedEdges();
  return edges.length;
}

// Parsing the nodes into grammar rules
function getRules(nodes) {
  let rulesMap = new Map();

  nodes.forEach((el) => {
    let nonTerminal = el.data("label");
    let rule = "";
    let children = getChildren(el);

    children.forEach((child) => {
      if (child.data("label") == "ε") {
        rule += "ε ";
      } else if (getNodeDegree(child.data("id")) == 1) {
        rule += "'" + child.data("label") + "' ";
      } else {
        rule += child.data("label") + " ";
      }
    });

    if (rulesMap.has(nonTerminal)) {
      let existingRule = rulesMap.get(nonTerminal);
      if (!existingRule.includes(rule.trim())) {
        rulesMap.set(nonTerminal, existingRule + " | " + rule.trim());
      }
    } else if (rule.length != 0) {
      rulesMap.set(nonTerminal, rule.trim());
    }
  });

  let rules = "";
  rulesMap.forEach((value, key) => {
    rules += key + " → " + value + "\n";
  });

  return rules.trim();
}

// Getting all the children nodes of the given node
function getChildren(node) {
  childrenEdges = cy.elements('edge[source="' + node.data("id") + '"]');
  childrenNodes = childrenEdges.map((el) => {
    return el.target();
  });
  return childrenNodes;
}

// Reloading the input tree (if user have already constructed part of it)
if (sessionStorage.getItem("userTree")) {
  inputTreeElements = JSON.parse(sessionStorage.getItem("userTree"));
  cy.elements().remove();
  cy.add(inputTreeElements);
}

exampleBtnTree.addEventListener("click", () => {
  cy.elements().remove();
  cy.add(getExampleTree());
  code_editor_lib.clearConsoleScreen();
  sessionStorage.setItem("isProcessed", "false");
  deactivateTabs();
});

var treeExamples = [
  [
    {
      group: "nodes",
      data: {
        id: "node_S0",
        label: "S",
      },
      position: {
        x: 0,
        y: 0,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_[0",
        label: "[",
      },
      position: {
        x: -75,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_A0",
        label: "A",
      },
      position: {
        x: 0,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_]0",
        label: "]",
      },
      position: {
        x: 75,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_(0",
        label: "(",
      },
      position: {
        x: -75,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_B0",
        label: "B",
      },
      position: {
        x: 0,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_)0",
        label: ")",
      },
      position: {
        x: 75,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_n0",
        label: "n",
      },
      position: {
        x: 0,
        y: 300,
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0[0",
        source: "node_S0",
        target: "node_[0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0A0",
        source: "node_S0",
        target: "node_A0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0]0",
        source: "node_S0",
        target: "node_]0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_A0(0",
        source: "node_A0",
        target: "node_(0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_A0B0",
        source: "node_A0",
        target: "node_B0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_A0)0",
        source: "node_A0",
        target: "node_)0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_B0n0",
        source: "node_B0",
        target: "node_n0",
      },
    },
  ],
  [
    {
      group: "nodes",
      data: {
        id: "node_S0",
        label: "S",
        weight: 0,
      },
      position: {
        x: -150,
        y: 0,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_a0",
        label: "a",
        weight: 2,
      },
      position: {
        x: -263,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_b0",
        label: "b",
        weight: 2,
      },
      position: {
        x: -188,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_D0",
        label: "D",
        weight: 0,
      },
      position: {
        x: -113,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_E0",
        label: "E",
        weight: 0,
      },
      position: {
        x: -38,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_e0",
        label: "e",
        weight: 2,
      },
      position: {
        x: -151,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_f0",
        label: "f",
        weight: 2,
      },
      position: {
        x: -76,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_a1",
        label: "a",
        weight: 2,
      },
      position: {
        x: -1,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_b1",
        label: "b",
        weight: 2,
      },
      position: {
        x: 74,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_c0",
        label: "c",
        weight: 2,
      },
      position: {
        x: 149,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_D1",
        label: "D",
        weight: 0,
      },
      position: {
        x: 224,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_o0",
        label: "o",
        weight: 2,
      },
      position: {
        x: 224,
        y: 300,
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0a0",
        source: "node_S0",
        target: "node_a0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0b0",
        source: "node_S0",
        target: "node_b0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0D0",
        source: "node_S0",
        target: "node_D0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0E0",
        source: "node_S0",
        target: "node_E0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_D0e0",
        source: "node_D0",
        target: "node_e0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_D0f0",
        source: "node_D0",
        target: "node_f0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_E0a1",
        source: "node_E0",
        target: "node_a1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_E0b1",
        source: "node_E0",
        target: "node_b1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_E0c0",
        source: "node_E0",
        target: "node_c0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_E0D1",
        source: "node_E0",
        target: "node_D1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_D1o0",
        source: "node_D1",
        target: "node_o0",
      },
    },
  ],
  [
    {
      group: "nodes",
      data: {
        id: "node_S0",
        label: "S",
        weight: 0,
      },
      position: {
        x: -75,
        y: 0,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_a0",
        label: "a",
        weight: 2,
      },
      position: {
        x: -188,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_A0",
        label: "A",
        weight: 0,
      },
      position: {
        x: -113,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_b0",
        label: "b",
        weight: 2,
      },
      position: {
        x: -38,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_B0",
        label: "B",
        weight: 0,
      },
      position: {
        x: 37,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_c0",
        label: "c",
        weight: 2,
      },
      position: {
        x: -188,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_O0",
        label: "O",
        weight: 0,
      },
      position: {
        x: -113,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_d0",
        label: "d",
        weight: 2,
      },
      position: {
        x: -38,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_o0",
        label: "o",
        weight: 2,
      },
      position: {
        x: -113,
        y: 300,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_c1",
        label: "c",
        weight: 2,
      },
      position: {
        x: 37,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_L0",
        label: "L",
        weight: 0,
      },
      position: {
        x: 112,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_e0",
        label: "e",
        weight: 2,
      },
      position: {
        x: 187,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_f0",
        label: "f",
        weight: 2,
      },
      position: {
        x: 74,
        y: 300,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_o1",
        label: "o",
        weight: 2,
      },
      position: {
        x: 149,
        y: 300,
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0a0",
        source: "node_S0",
        target: "node_a0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0A0",
        source: "node_S0",
        target: "node_A0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0b0",
        source: "node_S0",
        target: "node_b0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0B0",
        source: "node_S0",
        target: "node_B0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_A0c0",
        source: "node_A0",
        target: "node_c0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_A0O0",
        source: "node_A0",
        target: "node_O0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_A0d0",
        source: "node_A0",
        target: "node_d0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_O0o0",
        source: "node_O0",
        target: "node_o0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_B0c1",
        source: "node_B0",
        target: "node_c1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_B0L0",
        source: "node_B0",
        target: "node_L0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_B0e0",
        source: "node_B0",
        target: "node_e0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_L0f0",
        source: "node_L0",
        target: "node_f0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_L0o1",
        source: "node_L0",
        target: "node_o1",
      },
    },
  ],
  [
    {
      group: "nodes",
      data: {
        id: "node_S0",
        label: "S",
        weight: 0,
      },
      position: {
        x: -375,
        y: 0,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_T0",
        label: "T",
        weight: 0,
      },
      position: {
        x: -413,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_E0",
        label: "E",
        weight: 0,
      },
      position: {
        x: -338,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_F0",
        label: "F",
        weight: 0,
      },
      position: {
        x: -376,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_V0",
        label: "V",
        weight: 0,
      },
      position: {
        x: -301,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_id0",
        label: "id",
        weight: 2,
      },
      position: {
        x: -226,
        y: 300,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_ε0",
        label: "ε",
        weight: 2,
      },
      position: {
        x: -151,
        y: 300,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_+0",
        label: "+",
        weight: 2,
      },
      position: {
        x: -113,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_T1",
        label: "T",
        weight: 0,
      },
      position: {
        x: -38,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_E1",
        label: "E",
        weight: 0,
      },
      position: {
        x: 37,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_F1",
        label: "F",
        weight: 0,
      },
      position: {
        x: -76,
        y: 300,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_V1",
        label: "V",
        weight: 0,
      },
      position: {
        x: -1,
        y: 300,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_(0",
        label: "(",
        weight: 2,
      },
      position: {
        x: -151,
        y: 400,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_S1",
        label: "S",
        weight: 0,
      },
      position: {
        x: -76,
        y: 400,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_)0",
        label: ")",
        weight: 2,
      },
      position: {
        x: -1,
        y: 400,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_T2",
        label: "T",
        weight: 0,
      },
      position: {
        x: -114,
        y: 500,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_E2",
        label: "E",
        weight: 0,
      },
      position: {
        x: -39,
        y: 500,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_F2",
        label: "F",
        weight: 0,
      },
      position: {
        x: -152,
        y: 600,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_V2",
        label: "V",
        weight: 0,
      },
      position: {
        x: -77,
        y: 600,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_id1",
        label: "id",
        weight: 2,
      },
      position: {
        x: -152,
        y: 700,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_*0",
        label: "*",
        weight: 2,
      },
      position: {
        x: -77,
        y: 700,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_F3",
        label: "F",
        weight: 0,
      },
      position: {
        x: -2,
        y: 700,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_V3",
        label: "V",
        weight: 0,
      },
      position: {
        x: 73,
        y: 700,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_id2",
        label: "id",
        weight: 2,
      },
      position: {
        x: -2,
        y: 800,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_ε1",
        label: "ε",
        weight: 2,
      },
      position: {
        x: 73,
        y: 800,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_ε2",
        label: "ε",
        weight: 2,
      },
      position: {
        x: 36,
        y: 600,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_ε3",
        label: "ε",
        weight: 2,
      },
      position: {
        x: 74,
        y: 400,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_ε4",
        label: "ε",
        weight: 2,
      },
      position: {
        x: 112,
        y: 300,
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0T0",
        source: "node_S0",
        target: "node_T0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0E0",
        source: "node_S0",
        target: "node_E0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_T0F0",
        source: "node_T0",
        target: "node_F0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_T0V0",
        source: "node_T0",
        target: "node_V0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_F0id0",
        source: "node_F0",
        target: "node_id0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_V0ε0",
        source: "node_V0",
        target: "node_ε0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_E0+0",
        source: "node_E0",
        target: "node_+0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_E0T1",
        source: "node_E0",
        target: "node_T1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_E0E1",
        source: "node_E0",
        target: "node_E1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_T1F1",
        source: "node_T1",
        target: "node_F1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_T1V1",
        source: "node_T1",
        target: "node_V1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_F1(0",
        source: "node_F1",
        target: "node_(0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_F1S1",
        source: "node_F1",
        target: "node_S1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_F1)0",
        source: "node_F1",
        target: "node_)0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S1T2",
        source: "node_S1",
        target: "node_T2",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S1E2",
        source: "node_S1",
        target: "node_E2",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_T2F2",
        source: "node_T2",
        target: "node_F2",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_T2V2",
        source: "node_T2",
        target: "node_V2",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_F2id1",
        source: "node_F2",
        target: "node_id1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_V2*0",
        source: "node_V2",
        target: "node_*0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_V2F3",
        source: "node_V2",
        target: "node_F3",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_V2V3",
        source: "node_V2",
        target: "node_V3",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_F3id2",
        source: "node_F3",
        target: "node_id2",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_V3ε1",
        source: "node_V3",
        target: "node_ε1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_E2ε2",
        source: "node_E2",
        target: "node_ε2",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_V1ε3",
        source: "node_V1",
        target: "node_ε3",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_E1ε4",
        source: "node_E1",
        target: "node_ε4",
      },
    },
  ],
  [
    {
      group: "nodes",
      data: {
        id: "node_S0",
        label: "S",
        weight: 0,
      },
      position: {
        x: 0,
        y: 0,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_o0",
        label: "o",
        weight: 2,
      },
      position: {
        x: -113,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_A0",
        label: "A",
        weight: 0,
      },
      position: {
        x: -38,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_B0",
        label: "B",
        weight: 0,
      },
      position: {
        x: 37,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_l0",
        label: "l",
        weight: 2,
      },
      position: {
        x: 112,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_f0",
        label: "f",
        weight: 2,
      },
      position: {
        x: -75,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_A1",
        label: "A",
        weight: 0,
      },
      position: {
        x: -1,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_l1",
        label: "l",
        weight: 2,
      },
      position: {
        x: 74,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_f1",
        label: "f",
        weight: 2,
      },
      position: {
        x: -1,
        y: 300,
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0o0",
        source: "node_S0",
        target: "node_o0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0A0",
        source: "node_S0",
        target: "node_A0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0B0",
        source: "node_S0",
        target: "node_B0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0l0",
        source: "node_S0",
        target: "node_l0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_A0f0",
        source: "node_A0",
        target: "node_f0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_B0A1",
        source: "node_B0",
        target: "node_A1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_B0l1",
        source: "node_B0",
        target: "node_l1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_A1f1",
        source: "node_A1",
        target: "node_f1",
      },
    },
  ],
  [
    {
      group: "nodes",
      data: {
        id: "node_S0",
        label: "S",
        weight: 0,
      },
      position: {
        x: -262,
        y: 0,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_l0",
        label: "l",
        weight: 2,
      },
      position: {
        x: -337,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_k0",
        label: "k",
        weight: 2,
      },
      position: {
        x: -262,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_S1",
        label: "S",
        weight: 0,
      },
      position: {
        x: -187,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_A0",
        label: "A",
        weight: 0,
      },
      position: {
        x: -262,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_B0",
        label: "B",
        weight: 0,
      },
      position: {
        x: -187,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_S2",
        label: "S",
        weight: 0,
      },
      position: {
        x: -112,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_oo0",
        label: "oo",
        weight: 2,
      },
      position: {
        x: -225,
        y: 300,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_l1",
        label: "l",
        weight: 2,
      },
      position: {
        x: -150,
        y: 300,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_f0",
        label: "f",
        weight: 2,
      },
      position: {
        x: -75,
        y: 300,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_K0",
        label: "K",
        weight: 0,
      },
      position: {
        x: 0,
        y: 300,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_p0",
        label: "p",
        weight: 2,
      },
      position: {
        x: 75,
        y: 300,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_ε0",
        label: "ε",
        weight: 2,
      },
      position: {
        x: 0,
        y: 400,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_ε1",
        label: "ε",
        weight: 2,
      },
      position: {
        x: 150,
        y: 300,
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0l0",
        source: "node_S0",
        target: "node_l0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0k0",
        source: "node_S0",
        target: "node_k0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0S1",
        source: "node_S0",
        target: "node_S1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S1A0",
        source: "node_S1",
        target: "node_A0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S1B0",
        source: "node_S1",
        target: "node_B0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S1S2",
        source: "node_S1",
        target: "node_S2",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_A0oo0",
        source: "node_A0",
        target: "node_oo0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_A0l1",
        source: "node_A0",
        target: "node_l1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_B0f0",
        source: "node_B0",
        target: "node_f0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_B0K0",
        source: "node_B0",
        target: "node_K0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_B0p0",
        source: "node_B0",
        target: "node_p0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_K0ε0",
        source: "node_K0",
        target: "node_ε0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S2ε1",
        source: "node_S2",
        target: "node_ε1",
      },
    },
  ],
  [
    {
      group: "nodes",
      data: {
        id: "node_S0",
        label: "S",
        weight: 0,
      },
      position: {
        x: 0,
        y: 0,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_A0",
        label: "A",
        weight: 0,
      },
      position: {
        x: -113,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_B0",
        label: "B",
        weight: 0,
      },
      position: {
        x: -38,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_C0",
        label: "C",
        weight: 0,
      },
      position: {
        x: 37,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_D0",
        label: "D",
        weight: 0,
      },
      position: {
        x: 112,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_a0",
        label: "a",
        weight: 2,
      },
      position: {
        x: -113,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_ε0",
        label: "ε",
        weight: 2,
      },
      position: {
        x: -38,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_ε1",
        label: "ε",
        weight: 2,
      },
      position: {
        x: 37,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_d0",
        label: "d",
        weight: 2,
      },
      position: {
        x: 112,
        y: 200,
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0A0",
        source: "node_S0",
        target: "node_A0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0B0",
        source: "node_S0",
        target: "node_B0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0C0",
        source: "node_S0",
        target: "node_C0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0D0",
        source: "node_S0",
        target: "node_D0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_A0a0",
        source: "node_A0",
        target: "node_a0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_B0ε0",
        source: "node_B0",
        target: "node_ε0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_C0ε1",
        source: "node_C0",
        target: "node_ε1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_D0d0",
        source: "node_D0",
        target: "node_d0",
      },
    },
  ],
  [
    {
      group: "nodes",
      data: {
        id: "node_S0",
        label: "S",
        weight: 0,
      },
      position: {
        x: 0,
        y: 0,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_fo0",
        label: "fo",
        weight: 2,
      },
      position: {
        x: -150,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_A0",
        label: "A",
        weight: 0,
      },
      position: {
        x: -75,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_B0",
        label: "B",
        weight: 0,
      },
      position: {
        x: 0,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_C0",
        label: "C",
        weight: 0,
      },
      position: {
        x: 75,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_fo1",
        label: "fo",
        weight: 2,
      },
      position: {
        x: 150,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_of0",
        label: "of",
        weight: 2,
      },
      position: {
        x: -113,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_A1",
        label: "A",
        weight: 0,
      },
      position: {
        x: -38,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_p0",
        label: "p",
        weight: 2,
      },
      position: {
        x: -38,
        y: 300,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_ε0",
        label: "ε",
        weight: 2,
      },
      position: {
        x: 0,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_l0",
        label: "l",
        weight: 2,
      },
      position: {
        x: 75,
        y: 200,
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0fo0",
        source: "node_S0",
        target: "node_fo0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0A0",
        source: "node_S0",
        target: "node_A0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0B0",
        source: "node_S0",
        target: "node_B0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0C0",
        source: "node_S0",
        target: "node_C0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0fo1",
        source: "node_S0",
        target: "node_fo1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_A0of0",
        source: "node_A0",
        target: "node_of0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_A0A1",
        source: "node_A0",
        target: "node_A1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_A1p0",
        source: "node_A1",
        target: "node_p0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_B0ε0",
        source: "node_B0",
        target: "node_ε0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_C0l0",
        source: "node_C0",
        target: "node_l0",
      },
    },
  ],
  [
    {
      group: "nodes",
      data: {
        id: "node_S0",
        label: "S",
        weight: 0,
      },
      position: {
        x: 0,
        y: 0,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_α0",
        label: "α",
        weight: 0,
      },
      position: {
        x: -38,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_b0",
        label: "b",
        weight: 2,
      },
      position: {
        x: 37,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_f0",
        label: "f",
        weight: 2,
      },
      position: {
        x: -113,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_o0",
        label: "o",
        weight: 2,
      },
      position: {
        x: -38,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_α1",
        label: "α",
        weight: 0,
      },
      position: {
        x: 37,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_f1",
        label: "f",
        weight: 2,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_o1",
        label: "o",
        weight: 2,
      },
      position: {
        x: 37,
        y: 300,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_α2",
        label: "α",
        weight: 0,
      },
      position: {
        x: 112,
        y: 300,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_β0",
        label: "β",
        weight: 0,
      },
      position: {
        x: 112,
        y: 400,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_p0",
        label: "p",
        weight: 2,
      },
      position: {
        x: 74,
        y: 500,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_l0",
        label: "l",
        weight: 2,
      },
      position: {
        x: 149,
        y: 500,
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0α0",
        source: "node_S0",
        target: "node_α0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0b0",
        source: "node_S0",
        target: "node_b0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_α0f0",
        source: "node_α0",
        target: "node_f0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_α0o0",
        source: "node_α0",
        target: "node_o0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_α0α1",
        source: "node_α0",
        target: "node_α1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_α1f1",
        source: "node_α1",
        target: "node_f1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_α1o1",
        source: "node_α1",
        target: "node_o1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_α1α2",
        source: "node_α1",
        target: "node_α2",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_α2β0",
        source: "node_α2",
        target: "node_β0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_β0p0",
        source: "node_β0",
        target: "node_p0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_β0l0",
        source: "node_β0",
        target: "node_l0",
      },
    },
  ],
  [
    {
      group: "nodes",
      data: {
        id: "node_S0",
        label: "S",
        weight: 0,
      },
      position: {
        x: 0,
        y: 0,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_ζ0",
        label: "ζ",
        weight: 0,
      },
      position: {
        x: -75,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_o0",
        label: "o",
        weight: 2,
      },
      position: {
        x: 0,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_S1",
        label: "S",
        weight: 0,
      },
      position: {
        x: 75,
        y: 100,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_^0",
        label: "^",
        weight: 2,
      },
      position: {
        x: -113,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_bc0",
        label: "bc",
        weight: 2,
      },
      position: {
        x: -38,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_ψ0",
        label: "ψ",
        weight: 0,
      },
      position: {
        x: 0,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_π0",
        label: "π",
        weight: 0,
      },
      position: {
        x: 75,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_+0",
        label: "+",
        weight: 2,
      },
      position: {
        x: 150,
        y: 200,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_-0",
        label: "-",
        weight: 2,
      },
      position: {
        x: 0,
        y: 300,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_(0",
        label: "(",
        weight: 2,
      },
      position: {
        x: 37,
        y: 300,
      },
    },
    {
      group: "nodes",
      data: {
        id: "node_)0",
        label: ")",
        weight: 2,
      },
      position: {
        x: 112,
        y: 300,
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0ζ0",
        source: "node_S0",
        target: "node_ζ0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0o0",
        source: "node_S0",
        target: "node_o0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S0S1",
        source: "node_S0",
        target: "node_S1",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_ζ0^0",
        source: "node_ζ0",
        target: "node_^0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_ζ0bc0",
        source: "node_ζ0",
        target: "node_bc0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S1ψ0",
        source: "node_S1",
        target: "node_ψ0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S1π0",
        source: "node_S1",
        target: "node_π0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_S1+0",
        source: "node_S1",
        target: "node_+0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_ψ0-0",
        source: "node_ψ0",
        target: "node_-0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_π0(0",
        source: "node_π0",
        target: "node_(0",
      },
    },
    {
      group: "edges",
      data: {
        id: "edge_π0)0",
        source: "node_π0",
        target: "node_)0",
      },
    },
  ],
];
var currentExampleTree;

// Generate the example grammar
function getExampleTree() {
  let number;
  do {
    number = generateRandomNumber(0, 5);
  } while (number == currentExampleTree);
  currentExampleTree = number;
  return treeExamples[number];
}

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
