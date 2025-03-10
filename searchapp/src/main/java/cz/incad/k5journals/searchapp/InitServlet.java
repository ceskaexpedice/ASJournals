package cz.incad.k5journals.searchapp;

import java.io.File;
import java.io.IOException;
import java.util.Timer;
import java.util.TimerTask;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONException;

/**
 *
 * @author alberto
 */
public class InitServlet extends HttpServlet {

    public static final Logger LOGGER = Logger.getLogger(InitServlet.class.getName());

    //Directory where cant override configuration  
    public static final String APP_DIR_KEY = "k5journals_app_dir";

    //Directory where cant override configuration  
    public static String CONFIG_DIR = ".k5journals";

    //Default config directory in webapp
    public static String DEFAULT_CONFIG_DIR = "/assets";

    //Default configuration file 
    public static String DEFAULT_CONFIG_FILE = "config.json";

    //Default config directory in webapp
    public static String DEFAULT_I18N_DIR = "/assets/i18n";

    Timer timer;

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

    }

    @Override
    public void init() throws ServletException {

        if (getServletContext().getInitParameter("def_config_dir") != null) {
            DEFAULT_CONFIG_DIR = getServletContext().getInitParameter("def_config_dir");
        }

        DEFAULT_CONFIG_FILE = getServletContext().getRealPath(DEFAULT_CONFIG_DIR) + File.separator + DEFAULT_CONFIG_FILE;
        //System.out.println("-----> " + DEFAULT_CONFIG_FILE);
        DEFAULT_I18N_DIR = getServletContext().getRealPath(DEFAULT_I18N_DIR);

        if (System.getProperty(APP_DIR_KEY) != null) {
            CONFIG_DIR = System.getProperty(APP_DIR_KEY);
        } else if (getServletContext().getInitParameter("app_dir") != null) {
            CONFIG_DIR = getServletContext().getInitParameter("app_dir");
        } else {
            CONFIG_DIR = System.getProperty("user.home") + File.separator + CONFIG_DIR;
        }
        LOGGER.log(Level.INFO, "app dir is {0}", CONFIG_DIR);

        try {
            // Set timer for update
            if (Options.getInstance().getBoolean("auto_update", false)) {
                TimerTask task = new UpdaterTask();
                timer = new Timer("Timer");

                long delay = 1000L;
                long period = 1000L * 60L * 60L * 24L; // jednou denne
                timer.scheduleAtFixedRate(task, delay, period);
            }
        } catch (Exception ex) {
            Logger.getLogger(InitServlet.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    @Override
    public void destroy() {
        if (timer != null) {
            timer.cancel();
        }
        super.destroy(); //To change body of generated methods, choose Tools | Templates.

    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
