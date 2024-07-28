package tree;

public class Node {
    private final String id;
    private final String label;
    private final int weight;
    private int posX, posY;

    public Node(String id, String label, int weight, int posX, int posY) {
        this.id = id;
        this.label = label;
        this.weight = weight;
        this.posX = posX;
        this.posY = posY;
    }

    @Override
    public String toString() {
        return "{ \"data\": { \"id\": \"" + id + "\", \"label\": \"" + label + "\", \"weight\": " +
                weight + "}, \"position\": { \"x\": " + posX + ", \"y\": " + posY + "}}";
    }

    public String getId() {
        return id;
    }

    int getPosX() { return posX;}

    int getPosY() {return posY;}

    void setPosX(int posX) {
        this.posX = posX;
    }

    void setPosY(int posY) {
        this.posY = posY;
    }
}
