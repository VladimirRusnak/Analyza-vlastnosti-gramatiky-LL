package processgrammar.parser;

import processgrammar.lexer.Token;
import processgrammar.lexer.Lexer;

import java.util.ArrayList;
import java.util.List;

public class Parser {
    private final Lexer lexer;
    private Token symbol;

    private String leftRuleSide;
    private String rightRuleSide;

    private final List<RuleObject> ruleObjectList;

    public Parser(Lexer lexer) {
        this.lexer = lexer;
        this.ruleObjectList = new ArrayList<>();
    }

    public void matchInput() {
        consume();
        s();
        match(Token.EOF);
    }

    // S -> rules
    public void s() {
        rules();
    }

    // rules -> rule Token.NEWLINE [rules]
    public void rules() {
        rule();
        match(Token.NEWLINE);
        consume();
        if (symbol != Token.EOF)
            rules();
    }

    // rule -> Token.NONTERMINAL → rule_right { Token.ALTERNATIVE rule_right }
    public void rule() {
        match(Token.NONTERMINAL);
        leftRuleSide = lexer.getValue();
        rightRuleSide = "";
        consume();
        match(Token.RULE_ARROW);
        consume();

        if (symbol != Token.EPSILON)
            rule_right();
        else {
            rule_right_eps();
        }

        ruleObjectList.add(new RuleObject(leftRuleSide, rightRuleSide));
        rightRuleSide = "";

        while (symbol != Token.NEWLINE) {
            match(Token.ALTERNATIVE);
            consume();
            if (symbol != Token.EPSILON)
                rule_right();
            else {
                rule_right_eps();
            }

            ruleObjectList.add(new RuleObject(leftRuleSide, rightRuleSide));
            rightRuleSide = "";
        }
    }

    // rule_right_eps -> eps { Token.ALTERNATIVE rule_right }
    public void rule_right_eps() {
        rightRuleSide = "ε";
        consume();
    }

    // rule_right -> (Token.NONTERMINAL | Token.TERMINAL) rule_right
    public void rule_right() {
        if (symbol == Token.NEWLINE)
            throw new ParserException("Našiel som nedokončené pravidlo!");
        if (symbol != Token.TERMINAL)
            match(Token.NONTERMINAL);
        else
            match(Token.TERMINAL);

        rightRuleSide += lexer.getValue() + " ";
        consume();
        if (symbol != Token.NEWLINE && symbol != Token.ALTERNATIVE)
            rule_right();
    }

    private void consume() {
        symbol = lexer.nextToken();
    }

    private void match(Token expectedToken) {
        if (symbol != expectedToken)
            throw new ParserException("Neočakávaný znak " +  symbol + "! Nahraďte ho za znak " + expectedToken +
            "!");
    }

    public List<RuleObject> getRuleObjectList() {
        return ruleObjectList;
    }
}
