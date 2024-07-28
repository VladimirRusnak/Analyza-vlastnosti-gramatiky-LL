package processgrammar.checker;

import processgrammar.parser.RuleObject;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Checker {
    public static void checkGrammar(List<RuleObject> ruleObjectList) {
        // get left sides of all rules
        List<String> leftRules = ruleObjectList.stream()
                .map(RuleObject::leftSide)
                .distinct()
                .toList();

        // get right sides of all rules
        List<String> rightRules = ruleObjectList.stream()
                .map(RuleObject::rightSide)
                .distinct()
                .toList();

        Pattern findGrammarSymbols = Pattern.compile("\"[^\"]*\"|'[^']*'|[^'\" ]");
        Matcher rightMatcher;
        List<String> rightNonTerminals;

        // find all non-terminals on right sides of all rules (to check whether non-terminal is defined)
        // find all terminals, whether there are no empty quotations ("" or '')
        for (String rightRule : rightRules) {
            rightMatcher = findGrammarSymbols.matcher(rightRule);
            rightNonTerminals = new ArrayList<>();
            while (rightMatcher.find()) {
                if (rightMatcher.group().startsWith("'") || rightMatcher.group().startsWith("\"")) {
                    if (rightMatcher.group().length() == 3 && leftRules.contains(rightMatcher.group().substring(1, 2))) {
                        throw new CheckerException("Neplatná definícia neterminálu " + rightMatcher.group() + ", pretože " +
                                "daný terminál už existuje!");
                    }
                    if (rightMatcher.group().length() == 2) {
                        throw new CheckerException("Našiel som prázdne " + rightMatcher.group()
                                + " bez terminálu!");
                    }
                }
                // if the matched string does not start with ' (or ") it is a non-terminal
                else if (!rightMatcher.group().startsWith("'") && !rightMatcher.group().startsWith("\"") &&
                        !rightMatcher.group().equals("ε")) {
                    rightNonTerminals.add(rightMatcher.group());
                }
            }
            // check whether all non-terminals (found on right sides of all rules) are defined
            for (String nonTerminal : rightNonTerminals) {
                if (!leftRules.contains(nonTerminal)) {
                    throw new CheckerException("Pravidlo pre neterminál " + nonTerminal + " nie je definované!");
                }
            }
        }
    }
}
