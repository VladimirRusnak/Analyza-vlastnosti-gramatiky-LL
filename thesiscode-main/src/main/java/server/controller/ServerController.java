package server.controller;

import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.context.WebApplicationContext;
import processgrammar.GrammarProcessor;
import processgrammar.parser.RuleObject;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Objects;

@Controller
@RequestMapping
@Scope(WebApplicationContext.SCOPE_SESSION)
public class ServerController {
    private GrammarProcessor grammarProcessor = new GrammarProcessor();
    private String consoleMessage;
    private boolean foundConflict;

    public void processGrammar(String grammar)
    {
        try {
            grammarProcessor.process(grammar);
            consoleMessage = "Grammar was processed successfully.";
        } catch(Exception exception) {
            consoleMessage = "(e)" + exception.getMessage();
            throw exception;
        }
    }

    public ResponseEntity<String> getError() {
        return ResponseEntity.ok(consoleMessage);
    }

    public ResponseEntity<String> getFirstSet() {
        return ResponseEntity.ok(grammarProcessor.firstSets);
    }

    public ResponseEntity<String> getFollowSet() {
        return ResponseEntity.ok(grammarProcessor.followSets);
    }

    public ResponseEntity<String> getPredictSet() {
        return ResponseEntity.ok(grammarProcessor.predictSets);
    }

    public ResponseEntity<String> getAlphabet() {
        return ResponseEntity.ok(grammarProcessor.alphabet);
    }

    public ResponseEntity<String> getTable() {
        StringBuilder sb = new StringBuilder();
        List<String> terminals = grammarProcessor.terminals;
        List<String> nonTerminals = grammarProcessor.nonTerminals;
        List<RuleObject> ruleList = grammarProcessor.ruleList;
        LinkedHashMap<String, List<String>> predictSetsMap = grammarProcessor.predictSetsMap;

        if (containsDollarSign(predictSetsMap) && !terminals.contains("$"))
            terminals.add("$");

        sb.append("<table class=\"table\">\n");

        sb.append("<tr><th></th>\n");
        for(String terminal : terminals) {
            sb.append("<th class=\"table-terminals\">").append(terminal).append("</th>\n");
        }
        sb.append("</tr>\n");

        boolean ruleFound = false, isConflict;
        foundConflict = false;

        for (String nonTerminal : nonTerminals) {
            sb.append("<tr>\n");
            sb.append("<td class=\"table-non-terminals\">").append(nonTerminal).append("</td>");
            for (String terminal : terminals) {
                sb.append("<td class=\"not-conflict\">");
                isConflict = false;
                for (String whichRule : predictSetsMap.keySet()) {
                    if (Objects.equals(ruleList.get(Integer.parseInt(whichRule) - 1).leftSide(), nonTerminal) &&
                            predictSetsMap.get(whichRule).contains(terminal)) {
                        if (ruleFound && !isConflict) {
                            sb.delete(sb.length() - whichRule.length() - 16, sb.length() - whichRule.length() - 12);
                            isConflict = foundConflict = true;
                        }
                        ruleFound = true;
                        sb.append(whichRule).append(", ");
                    }
                }
                if (ruleFound) {
                    sb.delete(sb.length() - 2, sb.length());
                    ruleFound = false;
                }
                sb.append("</td>");
            }
            sb.append("</tr>\n");
        }

        sb.append("</table>\n");
        return new ResponseEntity<>(sb.toString(), HttpStatus.OK);
    }

    public ResponseEntity<Boolean> isFoundConflict() {
        return ResponseEntity.ok(foundConflict);
    }

    public ResponseEntity<String> getParseTree(String word) throws Exception {
        if (word == null) {
            grammarProcessor.treeConstruct.constructTree("");
        } else {
            grammarProcessor.treeConstruct.constructTree(word);
        }
        return new ResponseEntity<>(grammarProcessor.treeConstruct.getString(), HttpStatus.OK);
    }

    public ResponseEntity<Boolean> getParseTreeMessage() throws Exception {
        return new ResponseEntity<>(grammarProcessor.treeConstruct.isValid(), HttpStatus.OK);
    }

    private static boolean containsDollarSign(LinkedHashMap<String, List<String>> predictSetsMap) {
        for (HashMap.Entry<String, List<String>> entry : predictSetsMap.entrySet()) {
            List<String> values = entry.getValue();
            if (values.contains("$"))
                return true;
        }
        return false;
    }
}
