package cz.incad.k5journals.searchapp;

import static cz.incad.k5journals.searchapp.ConfigServlet.LOGGER;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.Charset;
import java.util.Iterator;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 *
 * @author alberto
 */
public class TextsServlet extends HttpServlet {

  public static final Logger LOGGER = Logger.getLogger(TextsServlet.class.getName());
  public static final String ACTION_NAME = "action";

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

      String actionNameParam = request.getParameter(ACTION_NAME);
      if (actionNameParam != null) {

        Actions actionToDo = Actions.valueOf(actionNameParam.toUpperCase());
        actionToDo.doPerform(request, response);

      } else {

        Actions actionToDo = Actions.valueOf("LOAD");
        actionToDo.doPerform(request, response);
//        PrintWriter out = response.getWriter();
//        out.print("Action missing");
      }
    } catch (IOException e1) {
      LOGGER.log(Level.SEVERE, e1.getMessage(), e1);
      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e1.toString());
      PrintWriter out = response.getWriter();
      out.print(e1.toString());
    } catch (SecurityException e1) {
      LOGGER.log(Level.SEVERE, e1.getMessage(), e1);
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
    } catch (Exception e1) {
      LOGGER.log(Level.SEVERE, e1.getMessage(), e1);
      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      PrintWriter out = response.getWriter();
      response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e1.toString());
      out.print(e1.toString());
    }

  }

  enum Actions {

    LOAD {
      @Override
      void doPerform(HttpServletRequest request, HttpServletResponse response) throws Exception {

        response.setContentType("text/html;charset=UTF-8");
        String lang = request.getParameter("lang");
        String ctx = request.getParameter("ctx");
        String filename = InitServlet.CONFIG_DIR + File.separator + ctx + File.separator + "texts"
                + File.separator + request.getParameter("id");
        File f;
        if (lang != null) {
          f = new File(filename + "_" + lang + ".html");
          if (f.exists()) {
            FileUtils.copyFile(f, response.getOutputStream());
          } else {
            f = new File(filename + ".html");
            if (f.exists()) {
              FileUtils.copyFile(f, response.getOutputStream());
            } else {
              response.getWriter().println("Page not found (error 404)");
            }
          }
        } else {
          f = new File(filename + ".html");
          if (f.exists()) {
            FileUtils.copyFile(f, response.getOutputStream());
          } else {
            response.getWriter().println("Text not found in <h1>" + filename + ".html</h1>");
          }
        }
      }
    },
    SAVE {
      @Override
      void doPerform(HttpServletRequest request, HttpServletResponse response) throws Exception {

        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        JSONObject json = new JSONObject();

        String id = request.getParameter("id");
        String lang = request.getParameter("lang");
        String ctx = request.getParameter("ctx");
        String filename = InitServlet.CONFIG_DIR + File.separator + ctx + File.separator + "texts"
                + File.separator + id;
        File f;
        
        JSONObject body = new JSONObject(IOUtils.toString(request.getInputStream(), "UTF-8"));
        
        // JSONObject body = new JSONObject(request.getReader().lines().collect(Collectors.joining(System.lineSeparator())));
        
        String text = body.getString("text");

        if (lang != null) {
          f = new File(filename + "_" + lang + ".html");
          FileUtils.writeStringToFile(f, text, Charset.forName("UTF-8"));
        } else {
          f = new File(filename + ".html");
          FileUtils.writeStringToFile(f, text, Charset.forName("UTF-8"));
        }

        // LOGGER.log(Level.INFO, "menu is " + menu);
        if (body.has("menu")) {
          String fnmenu = InitServlet.CONFIG_DIR + File.separator + ctx + File.separator + "menu.json";
          File fmenu = new File(fnmenu);
          FileUtils.writeStringToFile(fmenu, body.getString("menu"), Charset.forName("UTF-8"));
          Options.resetInstance();
        }

        LOGGER.log(Level.INFO, json.toString());
        out.println(json.toString(2));
      }
    },
    SAVE_MENU {
      @Override
      void doPerform(HttpServletRequest request, HttpServletResponse response) throws Exception {

        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        JSONObject json = new JSONObject();

        String ctx = request.getParameter("ctx");

        String menu = request.getParameter("menu");

        LOGGER.log(Level.FINE, "menu is " + menu);
        if (menu != null) {
          String fnmenu = InitServlet.CONFIG_DIR + File.separator + ctx + File.separator + "menu.json";
          File fmenu = new File(fnmenu);
          FileUtils.writeStringToFile(fmenu, menu, Charset.forName("UTF-8"));
          Options.resetInstance();
        }

        LOGGER.log(Level.FINE, json.toString());
        out.println(json.toString(2));
      }
    },
    ADD_JOURNAL {
      @Override
      void doPerform(HttpServletRequest request, HttpServletResponse response) throws Exception {

        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        JSONObject json = new JSONObject();

        String cfg = request.getParameter("cfg");
        String journals = request.getParameter("journals");
        String ctx = request.getParameter("ctx");

        String fnmenu = InitServlet.CONFIG_DIR + File.separator + "journals.json";
        File f = new File(fnmenu);
        FileUtils.writeStringToFile(f, journals, Charset.forName("UTF-8"));

        File fctx = new File(InitServlet.CONFIG_DIR + File.separator + ctx + File.separator + "config.json");
        FileUtils.writeStringToFile(fctx, cfg, Charset.forName("UTF-8"));

        out.println(json.toString(2));
      }
    },
    SAVE_JOURNALS {
      @Override
      void doPerform(HttpServletRequest request, HttpServletResponse response) throws Exception {

        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        JSONObject json = new JSONObject();

        String cfg = request.getParameter("cfg");
        String journals = request.getParameter("journals");
        String ctx = request.getParameter("ctx");

        String fnmenu = InitServlet.CONFIG_DIR + File.separator + "journals.json";
        File f = new File(fnmenu);
        FileUtils.writeStringToFile(f, journals, Charset.forName("UTF-8"));

        File fctx = new File(InitServlet.CONFIG_DIR + File.separator + ctx + File.separator + "config.json");
        FileUtils.writeStringToFile(fctx, cfg, Charset.forName("UTF-8"));

        out.println(json.toString(2));
      }
    },
    GET_JOURNALS {
      @Override
      void doPerform(HttpServletRequest request, HttpServletResponse response) throws Exception {

        response.setContentType("application/json;charset=UTF-8");

        String fnmenu = InitServlet.CONFIG_DIR + File.separator + "journals.json";
        File f = new File(fnmenu);
        FileUtils.copyFile(f, response.getOutputStream());
      }
    },
    GET_CONFIG {
      @Override
      void doPerform(HttpServletRequest request, HttpServletResponse response) throws Exception {

        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        String ctx = request.getParameter("ctx");
        JSONObject conf = Options.getInstance().getClientConf();

        JSONObject js = new JSONObject(conf.toString()); 

        File f = new File(InitServlet.CONFIG_DIR + File.separator + ctx + File.separator + "config.json");

        if (f.exists() && f.canRead()) {
          String json = FileUtils.readFileToString(f, "UTF-8");
          JSONObject customClientConf = new JSONObject(json);
          Iterator keys = customClientConf.keys();
          while (keys.hasNext()) {
            String key = (String) keys.next();
            LOGGER.log(Level.FINE, "key {0} will be overrided", key);
            js.put(key, customClientConf.get(key));
          }

        }

        String fnmenu = InitServlet.CONFIG_DIR + File.separator + ctx + File.separator + "menu.json";
        File fmenu = new File(fnmenu);
        if (fmenu.exists()) {
          JSONObject layout = new JSONObject(FileUtils.readFileToString(fmenu, "UTF-8"));
          js.put("layout", layout);
        }

        String home = InitServlet.CONFIG_DIR + File.separator + ctx + File.separator + "texts"
                + File.separator + "home_cs.html";
        File fhome = new File(home);
        if (fmenu.exists()) {
          js.put("home", FileUtils.readFileToString(fhome, "UTF-8"));
        }
        
        out.println(js.toString(2));
      }
    }, 
    GET_LAYOUT {
      @Override
      void doPerform(HttpServletRequest request, HttpServletResponse response) throws Exception {

        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        String ctx = request.getParameter("ctx");
        JSONObject js = new JSONObject();

        String fnmenu = InitServlet.CONFIG_DIR + File.separator + ctx + File.separator + "menu.json";
        File fmenu = new File(fnmenu);
        if (fmenu.exists()) {
          js = new JSONObject(FileUtils.readFileToString(fmenu, "UTF-8"));
        }

        String home_cs = InitServlet.CONFIG_DIR + File.separator + ctx + File.separator + "texts"
                + File.separator + "home_cs.html";
        File fhome = new File(home_cs);
        if (fhome.exists()) {
          js.put("home_cs", FileUtils.readFileToString(fhome, "UTF-8"));
        }

        String home_en = InitServlet.CONFIG_DIR + File.separator + ctx + File.separator + "texts"
                + File.separator + "home_en.html";
        File fhomeen = new File(home_en);
        if (fhomeen.exists()) {
          js.put("home_en", FileUtils.readFileToString(fhomeen, "UTF-8"));
        }
        
        out.println(js.toString(2));
      }
    };

    abstract void doPerform(HttpServletRequest request, HttpServletResponse response) throws Exception;
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
