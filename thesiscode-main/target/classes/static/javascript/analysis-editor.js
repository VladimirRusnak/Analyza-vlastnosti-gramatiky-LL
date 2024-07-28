// This file is for ace editors, which are used for showing results of analysis

let is_transformed;

if (localStorage.getItem("isTransformed") === null) {
  is_transformed = "false";
} else {
  is_transformed = localStorage.getItem("isTransformed");
}

document.body.classList.add("unlocked-links");

document
  .getElementById("open-alphabet-legend")
  .addEventListener("click", () => {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("alphabet-legend").style.display = "block";
  });

document
  .getElementById("cancel-alphabet-legend")
  .addEventListener("click", () => {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("alphabet-legend").style.display = "none";
  });

document.getElementById("open-table-legend").addEventListener("click", () => {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("table-legend").style.display = "block";
});

document.getElementById("cancel-table-legend").addEventListener("click", () => {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("table-legend").style.display = "none";
});

document.getElementById("open-first-legend").addEventListener("click", () => {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("first-legend").style.display = "block";
});

document.getElementById("cancel-first-legend").addEventListener("click", () => {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("first-legend").style.display = "none";
});

document.getElementById("open-follow-legend").addEventListener("click", () => {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("follow-legend").style.display = "block";
});

document
  .getElementById("cancel-follow-legend")
  .addEventListener("click", () => {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("follow-legend").style.display = "none";
  });

document.getElementById("open-predict-legend").addEventListener("click", () => {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("predict-legend").style.display = "block";
});

document
  .getElementById("cancel-predict-legend")
  .addEventListener("click", () => {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("predict-legend").style.display = "none";
  });

// Editor for grammar rules
let grammar_editor = ace.edit("grammar-editor--id");
let grammar_editor_lib = {
  init() {
    // Ace Configuration

    // Theme
    grammar_editor.setTheme("ace/theme/textmate");

    // Set language
    grammar_editor.session.setMode("ace/mode/ctxfreegrammar_output");

    // Set Options
    grammar_editor.setOptions({
      fontSize: "12pt",
      selectionStyle: "text",
      readOnly: true,
      highlightActiveLine: false,
      showLineNumbers: true,
      highlightGutterLine: false,
      wrap: true,
    });

    grammar_editor.commands.removeCommand("find");
  },
};
grammar_editor_lib.init();
grammar_editor.setValue(
  addSpaceBetweenSymbols(sessionStorage.getItem("editorContent"))
);
grammar_editor.clearSelection();

// Editor for alphabet
let alphabet_editor = ace.edit("alphabet-editor--id");
let alphabet_editor_lib = {
  init() {
    // Ace Configuration

    // Theme
    alphabet_editor.setTheme("ace/theme/textmate");

    // Set language
    alphabet_editor.session.setMode("ace/mode/analysis_result");

    // Set Options
    alphabet_editor.setOptions({
      fontSize: "12pt",
      selectionStyle: "text",
      readOnly: true,
      highlightActiveLine: false,
      showLineNumbers: false,
      highlightGutterLine: false,
      wrap: true,
      indentedSoftWrap: false,
      enableSnippets: false,
    });

    alphabet_editor.commands.removeCommand("find");
  },
};
alphabet_editor_lib.init();

// Editor for first set
let first_editor = ace.edit("first-editor--id");
let first_editor_lib = {
  init() {
    // Ace Configuration

    // Theme
    first_editor.setTheme("ace/theme/textmate");

    // Set language
    first_editor.session.setMode("ace/mode/analysis_result");

    // Set Options
    first_editor.setOptions({
      fontSize: "12pt",
      selectionStyle: "text",
      readOnly: true,
      highlightActiveLine: false,
      showLineNumbers: false,
      highlightGutterLine: false,
      wrap: true,
    });

    first_editor.commands.removeCommand("find");
  },
};
first_editor_lib.init();

// Editor for follow set
let follow_editor = ace.edit("follow-editor--id");
let follow_editor_lib = {
  init() {
    // Ace Configuration

    // Theme
    follow_editor.setTheme("ace/theme/textmate");

    // Set language
    follow_editor.session.setMode("ace/mode/analysis_result");

    // Set Options
    follow_editor.setOptions({
      fontSize: "12pt",
      selectionStyle: "text",
      readOnly: true,
      highlightActiveLine: false,
      showLineNumbers: false,
      highlightGutterLine: false,
      wrap: true,
    });

    follow_editor.commands.removeCommand("find");
  },
};
follow_editor_lib.init();

// Editor for predict set
let predict_editor = ace.edit("predict-editor--id");
let predict_editor_lib = {
  init() {
    // Ace Configuration

    // Theme
    predict_editor.setTheme("ace/theme/textmate");

    // Set language
    predict_editor.session.setMode("ace/mode/analysis_result");

    // Set Options
    predict_editor.setOptions({
      fontSize: "12pt",
      selectionStyle: "text",
      readOnly: true,
      highlightActiveLine: false,
      showLineNumbers: false,
      highlightGutterLine: false,
      wrap: true,
    });

    predict_editor.commands.removeCommand("find");
  },
};
predict_editor_lib.init();

fetch("/alphabet", {
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
  .then((data) => {
    console.log("Response from server:", data);
    alphabet_editor.setValue(data);
    alphabet_editor.clearSelection();
  })
  .catch((error) => {
    console.error("Error fetching string:", error);
  });

fetch("/first_set", {
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
  .then((data) => {
    first_editor.setValue(data.substring(0, data.length - 1));
    first_editor.clearSelection();
  })
  .catch((error) => {
    console.error("Error fetching string:", error);
  });

fetch("/follow_set", {
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
  .then((data) => {
    follow_editor.setValue(data.substring(0, data.length - 1));
    follow_editor.clearSelection();
  })
  .catch((error) => {
    console.error("Error fetching string:", error);
  });

fetch("/predict_set", {
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
  .then((data) => {
    predict_editor.setValue(data.substring(0, data.length - 1));
    predict_editor.clearSelection();
  })
  .catch((error) => {
    console.error("Error fetching string:", error);
  });

grammar_editor.setHighlightGutterLine(false);
var gutterEl = grammar_editor.renderer.$gutter;
if (gutterEl) {
  // Change the background color of the gutter when clicked
  gutterEl.style.backgroundColor = "#00000003"; // Change this to your desired color
}

grammar_editor.on("click", function () {
  grammar_editor.setHighlightActiveLine(true);
  grammar_editor.setHighlightGutterLine(true);
  var gutterEl = grammar_editor.renderer.$gutter;
  if (gutterEl) {
    gutterEl.classList.add("transition-gutter");

    // Change the background color of the gutter when clicked
    gutterEl.style.backgroundColor = "#00000008"; // Change this to your desired color
  }
});

grammar_editor.on("blur", function () {
  grammar_editor.setHighlightActiveLine(false);

  grammar_editor.setHighlightGutterLine(false);
  var gutterEl = grammar_editor.renderer.$gutter;
  if (gutterEl) {
    // Change the background color of the gutter when clicked
    gutterEl.style.backgroundColor = "#00000003"; // Change this to your desired color
  }
});

function manage_editor(editor) {
  editor.setHighlightGutterLine(false);
  var gutterEl = editor.renderer.$gutter;
  if (gutterEl) {
    // Change the background color of the gutter when clicked
    gutterEl.style.backgroundColor = "#00000003"; // Change this to your desired color
  }

  editor.on("click", function () {
    editor.setHighlightActiveLine(true);
    editor.setHighlightGutterLine(true);
    var gutterEl = editor.renderer.$gutter;
    if (gutterEl) {
      gutterEl.classList.add("transition-gutter");

      // Change the background color of the gutter when clicked
      gutterEl.style.backgroundColor = "#00000008"; // Change this to your desired color
    }
  });

  editor.on("blur", function () {
    editor.setHighlightActiveLine(false);
    editor.setHighlightGutterLine(false);
    var gutterEl = editor.renderer.$gutter;
    if (gutterEl) {
      // Change the background color of the gutter when clicked
      gutterEl.style.backgroundColor = "#00000003"; // Change this to your desired color
    }
  });
}

manage_editor(alphabet_editor);
manage_editor(first_editor);
manage_editor(follow_editor);
manage_editor(predict_editor);

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
    if (!response) {
      document.getElementsByClassName("text-wrapper")[0].innerHTML = `
            <div class="is-grammar-ll">
              <div>Vaša gramatika <strong>je gramatikou LL(1)</strong></div>
              <img src="images/check.svg" alt="" class="green-image">
            </div>
            <p>V rozkladovej tabuľke neboli nájdené žiadne konflikty.</p>
            `;
    } else {
      document.getElementsByClassName("text-wrapper")[0].innerHTML = `
            <div class="is-grammar-ll">
              <div>Vaša gramatika <strong>nie je gramatikou LL(1)</strong></div>
              <img src="images/x.svg" alt="">
            </div>
            <p>V rozkladovej tabuľke boli nájdené konflikty.</p>
            `;
    }
  })
  .catch((error) => {
    console.error("Error fetching string:", error);
  });

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

fetch("/get_table", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: sessionStorage.getItem("sessionId"),
})
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("table").innerHTML = data;
  })
  .catch((error) => console.error("Error:", error));
