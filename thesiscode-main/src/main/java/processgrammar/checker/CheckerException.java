package processgrammar.checker;

public class CheckerException extends RuntimeException {
    public CheckerException(String message) {
        super(message);
    }
    public CheckerException(String message, Throwable cause) {
        super(message, cause);
    }
}
