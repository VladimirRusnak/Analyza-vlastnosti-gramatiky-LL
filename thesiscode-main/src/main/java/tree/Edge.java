package tree;

public class Edge {
    private final String id;
    private final String source;
    private final String target;

    public Edge(String id, String source, String target) {
        this.id = id;
        this.source = source;
        this.target = target;
    }

    @Override
    public String toString() {
        return "{ \"data\": { \"id\": \"" + id + "\", \"source\": \"" + source +
                "\", \"target\": \"" + target + "\"}}";
    }

    public String getSource() {
        return source;
    }

    public String getTarget() {
        return target;
    }
}
