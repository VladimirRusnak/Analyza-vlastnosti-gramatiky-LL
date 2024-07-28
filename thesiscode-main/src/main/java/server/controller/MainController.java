package server.controller;

import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.context.WebApplicationContext;
import processgrammar.GrammarProcessor;
import processgrammar.parser.RuleObject;

import java.util.*;

@Controller
@RequestMapping
@Scope(WebApplicationContext.SCOPE_SESSION)
public class MainController {
    private HashMap<Integer, ServerController> hashMap = new HashMap<>();
    private Random random = new Random();

    private int seconds = 0;

    @RequestMapping("/initialize_session")
    public ResponseEntity<Integer> initializeSession() {
        Integer sessionId = generateRandomNumber();
        while (this.hashMap.get(sessionId) != null) {
            sessionId = generateRandomNumber();
        }

        ServerController serverController = new ServerController();
        hashMap.put(sessionId, serverController);

        return ResponseEntity.ok(sessionId);
    }

    @RequestMapping("/end_session")
    public String endSession(@RequestBody Integer sessionId) {
        hashMap.remove(sessionId);
        return "index";
    }

    private int generateRandomNumber() {
        return random.nextInt(1000);
    }

    @RequestMapping("/index")
    public String getIndex() {
        return "index";
    }

    @RequestMapping("/analysis")
    public String getAnalysis() {
        return "analysis";
    }

    @RequestMapping("/tree")
    public String getTree() {
        return "tree";
    }

    @RequestMapping("/process_grammar")
    public String processGrammar(@RequestBody GrammarRequest grammarRequest) {
        hashMap.get(grammarRequest.sessionId()).processGrammar(grammarRequest.grammar());
        return "index";
    }

    @RequestMapping("/get_message")
    public ResponseEntity<String> getError(@RequestBody Integer sessionId) {
        return hashMap.get(sessionId).getError();
    }

    @RequestMapping("/first_set")
    public ResponseEntity<String> getFirstSet(@RequestBody Integer sessionId) {
        return hashMap.get(sessionId).getFirstSet();
    }

    @RequestMapping("/follow_set")
    public ResponseEntity<String> getFollowSet(@RequestBody Integer sessionId) {
        return hashMap.get(sessionId).getFollowSet();
    }

    @RequestMapping("/predict_set")
    public ResponseEntity<String> getPredictSet(@RequestBody Integer sessionId) {
        return hashMap.get(sessionId).getPredictSet();
    }

    @RequestMapping("/alphabet")
    public ResponseEntity<String> getAlphabet(@RequestBody Integer sessionId) {
        return hashMap.get(sessionId).getAlphabet();
    }

    @RequestMapping("/get_table")
    public ResponseEntity<String> getTable(@RequestBody Integer sessionId) {
        return hashMap.get(sessionId).getTable();
    }

    @RequestMapping("/is_found_conflict")
    public ResponseEntity<Boolean> isFoundConflict(@RequestBody Integer sessionId) {
        return hashMap.get(sessionId).isFoundConflict();
    }

    @RequestMapping("/parse_tree")
    public ResponseEntity<String> getParseTree(@RequestBody TreeConstructRequest treeConstructRequest) throws Exception {
        return hashMap.get(treeConstructRequest.sessionId()).getParseTree(treeConstructRequest.word());
    }

    @RequestMapping("/parse_tree_message")
    public ResponseEntity<Boolean> getParseTreeMessage(@RequestBody Integer sessionId) throws Exception {
       return hashMap.get(sessionId).getParseTreeMessage();
    }
}

record GrammarRequest(String grammar, Integer sessionId) { }
record TreeConstructRequest(String word, Integer sessionId) { }



