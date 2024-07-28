// // This file is for ace editors, which are used for showing results of analysis

// // Editor for grammar rules
// let grammar_editor = ace.edit("grammar_editor_id");
// let grammar_editor_lib = {
//   init() {
//     // Ace Configuration
//     grammar_editor.commands.removeCommand("find");

//     // Theme
//     grammar_editor.setTheme("ace/theme/textmate");

//     // Set language
//     grammar_editor.session.setMode("ace/mode/ctxfreegrammar");

//     // Set Options
//     grammar_editor.setOptions({
//       fontSize: "12pt",
//       selectionStyle: "text",
//       highlightActiveLine: false,
//       enableMultiselect: false,
//       enableBasicAutocompletion: false,
//       enableSnippets: false,
//       enableLiveAutocompletion: false,
//       enableFindWidget: false, // Disables the built-in Find functionality
//     });
//   },
// };
// grammar_editor_lib.init();

// // Editor for alphabet
// let alphabet_editor = ace.edit("alphabet_editor_id");
// let alphabet_editor_lib = {
//   init() {
//     // Ace Configuration

//     // Theme
//     alphabet_editor.setTheme("ace/theme/textmate");

//     // Set language
//     alphabet_editor.session.setMode("ace/mode/analysis_result");

//     // Set Options
//     alphabet_editor.setOptions({
//       fontSize: "12pt",
//       selectionStyle: "text",
//       readOnly: true,
//       highlightActiveLine: false,
//       showLineNumbers: false,
//       highlightGutterLine: false,
//     });
//   },
// };
// alphabet_editor_lib.init();

// // Editor for first set
// let first_editor = ace.edit("first_editor_id");
// let first_editor_lib = {
//   init() {
//     // Ace Configuration

//     // Theme
//     first_editor.setTheme("ace/theme/textmate");

//     // Set language
//     first_editor.session.setMode("ace/mode/analysis_result");

//     // Set Options
//     first_editor.setOptions({
//       fontSize: "12pt",
//       selectionStyle: "text",
//       readOnly: true,
//       highlightActiveLine: false,
//       showLineNumbers: false,
//       highlightGutterLine: false,
//     });
//   },
// };
// first_editor_lib.init();

// // Editor for follow set
// let follow_editor = ace.edit("follow_editor_id");
// let follow_editor_lib = {
//   init() {
//     // Ace Configuration

//     // Theme
//     follow_editor.setTheme("ace/theme/textmate");

//     // Set language
//     follow_editor.session.setMode("ace/mode/analysis_result");

//     // Set Options
//     follow_editor.setOptions({
//       fontSize: "12pt",
//       selectionStyle: "text",
//       readOnly: true,
//       highlightActiveLine: false,
//       showLineNumbers: false,
//       highlightGutterLine: false,
//     });
//   },
// };
// follow_editor_lib.init();

// // Editor for predict set
// let predict_editor = ace.edit("predict_editor_id");
// let predict_editor_lib = {
//   init() {
//     // Ace Configuration

//     // Theme
//     predict_editor.setTheme("ace/theme/textmate");

//     // Set language
//     predict_editor.session.setMode("ace/mode/analysis_result");

//     // Set Options
//     predict_editor.setOptions({
//       fontSize: "12pt",
//       selectionStyle: "text",
//       readOnly: true,
//       highlightActiveLine: false,
//       showLineNumbers: false,
//       highlightGutterLine: false,
//     });
//   },
// };
// predict_editor_lib.init();

// grammar_editor.setValue(sessionStorage.getItem("editorContent"));
// grammar_editor.clearSelection();

// axios
//   .get("/alphabet")
//   .then((response) => {
//     alphabet_editor.setValue(response.data);
//     alphabet_editor.clearSelection();
//   })
//   .catch((error) => {
//     console.error("Error fetching string:", error);
//   });

// axios
//   .get("/first_set")
//   .then((response) => {
//     first_editor.setValue(response.data);
//     first_editor.clearSelection();
//   })
//   .catch((error) => {
//     console.error("Error fetching string:", error);
//   });

// axios
//   .get("/follow_set")
//   .then((response) => {
//     follow_editor.setValue(response.data);
//     follow_editor.clearSelection();
//   })
//   .catch((error) => {
//     console.error("Error fetching string:", error);
//   });

// axios
//   .get("/predict_set")
//   .then((response) => {
//     predict_editor.setValue(response.data);
//     predict_editor.clearSelection();
//   })
//   .catch((error) => {
//     console.error("Error fetching string:", error);
//   });
