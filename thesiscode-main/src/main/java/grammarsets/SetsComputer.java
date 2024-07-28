package grammarsets;

import processgrammar.parser.RuleObject;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SetsComputer {
    private final LinkedHashMap<String, List<String>> firstSets;
    private final LinkedHashMap<String, List<String>> followSets;
    private final LinkedHashMap<String, List<String>> predictSets;
    private final List<RuleObject> rulesList;
    private final List<String> nonTerminals;
    private final List<String> terminals;
    public SetsComputer(List<RuleObject> rulesList) {
        this.firstSets = new LinkedHashMap<>();
        this.followSets = new LinkedHashMap<>();
        this.predictSets = new LinkedHashMap<>();
        this.terminals = new ArrayList<>();
        this.rulesList = rulesList;
        this.nonTerminals = rulesList.stream()
                .map(RuleObject::leftSide)
                .distinct()
                .toList();
    }

    public void computeTerminalSet() {
        Pattern findGrammarSymbols = Pattern.compile("\"[^\"]*\"|'[^']*'|[^'\" ]");
        Matcher matcher;

        for (RuleObject rule : rulesList) {
            matcher = findGrammarSymbols.matcher(rule.rightSide());
            while (matcher.find()) {
                if ((matcher.group().startsWith("'") || matcher.group().startsWith("\"")) &&
                        !terminals.contains(matcher.group().substring(1, matcher.group().length() - 1))) {
                    terminals.add(matcher.group().substring(1, matcher.group().length() - 1));
                }
            }
        }

        Collections.sort(terminals);
    }

    public void computeFirstSets() {
        // create an empty set for every non-terminal
        for (String nonTerminal : nonTerminals) {
            firstSets.put(nonTerminal, new ArrayList<>());
        }

        Pattern findGrammarSymbols = Pattern.compile("\"[^\"]*\"|'[^']*'|[^'\" ]");
        Matcher matcher;

        boolean hasChanged = true;
        boolean addEps;

        List<String> firstSet, firstSetRightNonTerminal;
        String quotation;

        while (hasChanged) {
            hasChanged = false;
            for (RuleObject rule : this.rulesList) {
                addEps = false;
                firstSet = this.firstSets.get(rule.leftSide());
                matcher = findGrammarSymbols.matcher(rule.rightSide());

                while (matcher.find()) {
                    // terminal enclosed within ' or " (not added)
                    quotation = String.valueOf(matcher.group().charAt(0));

                    if ((matcher.group().startsWith("'") || matcher.group().startsWith("\"")) &&
                            !firstSet.contains(matcher.group().substring(1, matcher.group().lastIndexOf(quotation)))) {
                        firstSet.add(matcher.group().substring(1, matcher.group().lastIndexOf(quotation)));
                        hasChanged = true;
                        addEps = false;
                        break;
                    // terminal enclosed within ' or " (already added)
                    } else if (matcher.group().startsWith("'") || matcher.group().startsWith("\"")) {
                        addEps = false;
                        break;
                    } else if (matcher.group().equals("ε") && !firstSet.contains("ε")) {
                        firstSet.add("ε");
                        hasChanged = true;
                    }
                    // non-terminal
                    else if (!matcher.group().equals("ε")) {
                        addEps = false;
                        firstSetRightNonTerminal = this.firstSets.get(matcher.group());
                        if (firstSetRightNonTerminal.contains("ε")) {
                            addEps = true;
                        }
                        for (String terminal : firstSetRightNonTerminal) {
                            if (!firstSet.contains(terminal) && !terminal.equals("ε")) {
                                firstSet.add(terminal);
                                hasChanged = true;
                            }
                        }
                        if (!addEps) {
                            break;
                        }
                    }
                }
                if (addEps && !firstSet.contains("ε"))
                    firstSet.add("ε");
                this.firstSets.put(rule.leftSide(), firstSet);
            }
        }

        Set<String> keys = this.firstSets.keySet();
        for (String key : keys) {
            Collections.sort(this.firstSets.get(key));
        }
    }
    public void computeFollowSets() {
        if (this.firstSets.size() == 0)
            return;

        // create an empty set for every non-terminal
        for (String nonTerminal: nonTerminals) {
            followSets.put(nonTerminal, new ArrayList<>());
        }

        followSets.get(nonTerminals.get(0)).add("$");

        Pattern findGrammarSymbols = Pattern.compile("\"[^\"]*\"|'[^']*'|[^'\" ]");
        Matcher matcher;

        boolean hasChanged = true;
        boolean hadEps;

        List<String> followSet, firstSetRightNonTerminal;
        List<String> followSetLeftNonTerminal;
        String rightNonTerminal, ruleSubstr, quotation;
        int idxOfNonTerminal;

        while (hasChanged) {
            hasChanged = false;
            for (RuleObject rule : this.rulesList) {
                ruleSubstr = rule.rightSide();
                followSet = null;
                rightNonTerminal = null;
                matcher = findGrammarSymbols.matcher(rule.rightSide());
                while (matcher.find()) {
                    // non-terminal (for the follow set)
                    if ((!matcher.group().startsWith("'") && !matcher.group().startsWith("\""))
                        && !matcher.group().equals("ε") ) {
                        rightNonTerminal = matcher.group();
                        idxOfNonTerminal = matcher.end();
                        followSet = this.followSets.get(rightNonTerminal);
                        followSet.add("ε");
                        while (matcher.find()) {
                            // terminal enclosed within ' or " (not added)
                            quotation = String.valueOf(matcher.group().charAt(0));
                            if ((matcher.group().startsWith("'") || matcher.group().startsWith("\""))
                                && !followSet.contains(matcher.group().substring(1, matcher.group().lastIndexOf(quotation))))  {
                                followSet.remove("ε");
                                followSet.add(matcher.group().substring(1, matcher.group().lastIndexOf(quotation)));
                                hasChanged = true;
                                break;
                            }
                            // terminal enclosed within ' or " (already added)
                            else if (matcher.group().startsWith("'") || matcher.group().startsWith("\"")) {
                                followSet.remove("ε");
                                break;
                            }
                            // non-terminal
                            else if (!matcher.group().equals("ε")){
                                firstSetRightNonTerminal = this.firstSets.get(matcher.group());
                                hadEps = followSet.remove("ε");

                                for (String terminal : firstSetRightNonTerminal) {
                                    if (!followSet.contains(terminal)) {
                                        followSet.add(terminal);
                                        if (!hadEps && terminal.equals("ε"))
                                            hasChanged = true;
                                    }
                                }
                                if (!followSet.contains("ε"))
                                    break;
                            }
                        }
                        ruleSubstr = ruleSubstr.substring(idxOfNonTerminal + 1);
                        matcher = findGrammarSymbols.matcher(ruleSubstr);
                    }

                    if (followSet != null && followSet.contains("ε")) {
                        followSet.remove("ε");
                        followSetLeftNonTerminal = followSets.get(rule.leftSide());
                        for (String terminal : followSetLeftNonTerminal) {
                            if (!followSet.contains(terminal)) {
                                followSet.add(terminal);
                                hasChanged = true;
                            }
                        }
                    }
                }

                if (rightNonTerminal != null)
                    this.followSets.put(rightNonTerminal, followSet);
            }
        }

        Set<String> keys = this.followSets.keySet();
        for (String key : keys) {
            Collections.sort(this.followSets.get(key));
        }
    }

    public void computePredictSets() {
        if (this.firstSets.size() == 0 || this.followSets.size() == 0)
            return;

        Pattern findGrammarSymbols = Pattern.compile("\"[^\"]*\"|'[^']*'|[^'\" ]");
        Matcher matcher;

        List<String> predictSet, followSetLeftNonTerminal, firstSetRightNonTerminal;
        String quotation;
        RuleObject rule;

        int ruleCount = this.rulesList.size();
        for (int whichRule = 0; whichRule < ruleCount; whichRule++) {
            rule = this.rulesList.get(whichRule);
            predictSet = new ArrayList<>();
            predictSet.add("ε");
            matcher = findGrammarSymbols.matcher(rule.rightSide());

            while (matcher.find()) {
                quotation = String.valueOf(matcher.group().charAt(0));
                // terminal enclosed within ' or " (not added)
                if ((matcher.group().startsWith("'") || matcher.group().startsWith("\"")))  {
                    if (!predictSet.contains(matcher.group().substring(1, matcher.group().length() - 1))) {
                        predictSet.add(matcher.group().substring(1, matcher.group().lastIndexOf(quotation)));
                    }
                    predictSet.remove("ε");
                    break;
                }
                // non-terminal
                else if (!matcher.group().equals("ε")){
                    predictSet.remove("ε");
                    firstSetRightNonTerminal = this.firstSets.get(matcher.group());
                    for (String terminal : firstSetRightNonTerminal) {
                        if (!predictSet.contains(terminal)) {
                            predictSet.add(terminal);
                        }
                    }
                    if (!predictSet.contains("ε"))
                        break;
                }
            }
            if (predictSet.contains("ε")) {
                followSetLeftNonTerminal = this.followSets.get(rule.leftSide());
                for (String terminal : followSetLeftNonTerminal) {
                    if (!predictSet.contains(terminal)) {
                        predictSet.add(terminal);
                    }
                }
                predictSet.remove("ε");
            }
            this.predictSets.put(String.valueOf(whichRule + 1), predictSet);
        }

        Set<String> keys = this.predictSets.keySet();
        for (String key : keys) {
            Collections.sort(this.predictSets.get(key));
        }
    }

    public LinkedHashMap<String, List<String>> getFirstSets() {
        return this.firstSets;
    }

    public LinkedHashMap<String, List<String>> getFollowSets() {
        return this.followSets;
    }

    public LinkedHashMap<String, List<String>> getPredictSets() {
        return this.predictSets;
    }

    public List<String> getTerminals() {return this.terminals;}

    public List<String> getNonTerminals() {return this.nonTerminals;}

    public List<RuleObject> getRulesList() {return this.rulesList;}
}
