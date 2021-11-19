/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package cz.incad.k5journals.searchapp;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.FileUtils;
import org.apache.solr.common.SolrInputDocument;
import org.json.JSONObject;

/**
 *
 * @author alberto
 */
public class IndexServlet extends HttpServlet {

  public static final Logger LOGGER = Logger.getLogger(IndexServlet.class.getName());
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
  protected void processRequest(HttpServletRequest req, HttpServletResponse resp)
          throws ServletException, IOException {
    try {

      String actionNameParam = req.getParameter(ACTION_NAME);
      if (actionNameParam != null) {
        
        Actions actionToDo = Actions.valueOf(actionNameParam.toUpperCase());
        actionToDo.doPerform(req, resp);
        
          
      } else {
        PrintWriter out = resp.getWriter();
        out.print("Action missing");
      }
    } catch (IOException e1) {
      LOGGER.log(Level.SEVERE, e1.getMessage(), e1);
      resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e1.toString());
      PrintWriter out = resp.getWriter();
      out.print(e1.toString());
    } catch (SecurityException e1) {
      LOGGER.log(Level.SEVERE, e1.getMessage(), e1);
      resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
    } catch (Exception e1) {
      LOGGER.log(Level.SEVERE, e1.getMessage(), e1);
      resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      PrintWriter out = resp.getWriter();
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e1.toString());
      out.print(e1.toString());
    }

  }

  enum Actions {
    SET_VIEW {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

        resp.setContentType("application/json;charset=UTF-8");

        PrintWriter out = resp.getWriter();
        JSONObject json = new JSONObject();
        try {

          Indexer indexer = new Indexer();
          String pid = req.getParameter("pid");
          indexer.setView(pid);

        } catch (Exception ex) {
            LOGGER.log(Level.SEVERE, null, ex);
          json.put("error", ex.toString());
        }
        out.println(json.toString(2));
      }
    },
    INDEX_DEEP {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

        resp.setContentType("application/json;charset=UTF-8");

        PrintWriter out = resp.getWriter();
        JSONObject json = new JSONObject();
        try {

          Indexer indexer = new Indexer();
          for(String pid : req.getParameterValues("pid")){
            json.put(pid, indexer.indexDeep(pid));
          }
          //indexer.indexPidAndChildren(req.getParameter("pid"));

        } catch (Exception ex) {
            LOGGER.log(Level.SEVERE, null, ex);
          json.put("error", ex.toString());
        }
        out.println(json.toString(2));
      }
    },
    INDEX_PID {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        JSONObject json = new JSONObject();
        try {

          Indexer indexer = new Indexer();
          String pid = req.getParameter("pid");
          indexer.indexPid(pid, indexer.getIdx(pid, false));
          //out.println(indexer.getModsToJson(request.getParameter("pid")).toString(2));

        } catch (Exception ex) {
          json.put("error", ex.toString());
        }
        out.println(json.toString(2));
      }
    },
    DELETE_PID {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        JSONObject json = new JSONObject();
        try {

          Indexer indexer = new Indexer();
          String pid = req.getParameter("pid");
          json = indexer.deletePidAndChildren(pid);

        } catch (Exception ex) {
          json.put("error", ex.toString());
        }
        out.println(json.toString(2));
      }
    },
    MODS {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

        resp.setContentType("application/json;charset=UTF-8");

        PrintWriter out = resp.getWriter();
        JSONObject json = new JSONObject();
        try {

          Indexer indexer = new Indexer();
          out.println(indexer.getModsToJson(req.getParameter("pid")).toString(2));

        } catch (Exception ex) {
          out.println(json.put("error", ex).toString(2));
        }
      }
    },
    CREATE_DOC {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

        resp.setContentType("application/json;charset=UTF-8");

        PrintWriter out = resp.getWriter();
        JSONObject json = new JSONObject();
        try {

          Indexer indexer = new Indexer();
          SolrInputDocument idoc = indexer.createSolrDoc(req.getParameter("pid"), 0);
          if(req.getParameter("field") != null){
            for(Object o : idoc.getFieldValues(req.getParameter("field"))){
            out.println(o);
            }
          } else {
            out.println(idoc);
          }
          

        } catch (Exception ex) {
          out.println(json.put("error", ex).toString(2));
        }
      }
    },
    SAVE_MAGAZINE {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        JSONObject json = new JSONObject();
        try {

          Indexer indexer = new Indexer();
          JSONObject jo = new JSONObject(req.getParameter("mag"));
          json.put("saved", indexer.indexMagazine(jo));

        } catch (Exception ex) {
          json.put("error", ex.toString());
        }
        out.println(json.toString(2));
      }
    },
    DELETE_MAGAZINE {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        JSONObject json = new JSONObject();
        try {

          Indexer indexer = new Indexer();
          json.put("saved", indexer.deleteMagazine(req.getParameter("ctx")));

        } catch (Exception ex) {
          json.put("error", ex.toString()); 
        }
        out.println(json.toString(2));
      }
    },
    DELETE_EDITOR {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        JSONObject json = new JSONObject();
        try {

          Indexer indexer = new Indexer();
          json.put("saved", indexer.deleteEditor(req.getParameter("id")));

        } catch (Exception ex) {
          json.put("error", ex.toString());
        }
        out.println(json.toString(2));
      }
    },
    SAVE_EDITOR {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        JSONObject json = new JSONObject();
        try {

          Indexer indexer = new Indexer();
          JSONObject jo = new JSONObject(req.getParameter("editor"));
          json.put("saved", indexer.indexEditor(jo));

        } catch (Exception ex) {
          json.put("error", ex.toString());
        }
        out.println(json.toString(2));
      }
    },
    CITATION {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

        resp.setContentType("text/plain;charset=UTF-8");
        Options opts = Options.getInstance();
        String url = opts.getString("citation_server", "http://citace.rychtar.cloud/v1/kramerius?format=html&url=https://kramerius.lib.cas.cz&uuid=") +
                req.getParameter("uuid");
        
        InputStream inputStream = RESTHelper.inputStream(url);
        org.apache.commons.io.IOUtils.copy(inputStream, resp.getOutputStream());
      }
    };
    
    

    abstract void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception;
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
