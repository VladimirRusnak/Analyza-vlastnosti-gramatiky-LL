package tree;

import processgrammar.parser.RuleObject;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class TreeConstruct {
    public static final int DISTANCE_BETWEEN_NODES = 75;
    public static final int NON_TERMINAL_ACCEPTED = 0;
    public static final int NON_TERMINAL_NOT_ACCEPTED = 1;
    public static final int TERMINAL_ACCEPTED = 2;
    public static final int TERMINAL_NOT_ACCEPTED = 3;
    private boolean shouldAdjust;
    private final List<Node> nodeList;
    private final List<Edge> edgeList;
    private final List<RulesForTree> rules;
    private final LinkedList<NonTerminalsToExpand>  nonTerminalsToExpand;
    private final LinkedHashMap<Node, Integer> nodesHeight;
    private final HashMap<String, Integer> symbolsNumbers;
    private final Tree tree;
    public TreeConstruct(List<RuleObject> rules, LinkedHashMap<String, List<String>> predictSets,
                         LinkedHashMap<String, List<String>> firstSets) {
        this.rules = new ArrayList<>();
        nodeList = new ArrayList<>();
        edgeList = new ArrayList<>();
        nonTerminalsToExpand = new LinkedList<>();
        symbolsNumbers = new HashMap<>();
        nodesHeight = new LinkedHashMap<>();
        shouldAdjust = true;

        List<String> rightSide = new ArrayList<>();
        Matcher matcher;
        Pattern findGrammarSymbols = Pattern.compile("\"[^\"]*\"|'[^']*'|[^'\" ]");

        for (RuleObject rule : rules) {
            matcher = findGrammarSymbols.matcher(rule.rightSide());
            while (matcher.find()) {
                rightSide.add(matcher.group());
            }
            this.rules.add(new RulesForTree(rule.leftSide(), new ArrayList<>(rightSide)));
            rightSide.clear();
        }

        tree = new Tree(this.rules, predictSets, firstSets);
    }

    public void constructTree(String word) {
        clear();
        tree.analyze(word);

        List<NonTerminalsToExpand> nonTerminalsToExpandList = new ArrayList<>();
        List<Integer> usedRules = tree.getUsedRules();

        traverseNodes(nonTerminalsToExpandList, usedRules);

        do {
            correctNodePositions();
        } while(shouldAdjust);
    }

    private void correctNodePositions() {
        List<Node> lowestNodes, allNodesToAdjust;
        Node nodeChild;

        int maxHeight = getMaxHeight();
        int leftNodePosX, rightNodePosX, diff;

        shouldAdjust = false;
        for (int height = maxHeight; height > 0; height--) {
            int finalHeight = height;

            // collect all the lowest nodes from the given tree height
            lowestNodes = nodesHeight.entrySet().stream()
                    .filter(entry -> entry.getValue() == finalHeight)
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());

            while (!lowestNodes.isEmpty()) {
                // get the left-most node
                nodeChild = lowestNodes.get(0);
                
                // get all the nodes, whose positions will need to be adjusted
                allNodesToAdjust = getNodesFromGroup(nodeChild);

                // remove the lowest nodes, that were adjusted
                lowestNodes = removeLowestAdjustedNodes(lowestNodes, nodeChild);

                if (!lowestNodes.isEmpty()) {
                    leftNodePosX = allNodesToAdjust.get(allNodesToAdjust.size() - 1).getPosX();
                    rightNodePosX = lowestNodes.get(0).getPosX();
                    diff = rightNodePosX - leftNodePosX;

                    if (diff <= 0) {
                        for (Node node : allNodesToAdjust)
                            node.setPosX(node.getPosX() + diff - DISTANCE_BETWEEN_NODES);
                        shouldAdjust = true;
                    }
                }
            }
        }
    }

    private List<Node> removeLowestAdjustedNodes(List<Node> lowestNodesToRemove, Node nodeChild) {
        List<Edge> edgesOfGroupToAdjust;
        String source;
        List<Node> lowestNodesToAdjust;
        Edge edge;

        // get the name of the parent node
        edge = edgeList.stream()
                .filter(edge_entry -> edge_entry.getTarget().equals(nodeChild.getId()))
                .findFirst()
                .get();
        source = edge.getSource();

        // get all the other edges, that are connected to the parent node
        String finalSource = source;
        edgesOfGroupToAdjust = edgeList.stream()
                .filter(edge_entry -> edge_entry.getSource().equals(finalSource))
                .collect(Collectors.toList());

        // get all the lowest nodes from the group, that will be adjusted
        List<Edge> finalEdgesOfGroupToAdjust = edgesOfGroupToAdjust;
        lowestNodesToAdjust = nodeList.stream()
                .filter(node_entry -> finalEdgesOfGroupToAdjust.stream().anyMatch(edge_entry ->
                        edge_entry.getTarget().equals(node_entry.getId())))
                .collect(Collectors.toList());

        // remove all the lowest nodes from the given group
        List<Node> finalGroupToAdjust = lowestNodesToAdjust;
        lowestNodesToRemove = lowestNodesToRemove.stream()
                .filter(node_entry -> !finalGroupToAdjust.contains(node_entry))
                .collect(Collectors.toList());
        return lowestNodesToRemove;
    }

    private List<Node> getNodesFromGroup(Node node) {
        LinkedList<Node> groupToAdjust = new LinkedList<>();
        Edge edge;
        String parentId;

        // get the edge, connecting the given node and its parent
        edge = edgeList.stream()
                .filter(edge_entry -> edge_entry.getTarget().equals(node.getId()))
                .findFirst()
                .orElse(null);

        if (edge == null)
            return groupToAdjust;

        parentId = edge.getSource();
        addUpperNodesToGroup(parentId, groupToAdjust);

        // get all the other edges, that are connected to the parent node
        String finalSource = parentId;
        List<Edge> edgesOfNodesToAdd = edgeList.stream()
                .filter(edge_entry -> edge_entry.getSource().equals(finalSource)).toList();

        // get all the lowest nodes from the group, that will be adjusted
        List<Node> nodesToAdd = nodeList.stream()
                .filter(node_entry -> edgesOfNodesToAdd.stream().anyMatch(edge_entry ->
                        edge_entry.getTarget().equals(node_entry.getId()))).toList();

        for (Node nodeToAdd : nodesToAdd)
            addLowerNodesToGroup(nodeToAdd.getId(), groupToAdjust);


        return groupToAdjust;
    }

    private void addUpperNodesToGroup(String parentId, LinkedList<Node> groupToAdjust) {
        List<Node> nodesToAdjust;
        Edge edge;

        // get all the children nodes of the given parent node
        nodesToAdjust = nodeList.stream()
                .filter(node_entry -> edgeList.stream()
                        .filter(edge_entry -> edge_entry.getTarget().equals(node_entry.getId()))
                        .anyMatch(edge_entry -> edge_entry.getSource().equals(parentId)))
                .collect(Collectors.toList());

        groupToAdjust.addAll(0,nodesToAdjust);

        // get the edge, connecting the given node and its parent
        edge = edgeList.stream()
                .filter(edge_entry -> edge_entry.getTarget().equals(parentId))
                .findFirst()
                .orElse(null);

        if (edge != null)
            addUpperNodesToGroup(edge.getSource(), groupToAdjust);
        else
            groupToAdjust.add(0, nodeList.get(0));
    }

    private void addLowerNodesToGroup(String nodeId, LinkedList<Node> groupToAdjust) {
        List<Node> nodesToAdjust;
        List<Edge> edges;

        nodesToAdjust = nodeList.stream()
                .filter(node_entry -> edgeList.stream()
                        .filter(edge_entry -> edge_entry.getTarget().equals(node_entry.getId()))
                        .anyMatch(edge_entry -> edge_entry.getSource().equals(nodeId)))
                .collect(Collectors.toList());

        groupToAdjust.addAll(0,nodesToAdjust);

        // get all the edges, connecting the given node and its children
        edges = edgeList.stream()
                .filter(edge_entry -> edge_entry.getSource().equals(nodeId))
                .collect(Collectors.toList());

        if (!edges.isEmpty())
            for (Edge edge : edges)
                addLowerNodesToGroup(edge.getTarget(), groupToAdjust);
    }

    private void traverseNodes(List<NonTerminalsToExpand> nonTerminalsToExpandList, List<Integer> usedRules) {
        boolean isNonTerminal, isProcessed;
        int nonTerminalNumber, symbolNumber;
        int startPosX, parentPosX, parentPosY;
        int symbolsSize, weight;

        Node parentNode;
        List<String> symbols;
        NonTerminalsToExpand nonTerminal;
        String nonTerminalSymbol;

        initializeFirstNode(usedRules);
        LinkedList<ProcessedSymbol> symbolsWithNumbers = tree.getSymbols();

        if (usedRules.size() > 0) {
            for (int whichRule : usedRules) {
                nonTerminal = nonTerminalsToExpand.pop();
                nonTerminalSymbol = nonTerminal.symbol();
                nonTerminalNumber = nonTerminal.number();
                symbols = rules.get(whichRule - 1).rightSide();

                String finalNonTerminalSymbol = nonTerminalSymbol;
                int finalNonTerminalNumber = nonTerminalNumber;

                parentNode = nodeList.stream()
                        .filter(node -> Objects.equals(node.getId(), "node_" + finalNonTerminalSymbol + finalNonTerminalNumber))
                        .findFirst().get();

                parentPosX = parentNode.getPosX();
                symbolsSize = symbols.size();

                startPosX = parentPosX - (symbolsSize / 2 * DISTANCE_BETWEEN_NODES);
                if (symbolsSize % 2 == 0)
                    startPosX += DISTANCE_BETWEEN_NODES / 2;

                for (String symbol : symbols) {
                    isNonTerminal = true;

                    if (symbol.startsWith("'") || symbol.startsWith("\"")) {
                        isNonTerminal = false;
                        symbol = symbol.substring(1, symbol.length() - 1);
                    }

                    if (symbolsNumbers.get(symbol) == null) {
                        symbolsNumbers.put(symbol, 0);
                        symbolNumber = 0;
                    } else {
                        symbolNumber = symbolsNumbers.get(symbol) + 1;
                        symbolsNumbers.put(symbol, symbolNumber);
                    }

                    if (symbol.equals("ε")) {
                        isNonTerminal = false;
                        weight = TERMINAL_ACCEPTED;
                    } else {
                        String finalSymbol = symbol + symbolNumber;
                        ProcessedSymbol processedSymbol = symbolsWithNumbers.stream()
                                .filter(symbolWithNumber -> symbolWithNumber.symbol().equals(finalSymbol))
                                .findFirst().get();
                        isProcessed = processedSymbol.processed();

                        if (isNonTerminal) {
                            weight = isProcessed ? NON_TERMINAL_ACCEPTED : NON_TERMINAL_NOT_ACCEPTED;
                            nonTerminalsToExpandList.add(new NonTerminalsToExpand(symbol, symbolNumber));
                        } else {
                            weight = isProcessed ? TERMINAL_ACCEPTED : TERMINAL_NOT_ACCEPTED;
                        }
                    }



                    parentPosY = parentNode.getPosY();
                    Node node = new Node("node_" + symbol + symbolNumber, symbol, weight, startPosX ,
                            (parentPosY + 100));
                    nodeList.add(node);
                    edgeList.add(new Edge("edge_" + nonTerminalSymbol + nonTerminalNumber + symbol + symbolNumber,
                            "node_" + nonTerminalSymbol + nonTerminalNumber, "node_" + symbol + symbolNumber));
                    startPosX += DISTANCE_BETWEEN_NODES;
                    nodesHeight.put(node, parentPosY / 100 + 1);
                }
                nonTerminalsToExpand.addAll(0, nonTerminalsToExpandList);
                nonTerminalsToExpandList.clear();
            }
        }
    }

    private void initializeFirstNode(List<Integer> usedRules) {
        NonTerminalsToExpand nonTerminal = new NonTerminalsToExpand(rules.get(usedRules.get(0) - 1).leftSide(), 0);
        String nonTerminalSymbol = nonTerminal.symbol();
        symbolsNumbers.put(nonTerminalSymbol, 0);
        Node node = new Node("node_" + nonTerminalSymbol + 0,  nonTerminalSymbol, 0, 0, 0);
        nodeList.add(node);
        nonTerminalsToExpand.add(nonTerminal);
        nodesHeight.put(node, 0);
    }

    private int getMaxHeight() {
        int maxHeight = 0;

        for (int height : nodesHeight.values()) {
            if (maxHeight < height) {
                maxHeight = height;
            }
        }
        return maxHeight;
    }

    public String getString() {
        StringBuilder tree = new StringBuilder("[");

        for (Node node : nodeList)
            tree.append(node.toString()).append(",\n");
        for (Edge edge : edgeList)
            tree.append(edge.toString()).append(",\n");
        if (tree.length() > 1)
            tree = new StringBuilder(tree.substring(0, tree.length() - 2));

        tree.append("]");
        return tree.toString();
    }

    private void clear() {
        clearHelpObjects();
        clearTreeObjects();
    }

    private void clearHelpObjects() {
        symbolsNumbers.clear();
        nonTerminalsToExpand.clear();
        nodesHeight.clear();
    }

    private void clearTreeObjects() {
        nodeList.clear();
        edgeList.clear();
    }

    public boolean isValid() {
        return tree.isValid();
    }
}
