import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.RoundRectangle2D;
import java.awt.image.BufferedImage;
import java.io.File;
import javax.imageio.ImageIO;

public class GenerateSplash {
    public static void main(String[] args) throws Exception {
        File iconFile = new File("c:/Users/DELL/Downloads/go_game (2)/play_store_icon_512.png");
        if (!iconFile.exists()) {
            System.out.println("Icon not found: " + iconFile.getAbsolutePath());
            return;
        }
        BufferedImage iconImg = ImageIO.read(iconFile);

        String baseDir = "c:/Users/DELL/Downloads/go_game (2)/android/app/src/main/res";
        String[] dirs = {
            "drawable",
            "drawable-port-hdpi", "drawable-port-mdpi", "drawable-port-xhdpi", "drawable-port-xxhdpi", "drawable-port-xxxhdpi",
            "drawable-land-hdpi", "drawable-land-mdpi", "drawable-land-xhdpi", "drawable-land-xxhdpi", "drawable-land-xxxhdpi"
        };

        int splashSize = 512;
        BufferedImage splashImg = new BufferedImage(splashSize, splashSize, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = splashImg.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Fill dark background #1b1712
        g2d.setColor(new Color(0x1b, 0x17, 0x12));
        g2d.fillRect(0, 0, splashSize, splashSize);

        // Draw centered icon rounded
        int iconSize = 240;
        int x = (splashSize - iconSize) / 2;
        int y = (splashSize - iconSize) / 2;

        // Clip rounded rectangle for icon
        Graphics2D gIcon = (Graphics2D) g2d.create();
        RoundRectangle2D roundRect = new RoundRectangle2D.Float(x, y, iconSize, iconSize, 48, 48);
        gIcon.setClip(roundRect);
        gIcon.drawImage(iconImg, x, y, iconSize, iconSize, null);
        gIcon.dispose();

        g2d.dispose();

        for (String dir : dirs) {
            File outDir = new File(baseDir + "/" + dir);
            if (!outDir.exists()) outDir.mkdirs();
            File outFile = new File(outDir, "splash.png");
            ImageIO.write(splashImg, "png", outFile);
            System.out.println("Generated splash.png for " + dir);
        }
    }
}
