package processgrammar.lexer;

import java.io.IOException;
import java.io.Reader;

public class Lexer {

    private int current;
    private String value;
    private final Reader reader;

    public Lexer(Reader reader) {
        this.reader = reader;
    }

    public Token nextToken() {
        if (current == 0)
            consume();
        if(current == '\'') {
            checkTerminal('\'');
            return Token.TERMINAL;
        }
        else if(current == '"') {
            checkTerminal('"');
            return Token.TERMINAL;
        } else if (current == 'ε') {
            consume();
            return Token.EPSILON;
        } else if (Character.isAlphabetic(current)) {
            value = Character.toString(current);
            consume();
            return Token.NONTERMINAL;
        } else if (current == '→') {
            consume();
            return Token.RULE_ARROW;
        } else if (current == '|') {
            consume();
            return Token.ALTERNATIVE;
        } else if (current == '\n') {
            consume();
            return Token.NEWLINE;
        } else if (current == '\r') {
            consume();
            if (current == '\n') {
                consume();
                return Token.NEWLINE;
            }
            else {
                throw new LexerException((char) current + " je neplatný token!");
            }
        }
        if (current == '\0' || current == -1) {
            return Token.EOF;
        } else {
            throw new LexerException((char)current + " je neplatný token!");
        }
    }

    private void checkTerminal(char quotationMark) {
        StringBuilder stringBuilder = new StringBuilder();
        stringBuilder.append(quotationMark);

        consume();
        while(quotationMark != current) {
            stringBuilder.append((char) current);
            consume();
        }

        if (current != quotationMark)
            throw new LexerException("Pri  termináli " + stringBuilder.toString().substring(1) + " chýba úvodzovka " + quotationMark + "!");
        stringBuilder.append(quotationMark);

        value = stringBuilder.toString();
        consume();
    }

    private void consume() {
        try {
            do {
                current = reader.read();
            } while (current == ' ');
        }
        catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public String getValue() {
        return value;
    }

    private boolean isSpecialCharacter(char ch) {
        return "{}[]'\"()".contains(Character.toString(ch));
    }
}
