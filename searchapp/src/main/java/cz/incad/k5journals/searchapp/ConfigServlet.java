package cz.incad.k5journals.searchapp;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Iterator;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.FileUtils;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author alberto
 */
public class ConfigServlet extends HttpServlet {

  public static final Logger LOGGER = Logger.getLogger(ConfigServlet.class.getName());

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
    try {

      response.setContentType("application/json;charset=UTF-8");

      if (request.getParameter("reset") != null) {
        Options.resetInstance();
      }
      PrintWriter out = response.getWriter();

      JSONObject js = Options.getInstance().getClientConf();
      js.put("configDir", InitServlet.CONFIG_DIR + File.separator);
      out.print(mergeCustom(request.getPathInfo(), js).toString(2));
    } catch (IOException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
    } catch (JSONException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
    }
  } 

  private JSONObject mergeCustom(String ctx, JSONObject conf) throws IOException {
    JSONObject js = new JSONObject(conf.toString());

    File f = new File(InitServlet.CONFIG_DIR + File.separator + ctx + File.separator + "config.json");
    if (f.exists() && f.canRead()) {
      String json = FileUtils.readFileToString(f, "UTF-8");
      JSONObject customClientConf = new JSONObject(json).getJSONObject("client");
      Iterator keys = customClientConf.keys();
      while (keys.hasNext()) {
        String key = (String) keys.next();
        LOGGER.log(Level.FINE, "key {0} will be overrided", key);
        js.put(key, customClientConf.get(key));
      } 
      String fnmenu = InitServlet.CONFIG_DIR + File.separator + ctx + "menu.json";
      File fmenu = new File(fnmenu);
      if (fmenu.exists()) {
        JSONObject layout = new JSONObject(FileUtils.readFileToString(fmenu, "UTF-8"));
        js.put("layout", layout);
      } else {
        LOGGER.log(Level.WARNING, "Menu doesn't exists {0}", fnmenu);
      }

    }
    return js;
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
