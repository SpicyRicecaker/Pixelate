import javax.swing.*;
import java.awt.*;

public class Pixelate {
    double scaling_Numerator = 3;
    double scaling_Denominator = 4;
    Dimension defaultScreenSize;
    Dimension screenSize;
    int width;
    int height;
    //Window
    JFrame frame;
    //Panel for previewing png
    PixelatePanel panel;
    //Left side of preview, should accept dragging of files
    Container left_Side_C;
    //Has a place to drag or browse files
    Container find_File_C;
    JButton find_File_Button;
    //Displaying file info
    JLabel file_Info_Label;
    //Right side of preview, should have resolution, !pixelate!, and write to file
    Container right_Side_C;
    JLabel current_Resolution_Label;
    String[] resolutions;
    JComboBox<String> desired_Resolution_Box;
    JSlider pixelation_Slider;
    JButton save_As_Button;
    public Pixelate() {
        //Sets resolution based on current scaling and desktop resolution
        recalculate_Resolution();
        //Initiates all elements inside the window (panel, buttons, text)
        init_Window_Elements();
        //Configures window frame
        init_Frame();
        //Connects elements together
        init_Layouts();

        frame.pack();
        frame.setVisible(true);
    }

    private void init_Frame() {
        frame.setSize(screenSize);
        frame.setPreferredSize(screenSize);
        frame.setMinimumSize(screenSize);
        frame.setMaximumSize(screenSize);

        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setLocationRelativeTo(null);

        //Remaining cleanup for window
        //frame.pack();
    }

    public void init_Layouts() {
        //Makes the window a border layout
        frame.setLayout(new BorderLayout());

        //Adds panel to the center
        frame.add(panel, BorderLayout.CENTER);
        //Adds left side
        frame.add(left_Side_C, BorderLayout.WEST);
        //Adds right side
        frame.add(right_Side_C, BorderLayout.EAST);

        //Sets the left side layout from top to bottom
        left_Side_C.setLayout(new GridLayout(2,0));
        //Adds load file area
        left_Side_C.add(find_File_C);
        find_File_C.setLayout(new GridLayout(1, 0));
        //Adds find file button to the load file area
        find_File_C.add(find_File_Button);
        //Adds File details under the load file area
        left_Side_C.add(file_Info_Label);

        //Sets the right side layout from top to bottom
        right_Side_C.setLayout(new GridLayout(4,0));
        //Adds current resolution information
        right_Side_C.add(current_Resolution_Label);
        //Adds desired resolution drop down
        right_Side_C.add(desired_Resolution_Box);
        //Adds pixelation slider
        right_Side_C.add(pixelation_Slider);
        //Adds save as button
        right_Side_C.add(save_As_Button);
    }

    public void recalculate_Resolution() {
        defaultScreenSize = Toolkit.getDefaultToolkit().getScreenSize();
        screenSize = new Dimension((int)(scaling_Numerator/scaling_Denominator*defaultScreenSize.getWidth()), (int)(scaling_Numerator/scaling_Denominator*defaultScreenSize.getHeight()));
        width = (int) screenSize.getWidth();
        height = (int) screenSize.getHeight();
    }

    public void init_Window_Elements() {
        //Window
        frame = new JFrame("Pixelate");
        //Panel for previewing png
        panel = new PixelatePanel();

        //Left side of preview, should accept dragging of files
        left_Side_C = new Container();
        //Has a place to drag or browse files
        find_File_C = new Container();
        find_File_Button = new JButton("Load File");
        //Displaying file info
        file_Info_Label = new JLabel("N/A");

        //Right side of preview, should have resolution, !pixelate!, and write to file
        right_Side_C = new Container();
        current_Resolution_Label = new JLabel("N/A");
        init_resolution_Box();
        init_pixelation_Slider();
        save_As_Button = new JButton("Save as");
    }

    public void init_pixelation_Slider() {
        int pixelation_min = 1;
        int pixelation_max = 50;
        int pixelation_init = 2;
        pixelation_Slider = new JSlider(JSlider.HORIZONTAL, pixelation_min, pixelation_max, pixelation_init);
        //Turn on labels at major tick marks.
        pixelation_Slider.setMajorTickSpacing(10);
        pixelation_Slider.setMinorTickSpacing(1);
        pixelation_Slider.setPaintTicks(true);
        pixelation_Slider.setPaintLabels(true);    }

    public void init_resolution_Box() {
        resolutions = new String[] {"1366x768", "1920x1080", "2560x1440", "3840x2160", "custom"};
        desired_Resolution_Box = new JComboBox<>(resolutions);
        desired_Resolution_Box.setSelectedIndex(3);
    }

    public static void main(String[] args) {
        new Pixelate();
    }
}
