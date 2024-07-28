document.body.classList.add("unlocked-links");

document.getElementById("open-tree-legend").addEventListener("click", () => {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("tree-legend").style.display = "block";
});

document.getElementById("cancel-tree-legend").addEventListener("click", () => {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("tree-legend").style.display = "none";
});

let grammar_tree_editor = ace.edit("grammar-tree-editor--id");
let grammar_tree_editor_lib = {
  init() {
    // Ace Configuration
    // Theme
    grammar_tree_editor.setTheme("ace/theme/textmate");
    // Set language
    grammar_tree_editor.session.setMode("ace/mode/ctxfreegrammar_output");
    // Set Options
    grammar_tree_editor.setOptions({
      fontSize: "12pt",
      selectionStyle: "text",
      readOnly: true,
      highlightActiveLine: false,
      enableMultiselect: false,
      wrap: true,
    });
  },
};
grammar_tree_editor_lib.init();
grammar_tree_editor.setValue(
  addSpaceBetweenSymbols(sessionStorage.getItem("editorContent"))
);
grammar_tree_editor.clearSelection();

function manage_editor(editor) {
  editor.setHighlightGutterLine(false);
  var gutterEl = editor.renderer.$gutter;
  if (gutterEl) {
    gutterEl.style.backgroundColor = "#00000003";
  }

  editor.on("click", function () {
    editor.setHighlightActiveLine(true);
    editor.setHighlightGutterLine(true);
    var gutterEl = editor.renderer.$gutter;
    if (gutterEl) {
      gutterEl.classList.add("transition-gutter");
      gutterEl.style.backgroundColor = "#00000008";
    }
  });

  editor.on("blur", function () {
    editor.setHighlightActiveLine(false);

    editor.setHighlightGutterLine(false);
    var gutterEl = editor.renderer.$gutter;
    if (gutterEl) {
      gutterEl.style.backgroundColor = "#00000003";
    }
  });
}

manage_editor(grammar_tree_editor);

var cy;
function constructTree(el) {
  cy = cytoscape({
    container: document.getElementById("tree"),
    elements: el,
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
        selector: "[weight = 1]",
        style: {
          "border-color": "#821507",
          color: "#D9402B",
        },
      },
      {
        selector: "[weight = 2]",
        style: {
          "border-color": "#009B48",
          "border-opacity": 0.7,
          "font-weight": "bolder",
          color: "#009B48",
        },
      },
      {
        selector: "[weight = 3]",
        style: {
          "border-color": "#821507",
          "border-opacity": 0.7,
          "font-weight": "bolder",
          color: "#D9402B",
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
    wheelSensitivity: 0.2,
    layout: { name: "preset" },
    autolock: false,
  });

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
}

input_word = document.getElementById("input_word");
tree_message = document.getElementById("tree-message");

if (localStorage.getItem("found_conflict") == "true") {
  tree_message.innerHTML =
    "Strom odvodenia <strong>nie je možné skonštruovať</strong>, keďže gramatika nie je gramatikou LL(1).";
}

function parseTree() {
  if (localStorage.getItem("found_conflict") == "true") {
    return;
  }

  sessionStorage.setItem("input_word", input_word.value);
  fetch("/parse_tree", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      word: input_word.value,
      sessionId: sessionStorage.getItem("sessionId"),
    }),
  })
    .then((response) => {
      if (!response.ok) {
        cy.elements().remove();
        checkIfIsValid();
        throw new Error(`Request failed with status: ${response.status}`);
      }
      return response.text();
    })
    .then((data) => {
      constructTree(JSON.parse(data));
      checkIfIsValid();
    })
    .then(() => {
      // Get all nodes and edges
      var elements = cy.elements();

      // Initialize an array to store formatted elements
      var formattedElements = [];

      // Iterate over each element and format it
      elements.forEach(function (element) {
        if (element.isNode()) {
          formattedElements.push({
            group: "nodes",
            data: {
              id: element.id(),
              position: element.position(),
              ...element.data(), // Add additional node data
            },
          });
        } else if (element.isEdge()) {
          formattedElements.push({
            group: "edges",
            data: {
              id: element.id(),
              source: element.source().id(),
              target: element.target().id(),
              ...element.data(), // Add additional edge data
            },
          });
        }
      });
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

input_word.addEventListener("keyup", () => parseTree());

if ((input_word.value = sessionStorage.getItem("input_word"))) {
  parseTree();
}

function checkIfIsValid() {
  fetch("/parse_tree_message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: sessionStorage.getItem("sessionId"),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }
      return response.json();
    })
    .then((is_valid) => {
      printTreeMessage(is_valid);
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function printTreeMessage(is_valid) {
  if (is_valid) {
    tree_message.innerHTML =
      "Strom odvodenia <strong>bol úspešne skonštruovaný</strong>.";
  } else {
    tree_message.innerHTML =
      "<strong>Nie je možné skonštruovať</strong> strom odvodenia pre vstupné slovo.";
  }
}

function addSpaceBetweenSymbols(input_string) {
  input_string = input_string.replaceAll(" ", "");
  let result = "";
  let is_terminal = false;
  let input_string_len = input_string.length;

  for (let i = 0; i < input_string_len; i++) {
    if (isTerminalStartOrEnd(input_string[i])) {
      if (!is_terminal) {
        result += " " + input_string[i];
        is_terminal = true;
      } else {
        result += input_string[i];
        is_terminal = false;
      }
    } else if (is_terminal) {
      result += input_string[i];
    } else {
      result += " " + input_string[i];
    }
  }

  result = result.substring(1);
  result = result.replaceAll("\n ", "\n");
  return result;
}

function isTerminalStartOrEnd(char) {
  return char == "'" || char == '"';
}

parseTree();

function exportGraphAsPNG() {
  const pngBlob = cy.png({
    output: "blob",
    full: true,
  });

  if (!pngBlob) return;

  const downloadLink = document.createElement("a");
  downloadLink.href = window.URL.createObjectURL(pngBlob);
  downloadLink.download = "graph.png";
  document.body.appendChild(downloadLink);
  downloadLink.click();
}

const btn = document.querySelector("button");
btn.addEventListener("click", () => {
  exportGraphAsPNG();
});
