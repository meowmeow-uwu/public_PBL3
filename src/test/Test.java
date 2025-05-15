import com.pbl3.util.JwtUtil;

public class Test {
    public static void main(String[] args) {
        String token = "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3NDczNTUzMzV9.m7UQYKoekcai-4IbkmbuKBmnwc-OrSg-grxPouc0R-OAmTiS1PHm6E-sJFZibZW_A25IcqqWVDupzGH5fRT4Ew";
        System.out.println(token);
        System.out.println(JwtUtil.validateToken(token));
        System.out.println(JwtUtil.getUserIdFromToken(token));
    }
}
