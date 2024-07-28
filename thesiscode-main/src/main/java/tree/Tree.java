package tree;

import java.util.*;

public class Tree {
    private final LinkedHashMap<String, List<String>> predictSets;
    private final LinkedHashMap<String, List<String>> firstSets;
    private final List<RulesForTree> rules;
    private final List<Integer> usedRules;
    private final LinkedList<ProcessedSymbol> symbols;
    private final LinkedList<String> queue;
    private boolean isValid;

    public Tree(List<RulesForTree> rules, LinkedHashMap<String, List<String>> predictSets,
                LinkedHashMap<String, List<String>> firstSets) {
        usedRules = new ArrayList<>();
        symbols = new LinkedList<>();
        queue = new LinkedList<>();

        this.predictSets = predictSets;
        this.firstSets = firstSets;
        this.rules = rules;
    }

    public void analyze(String word) {

        usedRules.clear();
        symbols.clear();
        queue.clear();

        String bestSymbolMatch;
        int bestRuleMatch = 0, whichRule, idx;
        boolean wasFound;

        String inputSymbol, queueSymbol, quotation;
        List<String> entryValues, newSymbols;
        Iterator<Map.Entry<String, List<String>>> iterator;
        Map.Entry<String, List<String>> entry;

        String startSymbol = rules.get(0).leftSide();
        this.queue.add(startSymbol);
        addToSymbols(startSymbol);

        this.isValid = true;

        while (true) {
            if (this.queue.isEmpty()) {
                this.isValid = word.length() == 0;
                break;
            }

            queueSymbol = this.queue.pop();
            if (queueSymbol.startsWith("'") || queueSymbol.startsWith("\"")) {
                quotation = String.valueOf(queueSymbol.charAt(0));
                if (word.length() < queueSymbol.length() - 2) {
                    this.isValid = false;
                    break;
                }
                inputSymbol = word.substring(0, queueSymbol.length() - 2);
                if (!inputSymbol.equals(queueSymbol.substring(1, queueSymbol.length() - 1))) {
                    this.isValid = false;
                    break;
                }
                word = word.substring(queueSymbol.length() - 2);
            } else {
                iterator = predictSets.entrySet().iterator();
                bestSymbolMatch = null;

                while (iterator.hasNext()) {
                    entry = iterator.next();
                    entryValues = entry.getValue();
                    whichRule = Integer.parseInt(entry.getKey());

                    if (rules.get(whichRule - 1).leftSide().equals(queueSymbol)) {
                        if (bestSymbolMatch == null && entryValues.contains("$")) {
                            bestRuleMatch = whichRule;
                            bestSymbolMatch = "ε";
                        }

                        for (String symbol : entryValues) {
                            if (word.length() < symbol.length())
                                continue;

                            inputSymbol = word.substring(0, symbol.length());
                            if (symbol.equals(inputSymbol) && (bestSymbolMatch == null || symbol.length() > bestSymbolMatch.length()
                                    || bestSymbolMatch.equals("ε"))) {
                                bestRuleMatch = whichRule;
                                bestSymbolMatch = symbol;
                            }
                        }
                    }
                }

                if (bestSymbolMatch == null) {
                    this.queue.addFirst(queueSymbol);
                    this.isValid = false;
                    break;
                } else {
                    this.usedRules.add(bestRuleMatch);
                    if (!rules.get(bestRuleMatch - 1).rightSide().contains("ε")) {
                        newSymbols = this.rules.get(bestRuleMatch - 1).rightSide();
                        this.queue.addAll(0, newSymbols);
                        addToSymbols(newSymbols);
                    } else {
                        addToSymbols("ε");
                        updateProcessedSymbolsList("ε");
                    }
                }
            }
            updateProcessedSymbolsList(queueSymbol);
        }

        checkWhetherRemainingSymbolsCanBeEpsilons(word);
        adjustProcessedSymbolsList();
    }

    private void checkWhetherRemainingSymbolsCanBeEpsilons(String word) {
        List<String> entryValues;
        List<Integer> usedRules = new ArrayList<>();
        Map.Entry<String, List<String>> entry;
        String queueSymbol;
        boolean wasFound;
        int whichRule;

        if (!this.queue.isEmpty()) {
            for (String remainingSymbol : this.queue) {
                wasFound = false;
                whichRule = 1;

                while (whichRule < rules.size() + 1) {
                    entry = firstSets.entrySet().stream()
                            .filter(firstEntry -> firstEntry.getKey().equals(remainingSymbol)).findFirst().orElse(null);
                    if (entry == null || !entry.getValue().contains("ε"))
                        break;

                    if (rules.get(whichRule - 1).leftSide().equals(remainingSymbol)
                            && rules.get(whichRule - 1).rightSide().contains("ε")) {
                        usedRules.add(whichRule);
                        wasFound = true;
                        break;
                    }
                    whichRule++;
                }
                if (!wasFound)
                    break;
            }
        }

        int epsReplaceableCount;
        if (!usedRules.isEmpty()) {
            epsReplaceableCount = usedRules.size();
            for (int i = 0; i < epsReplaceableCount; i++) {
                addToSymbols("ε");
                updateProcessedSymbolsList("ε");
            }
            for (int i = 0; i < epsReplaceableCount; i++) {
                queueSymbol = queue.pop();
                updateProcessedSymbolsList(queueSymbol);
            }
            this.usedRules.addAll(usedRules);
            if (queue.isEmpty())
                this.isValid = true;
        }
    }

    private void adjustProcessedSymbolsList() {
        ProcessedSymbol oldProcessedSymbol, newProcessedSymbol;
        String oldSymbol;

        for (int i = 0; i < symbols.size(); i++) {
            oldProcessedSymbol = symbols.get(i);
            oldSymbol = oldProcessedSymbol.symbol();

            if (oldSymbol.startsWith("'")) {
                newProcessedSymbol = new ProcessedSymbol(oldSymbol.substring(1, oldSymbol.lastIndexOf("'"))
                        + oldSymbol.substring(oldSymbol.lastIndexOf("'") + 1), oldProcessedSymbol.processed());
                symbols.add(i, newProcessedSymbol);
                symbols.remove(i + 1);
            } else if (oldProcessedSymbol.symbol().startsWith("\"")) {
                newProcessedSymbol = new ProcessedSymbol(oldSymbol.substring(1, oldSymbol.lastIndexOf("'"))
                        + oldSymbol.substring(oldSymbol.lastIndexOf("\"") + 1), oldProcessedSymbol.processed());
                symbols.add(i, newProcessedSymbol);
                symbols.remove(i + 1);
            }
        }
    }

    private void updateProcessedSymbolsList(String queueSymbol) {
        int idx;
        String finalQueueSymbol = queueSymbol;

        if (queueSymbol.startsWith("'") || queueSymbol.startsWith("\"")) {
            String quotation = String.valueOf(queueSymbol.charAt(0));
            idx = symbols.indexOf(symbols.stream()
                    .filter(symbol_entry -> symbol_entry.symbol().substring(0,
                            symbol_entry.symbol().lastIndexOf(quotation) + 1).equals(finalQueueSymbol))
                    .filter(symbol_entry -> !symbol_entry.processed()).findFirst().get());
        }
        else {
            idx = symbols.indexOf(symbols.stream()
                    .filter(symbol_entry -> symbol_entry.symbol().substring(0, 1).equals(finalQueueSymbol))
                    .filter(symbol_entry -> !symbol_entry.processed()).findFirst().get());
        }

        symbols.add(idx,new ProcessedSymbol(symbols.get(idx).symbol(), true));
        symbols.remove(idx + 1);
    }

    private void addToSymbols(List<String> symbols) {
        int symbolsCount;

        int idx = 0;
        for (String symbol : symbols) {
            symbolsCount = this.symbols.stream()
                    .filter((symbol_entry -> symbol_entry.symbol().startsWith(symbol)))
                    .toList()
                    .size();

            this.symbols.add(idx,new ProcessedSymbol(symbol + symbolsCount, false));
            idx++;
        }
    }

    private void addToSymbols(String symbol) {
        int symbolsCount = symbols.stream()
                    .filter((symbol_entry -> symbol_entry.symbol().startsWith(symbol)))
                    .toList()
                    .size();
        symbols.add(new ProcessedSymbol(symbol + symbolsCount, false));
    }

    public List<Integer> getUsedRules() {
        return usedRules;
    }

    public List<RulesForTree> getRules() {
        return rules;
    }

    public LinkedList<ProcessedSymbol> getSymbols() {
        return symbols;
    }

    public boolean isValid() {
        return isValid;
    }
}
