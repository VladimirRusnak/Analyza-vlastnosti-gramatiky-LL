// This file is for the ace editor, which is used for defining grammar rules

// Elements
const consoleEditor = document.getElementById("editor--console-output");
const execudeCodeBtnEditor = document.getElementById("editor--btn-run");
const resetCodeBtnEditor = document.getElementById("editor--btn-reset");
const exampleBtnEditor = document.getElementById("editor--btn-example");

// Default settings for the ace editor
let defaultCode = "S → ";
let consoleMessages = [];

exampleBtnEditor.addEventListener("click", () => {
  sessionStorage.setItem("editorContent_temp", getExampleGrammar());

  loadEditorContent();

  code_editor_lib.clearConsoleScreen();
  sessionStorage.setItem("isProcessed", "false");
  deactivateTabs();
});

// Initializing the ace editor
document
  .getElementById("open-input-main-legend")
  .addEventListener("click", () => {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("grammar-notation-legend").style.display = "block";
  });

document
  .getElementById("cancel-input-main-legend")
  .addEventListener("click", () => {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("grammar-notation-legend").style.display = "none";
  });
let code_editor = ace.edit("editor--ace-id");

window.onload = () => {
  loadEditorContent();
};

code_editor.getSession().on("change", function () {
  saveEditorContent();
});

let code_editor_lib = {
  init() {
    code_editor.setTheme("ace/theme/textmate");
    code_editor.session.setMode("ace/mode/ctxfreegrammar");
    code_editor.setOptions({
      fontSize: "12pt",
      selectionStyle: "text",
      wrap: true,
    });

    code_editor.commands.removeCommand("find");
  },
  clearConsoleScreen() {
    consoleMessages.length = 0;
    while (consoleEditor.firstChild) {
      consoleEditor.removeChild(consoleEditor.firstChild);
    }
  },
  printToConsole(message) {
    const newLogItem = document.createElement("li");
    const newLogText = document.createElement("pre");
    newLogText.textContent = message;
    newLogItem.appendChild(newLogText);
    consoleEditor.appendChild(newLogItem);
  },
};

// Setting the events on execute and reset buttons
execudeCodeBtnEditor.addEventListener("click", () => {
  code_editor_lib.clearConsoleScreen();
  const userCode = code_editor.getValue();

  try {
    new Function(userCode)();
  } catch (err) {}

  fetch("/process_grammar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grammar: userCode,
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

          consoleEditor.classList.remove("editor--console-output-animate-in");
          consoleEditor.innerHTML = response;
          consoleEditor.classList.add("editor--console-output-animate-in");
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

    const editorContent = code_editor.getValue();
    sessionStorage.setItem(
      "editorContent",
      editorContent.replace(/(\n+)\s*$/, "")
    );

    consoleEditor.classList.remove("editor--console-output-animate-in");
    consoleEditor.innerHTML =
      'Gramatika bola <span class="success">úspešne</span> spracovaná. Výsledky analýzy nájdete na karte <strong>Množiny analýzy</strong>.  ';
    consoleEditor.classList.add("editor--console-output-animate-in");

    sessionStorage.removeItem("input_word");
    sessionStorage.setItem("isProcessed", "true");
    activateTabs();
  });
});

resetCodeBtnEditor.addEventListener("click", () => {
  code_editor.setValue(defaultCode);
  code_editor.clearSelection();
  code_editor_lib.clearConsoleScreen();

  consoleEditor.classList.remove("editor--console-output-animate-in");
  consoleEditor.innerHTML =
    "Pravidlá gramatiky boli <strong>vymazané</strong>. Prosím, zadajte nové pravidlá gramatiky a <strong>spracujte</strong> ich.";
  consoleEditor.classList.add("editor--console-output-animate-in");

  sessionStorage.setItem("isProcessed", "false");
  deactivateTabs();
});

code_editor_lib.init();

// My defined functions for editor

// Replace the given sequence of characters into a special character
function findCharsToReplace() {
  currentPosition = code_editor.getCursorPosition();

  var userCode = code_editor.getValue();
  if (userCode.indexOf("->") != -1) {
    RemoveAndInsertText("->", "→");
  } else if (userCode.indexOf("\\eps") != -1) {
    RemoveAndInsertText("\\eps", "ε");
  } else if (userCode.indexOf("\\alpha") != -1) {
    RemoveAndInsertText("\\alpha", "α");
  } else if (userCode.indexOf("\\beta") != -1) {
    RemoveAndInsertText("\\beta", "β");
  } else if (userCode.indexOf("\\gamma") != -1) {
    RemoveAndInsertText("\\gamma", "γ");
  } else if (userCode.indexOf("\\delta") != -1) {
    RemoveAndInsertText("\\delta", "δ");
  } else if (userCode.indexOf("\\zeta") != -1) {
    RemoveAndInsertText("\\zeta", "ζ");
  } else if (userCode.indexOf("\\eta") != -1) {
    RemoveAndInsertText("\\eta", "η");
  } else if (userCode.indexOf("\\theta") != -1) {
    RemoveAndInsertText("\\theta", "θ");
  } else if (userCode.indexOf("\\iota") != -1) {
    RemoveAndInsertText("\\iota", "ι");
  } else if (userCode.indexOf("\\kappa") != -1) {
    RemoveAndInsertText("\\kappa", "κ");
  } else if (userCode.indexOf("\\lambda") != -1) {
    RemoveAndInsertText("\\lambda", "λ");
  } else if (userCode.indexOf("\\mu") != -1) {
    RemoveAndInsertText("\\mu", "μ");
  } else if (userCode.indexOf("\\nu") != -1) {
    RemoveAndInsertText("\\nu", "ν");
  } else if (userCode.indexOf("\\xi") != -1) {
    RemoveAndInsertText("\\xi", "ξ");
  } else if (userCode.indexOf("\\omicron") != -1) {
    RemoveAndInsertText("\\omicron", "ο");
  } else if (userCode.indexOf("\\pi") != -1) {
    RemoveAndInsertText("\\pi", "π");
  } else if (userCode.indexOf("\\rho") != -1) {
    RemoveAndInsertText("\\rho", "ρ");
  } else if (userCode.indexOf("\\sigma") != -1) {
    RemoveAndInsertText("\\sigma", "σ");
  } else if (userCode.indexOf("\\tau") != -1) {
    RemoveAndInsertText("\\tau", "τ");
  } else if (userCode.indexOf("\\upsilon") != -1) {
    RemoveAndInsertText("\\upsilon", "υ");
  } else if (userCode.indexOf("\\phi") != -1) {
    RemoveAndInsertText("\\phi", "φ");
  } else if (userCode.indexOf("\\chi") != -1) {
    RemoveAndInsertText("\\chi", "χ");
  } else if (userCode.indexOf("\\psi") != -1) {
    RemoveAndInsertText("\\psi", "ψ");
  } else if (userCode.indexOf("\\omega") != -1) {
    RemoveAndInsertText("\\omega", "ω");
  }
}

// Adjusting the cursor (after replacing the sequence of characters)
function RemoveAndInsertText(textToRemove, textToReplace) {
  var editor = code_editor; // Assuming code_editor is your Ace editor instance

  // Iterate over all the lines in the document
  for (var i = 0; i < editor.session.getLength(); i++) {
    var line = editor.session.getLine(i);
    var startIndex = 0;
    var foundIndex;

    // Continue searching for the textToRemove in the line until it's no longer found
    while ((foundIndex = line.indexOf(textToRemove, startIndex)) !== -1) {
      // Replace the textToRemove with textToReplace
      var range = new ace.Range(
        i,
        foundIndex,
        i,
        foundIndex + textToRemove.length
      );
      editor.session.replace(range, textToReplace);

      // Update startIndex to continue searching for textToRemove in the same line
      startIndex = foundIndex + textToReplace.length;
    }
  }
}

// Saving the contents of the ace editor
function saveEditorContent() {
  findCharsToReplace();
  const editorContent = code_editor.getValue();
  sessionStorage.setItem(
    "editorContent_temp",
    editorContent.replace(/(\n+)\s*$/, "")
  );
}

// Getting the contents of the ace editor
function loadEditorContent() {
  const storedContent = sessionStorage.getItem("editorContent_temp");
  code_editor.setValue(defaultCode);

  if (storedContent !== null) {
    code_editor.setValue(storedContent);
  }
  code_editor.clearSelection();
}

// Grammar examples
var grammarExamples = [
  `S → α β C D
α → 'oooo' | 'a' | 'ab'
α → ε
β → 'd'
C → ε 
C → 'f'
D → 'fx' | 'ffff' | 'fff'
D → ε`,
  `S → 'a' 'b' D E
E → 'a' 'b' 'c' D
D → 'e' 'f'
D → 'o'`,
  `S → 'a' 'b' 'c' A
A → B C 'd'
B → 'o' 'f' A
A → 'f'
C → 'o' 'l'`,
  `S → 'a' A 'b' B
A → 'c' O 'd'
O → 'o'
B → 'c' L 'e'
L → 'f' 'o'`,
  `S → A B C | 'i'
A → B C | 'a' 'f' 'e'
B → C | ε | 'o'
C → 'l'`,
  `S → A B 'a' D 'b' | 'a' B | D | ε
A → B 'a' | 'c' | ε
B → 'd' | ε
D → ε`,
  `S → T E
E → '+' T E | ε
T → F V
V → '*' F V | ε
F → 'id' | '(' S ')'`,
  `S → S 'o' 'l' | 'o' A
A → B 'd' 'e' | ε
B → C A S | 'f'
C → 'o' 'k' 'ls'`,
  `S → A
A → 'fl' | 'o' | ε | B
B → O S A A | ε | 'f'
O → 'o' A B`,
  `S → '[' A ']' | ε
A → '(' B ')' | ε
B → 'n' | ε`,
];
var currentExampleGrammar;

// Generate the example grammar
function getExampleGrammar() {
  let number;
  do {
    number = generateRandomNumber(0, 9);
  } while (number == currentExampleGrammar);
  currentExampleGrammar = number;
  return grammarExamples[number];
}

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
