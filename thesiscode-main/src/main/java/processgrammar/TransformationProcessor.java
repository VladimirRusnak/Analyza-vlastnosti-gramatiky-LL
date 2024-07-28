package processgrammar;

import org.apache.tomcat.util.digester.Rule;
import processgrammar.parser.RuleObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class TransformationProcessor {
    static List<RuleObject> removeLeftRecursion(List<RuleObject> rulesList) {
        List<RuleObject> notRedundantRulesList = new ArrayList<>(rulesList);

        List<String> nonTerminals = rulesList.stream()
                .map(RuleObject::leftSide)
                .distinct()
                .toList();

        boolean hasChanged;
        notRedundantRulesList = deleteRedundantRules(notRedundantRulesList);

        for (String nonTerminal : nonTerminals) {
            hasChanged = true;
            while (hasChanged) {
                notRedundantRulesList = removeDirectRecursion(notRedundantRulesList, nonTerminals, nonTerminal);
                hasChanged = removeIndirectRecursion(notRedundantRulesList, nonTerminal);
            }
            notRedundantRulesList = removeDirectRecursion(notRedundantRulesList, nonTerminals, nonTerminal);
        }

        return notRedundantRulesList;
    }

    private static List<RuleObject> removeDirectRecursion(List<RuleObject> rulesList, List<String> nonTerminals, String nonTerminal) {
        List<RuleObject> rulesWithDirectRecursion = getRulesWithDirectRecursion(rulesList, nonTerminal);
        if (rulesWithDirectRecursion.size() == 0) {
            return rulesList;
        }

        List<RuleObject> rulesWithoutDirectRecursion = getRulesWithoutDirectRecursion(rulesList, nonTerminal);
        int ruleIdx = findIndexOfFirstRuleWithNonTerminal(rulesList, nonTerminal);
        rulesList = removeRules(rulesList, nonTerminal);

        String newNonTerminal = getNewNonTerminal(rulesList, nonTerminals);

        for (RuleObject rule : rulesWithoutDirectRecursion) {
            if (rule.rightSide().equals("ε")) {
                rulesList.add(ruleIdx++, new RuleObject(rule.leftSide(),  newNonTerminal));
            } else {
                rulesList.add(ruleIdx++, new RuleObject(rule.leftSide(), rule.rightSide() + " " + newNonTerminal));
            }
        }

        for (RuleObject rule : rulesWithDirectRecursion)
            rulesList.add(ruleIdx++, new RuleObject(newNonTerminal, rule.rightSide().substring(2) + " " + newNonTerminal));

        rulesList.add(ruleIdx, new RuleObject(newNonTerminal, "ε"));
        return rulesList;
    }
    private static String getNewNonTerminal(List<RuleObject> rulesList, List<String> nonTerminals) {
        char ch = 'A';
        List<String> allSymbols = new ArrayList<>();

        allSymbols.addAll(nonTerminals);
        allSymbols.addAll(computeTerminalSet(rulesList));

        while (allSymbols.contains(Character.toString(ch))) {
            if (ch == 'Z') {
                ch = 'a';
            } else if (ch == 'z') {
                ch = 'α';
            } else {
                ch++;
            }
        }

        return Character.toString(ch);
    }

    private static List<String> computeTerminalSet(List<RuleObject> rulesList) {
        Pattern findGrammarSymbols = Pattern.compile("\"[^\"]*\"|'[^']*'|[^'\" ]");
        Matcher matcher;
        List<String> terminals = new ArrayList<>();

        for (RuleObject rule : rulesList) {
            matcher = findGrammarSymbols.matcher(rule.rightSide());
            while (matcher.find()) {
                if ((matcher.group().startsWith("'") || matcher.group().startsWith("\"")) &&
                        !terminals.contains(matcher.group().substring(1, matcher.group().length() - 1))) {
                    terminals.add(matcher.group().substring(1, matcher.group().length() - 1));
                }
            }
        }

        return terminals;
    }

    private static List<RuleObject> removeRules(List<RuleObject> rulesList, String nonTerminal) {
        List<RuleObject> newRulesList = new ArrayList<>();
        for (RuleObject rule : rulesList) {
            if (!rule.leftSide().equals(nonTerminal)) {
                newRulesList.add(rule);
            }
        }
        return newRulesList;
    }

    private static List<RuleObject> getRulesWithDirectRecursion(List<RuleObject> rulesList, String nonTerminal) {
        List<RuleObject> rulesWithDirectRecursion = new ArrayList<>();
        Pattern findGrammarSymbols = Pattern.compile("\"[^\"]*\"|'[^']*'|[^'\" ]");
        Matcher matcher;

        for (RuleObject rule : rulesList) {
            if (rule.leftSide().equals(nonTerminal)) {
                matcher = findGrammarSymbols.matcher(rule.rightSide());
                if (matcher.find() && rule.leftSide().equals(matcher.group())) {
                    rulesWithDirectRecursion.add(rule);
                }
            }
        }

        return rulesWithDirectRecursion;
    }

    private static List<RuleObject> getRulesWithoutDirectRecursion(List<RuleObject> rulesList, String nonTerminal) {
        List<RuleObject> rulesWithoutDirectRecursion = new ArrayList<>();
        Pattern findGrammarSymbols = Pattern.compile("\"[^\"]*\"|'[^']*'|[^'\" ]");
        Matcher matcher;

        for (RuleObject rule : rulesList) {
            if (rule.leftSide().equals(nonTerminal)) {
                matcher = findGrammarSymbols.matcher(rule.rightSide());
                if (matcher.find() && !rule.leftSide().equals(matcher.group())) {
                    rulesWithoutDirectRecursion.add(rule);
                }
            }
        }

        return rulesWithoutDirectRecursion;
    }

    private static boolean removeIndirectRecursion(List<RuleObject> rulesList, String leftNonTerminal) {
        String newRightSide;
        List<RuleObject> rulesListForNonTerminal1, rulesListForNonTerminal2;
        Pattern findGrammarSymbols = Pattern.compile("\"[^\"]*\"|'[^']*'|[^'\" ]");
        Matcher matcher;
        boolean hasChanged = false;

        // check every rule for indirect left recursion
        rulesListForNonTerminal1 = getRulesByLeftSide(rulesList, leftNonTerminal);
        for (RuleObject rule : rulesListForNonTerminal1) {
            matcher = findGrammarSymbols.matcher(rule.rightSide());
            // first symbol on the right side is non-terminal and there is a potential indirect left recursion
            if (matcher.find() && !(matcher.group().startsWith("'") || matcher.group().startsWith("\"") ||
                    matcher.group().equals("ε")) && isThereIndirectLeftRecursion(rulesList, leftNonTerminal, matcher.group())) {
                hasChanged = true;
                if (rule.rightSide().length() > 1)
                    newRightSide = rule.rightSide().substring(2, rule.rightSide().length());
                else
                    newRightSide = "";

                rulesListForNonTerminal2 = getRulesByLeftSide(rulesList, matcher.group());
                updateRules(rulesList, rulesListForNonTerminal2, newRightSide, rulesList.indexOf(rule));
            }
        }

        return hasChanged;
    }

    private static void updateRules(List<RuleObject> rulesListToBeUpdated, List<RuleObject> rulesList
            , String newRightSide, int ruleIdx) {

        String nonTerminal = rulesListToBeUpdated.get(ruleIdx).leftSide();
        rulesListToBeUpdated.remove(ruleIdx);
        for (RuleObject rule : rulesList) {
            rulesListToBeUpdated.add(ruleIdx++, new RuleObject(nonTerminal,
                    rule.rightSide() + " " + newRightSide));
        }
    }

    private static List<RuleObject> deleteRedundantRules(List<RuleObject> ruleList) {
        return ruleList.stream().filter(rule -> !isRedundant(rule)).collect(Collectors.toList());
    }

    private static boolean isRedundant(RuleObject rule) {
        String leftSide = rule.leftSide();
        String rightSide = rule.rightSide();
        return leftSide.equals(rightSide) && rightSide.length() == 1;
    }

    private static List<RuleObject> getRulesByLeftSide(List<RuleObject> ruleList, String leftSide) {
        List<RuleObject> filteredRules = new ArrayList<>();
        for (RuleObject rule : ruleList) {
            if (rule.leftSide().equals(leftSide)) {
                filteredRules.add(rule);
            }
        }
        return filteredRules;
    }

    private static int findIndexOfFirstRuleWithNonTerminal(List<RuleObject> rulesList, String nonTerminal) {
        for (int index = 0; index < rulesList.size(); index++) {
            if (rulesList.get(index).leftSide().equals(nonTerminal)) {
                return index;
            }
        }
        return -1;
    }

    private static boolean isThereIndirectLeftRecursion(List<RuleObject> rulesList, String leftNonTerminal, String rightNonTerminal) {
        return findIndexOfFirstRuleWithNonTerminal(rulesList, rightNonTerminal) < findIndexOfFirstRuleWithNonTerminal(rulesList, leftNonTerminal);
    }
}
