import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.File;
import javax.imageio.ImageIO;

public class ResizeIcon {
    public static void main(String[] args) throws Exception {
        File srcFile = new File("c:/Users/DELL/Downloads/go_game (2)/play_store_icon_512.png");
        if (!srcFile.exists()) {
            srcFile = new File("c:/Users/DELL/Downloads/go_game (2)/go_game/app_icon.png");
        }
        String baseDir = "c:/Users/DELL/Downloads/go_game (2)/android/app/src/main/res";
        
        BufferedImage srcImg = ImageIO.read(srcFile);
        if (srcImg == null) {
            System.out.println("Could not read source image!");
            System.exit(1);
        }
        
        int[] sizes = {48, 72, 96, 144, 192};
        String[] dirs = {"mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi"};
        
        for (int i = 0; i < sizes.length; i++) {
            int size = sizes[i];
            String dir = dirs[i];
            
            BufferedImage outImg = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g2d = outImg.createGraphics();
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2d.drawImage(srcImg, 0, 0, size, size, null);
            g2d.dispose();
            
            File out1 = new File(baseDir + "/" + dir + "/ic_launcher.png");
            File out2 = new File(baseDir + "/" + dir + "/ic_launcher_round.png");
            File out3 = new File(baseDir + "/" + dir + "/ic_launcher_foreground.png");
            
            ImageIO.write(outImg, "png", out1);
            ImageIO.write(outImg, "png", out2);
            ImageIO.write(outImg, "png", out3);
            System.out.println("Generated " + dir);
        }

        // Generate 512x512 Store Icon for Play Store Console
        int storeSize = 512;
        BufferedImage storeImg = new BufferedImage(storeSize, storeSize, BufferedImage.TYPE_INT_ARGB);
        Graphics2D gStore = storeImg.createGraphics();
        gStore.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        gStore.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        gStore.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        gStore.drawImage(srcImg, 0, 0, storeSize, storeSize, null);
        gStore.dispose();

        File playStoreIcon = new File("c:/Users/DELL/Downloads/go_game (2)/play_store_icon_512.png");
        ImageIO.write(storeImg, "png", playStoreIcon);
        System.out.println("Generated Play Store 512x512 icon at: " + playStoreIcon.getAbsolutePath());
    }
}

