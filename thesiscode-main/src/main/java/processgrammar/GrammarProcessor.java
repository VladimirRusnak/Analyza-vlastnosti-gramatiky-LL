package processgrammar;

import grammarsets.SetsComputer;
import processgrammar.checker.Checker;
import processgrammar.lexer.Lexer;
import processgrammar.parser.Parser;
import processgrammar.parser.RuleObject;
import tree.TreeConstruct;

import java.io.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;

public class GrammarProcessor {
    public String firstSets;
    public String followSets;
    public String predictSets;
    public LinkedHashMap<String, List<String>> predictSetsMap;
    public List<RuleObject> ruleList;
    public List<String> terminals;
    public List<String> nonTerminals;
    public String alphabet;
    public TreeConstruct treeConstruct;

    // process user's grammar
    public void process(String grammar) {
        grammar = processInitial(grammar);

        // transform grammar in string into a list of records
        ruleList = processIntoRuleObjectList(grammar);

        // check whether the grammar is correct
        Checker.checkGrammar(ruleList);

        SetsComputer computer = new SetsComputer(ruleList);
        // computing terminal set
        computer.computeTerminalSet();

        // computing sets FIRST, FOLLOW and PREDICT
        computer.computeFirstSets();
        computer.computeFollowSets();
        computer.computePredictSets();

        StringBuilder sb = new StringBuilder();
        LinkedHashMap<String, List<String>> firstSetsMap = computer.getFirstSets();
        for (String key : firstSetsMap.keySet()) {
            sb.append(key).append(" = ").append(firstSetsMap.get(key)).append("\n");
        }
        firstSets = sb.toString();

        String[] lines = firstSets.split("\n");
        String newLine;
        int firstOccur, lastOccur;
        char[] charArray;
        sb.setLength(0);
        for (String line : lines) {
            firstOccur = line.indexOf("[");
            lastOccur = line.lastIndexOf("]");
            charArray = line.toCharArray();
            charArray[firstOccur] = '{';
            charArray[lastOccur] = '}';
            newLine = new String(charArray);
            sb.append( newLine + "\n");
        }
        firstSets = sb.toString();

        sb.setLength(0);
        LinkedHashMap<String, List<String>> followSetsMap = computer.getFollowSets();
        for (String key : followSetsMap.keySet()) {
            sb.append(key).append(" = ").append(followSetsMap.get(key)).append("\n");
        }
        followSets = sb.toString();

        lines = followSets.split("\n");
        sb.setLength(0);
        for (String line : lines) {
            firstOccur = line.indexOf("[");
            lastOccur = line.lastIndexOf("]");
            charArray = line.toCharArray();
            charArray[firstOccur] = '{';
            charArray[lastOccur] = '}';
            newLine = new String(charArray);
            sb.append( newLine + "\n");
        }
        followSets = sb.toString();

        sb.setLength(0);
        predictSetsMap = computer.getPredictSets();
        for (String key : predictSetsMap.keySet()) {
            sb.append(key).append(" = ").append(predictSetsMap.get(key)).append("\n");
        }
        predictSets = sb.toString();

        lines = predictSets.split("\n");
        sb.setLength(0);
        for (String line : lines) {
            firstOccur = line.indexOf("[");
            lastOccur = line.lastIndexOf("]");
            charArray = line.toCharArray();
            charArray[firstOccur] = '{';
            charArray[lastOccur] = '}';
            newLine = new String(charArray);
            sb.append( newLine + "\n");
        }
        predictSets = sb.toString();

        sb.setLength(0);
        terminals = computer.getTerminals();
        sb.append("Terminály:\n{").append(String.join(", ", terminals)).append("}\n\n");
        alphabet = sb.toString();

        nonTerminals = computer.getNonTerminals();
        sb.append("Neterminály:\n{").append(String.join(", ", nonTerminals)).append("}");
        alphabet = sb.toString();

        treeConstruct = new TreeConstruct(ruleList, predictSetsMap, firstSetsMap);
    }

    // process user's grammar (switch URL decoding to Unicode, delete all redundant newlines, make sure
    // there is a newline in the last rule)
    private String processInitial(String grammar) {
        grammar = grammar.replace("+", "%2B");
        grammar = URLDecoder.decode(grammar, StandardCharsets.UTF_8);
        grammar = grammar.replaceAll("(\\n)+", "\n");
        if (!grammar.endsWith("\n"))
            grammar += '\n';
        return grammar;
    }

    private List<RuleObject> processIntoRuleObjectList(String grammar) {
        Reader reader = new InputStreamReader(new ByteArrayInputStream(grammar.getBytes()));
        Lexer lexer = new Lexer(reader);
        Parser parser = new Parser(lexer);
        parser.matchInput();
        return parser.getRuleObjectList();
    }

    public String getStartingSymbol() {
        return ruleList.get(0).leftSide();
    }
}
