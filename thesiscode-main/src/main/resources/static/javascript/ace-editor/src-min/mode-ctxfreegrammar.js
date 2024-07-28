define("ace/mode/ctxfreegrammar", function (require, exports, module) {
  var oop = require("ace/lib/oop");
  var TextMode = require("ace/mode/text").Mode;
  var ExampleHighlightRules =
    require("ace/mode/ctxfreegrammar_highlight_rules").ExampleHighlightRules;

  var Mode = function () {
    this.HighlightRules = ExampleHighlightRules;
  };
  oop.inherits(Mode, TextMode);

  (function () {
    // Extra logic goes here. (see below)
  }).call(Mode.prototype);

  exports.Mode = Mode;
});

define("ace/mode/ctxfreegrammar_highlight_rules", [
  "require",
  "exports",
  "ace/lib/oop",
  "ace/mode/text_highlight_rules",
], (acequire, exports) => {
  const oop = acequire("ace/lib/oop");
  const JavaScriptHighlightRules = acequire(
    "./javascript_highlight_rules"
  ).JavaScriptHighlightRules;

  const ExampleHighlightRules = function () {
    this.$rules = {
      start: [
        {
          token: "keyword",
          regex: "→",
        },
        {
          token: "grammar_text_bold",
          regex: "'([^']*)'",
        },
        {
          token: "grammar_text_bold",
          regex: '"([^"]*)"',
        },
      ],
    };
  };

  oop.inherits(ExampleHighlightRules, JavaScriptHighlightRules);

  exports.ExampleHighlightRules = ExampleHighlightRules;
});
