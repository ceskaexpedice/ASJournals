package cz.incad.k5journals.searchapp;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.apache.solr.client.solrj.util.ClientUtils;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author alberto
 */
public class ImgServlet extends HttpServlet {

  public static final Logger LOGGER = Logger.getLogger(Options.class.getName());

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
      response.addHeader("Access-Control-Allow-Origin", "*");
      if (request.getParameter("obalka") != null) {

        String ctx = request.getParameter("ctx");
        String path = InitServlet.CONFIG_DIR + File.separator + ctx + File.separator + "cover.jpeg";
        File f = new File(path);
        if (f.exists()) {
          try (OutputStream out = response.getOutputStream()) {
            // response.setContentType("image/jpeg");
            BufferedImage bi = ImageIO.read(f);

            BufferedImage nbi = new BufferedImage(
                    bi.getWidth(),
                    bi.getHeight(),
                    BufferedImage.TYPE_INT_RGB);

            nbi.createGraphics()
                    .drawImage(bi,
                            0,
                            0,
                            Color.WHITE,
                            null);

            ImageIO.write(nbi, "jpg", out);
          }
        } else {
          getFromUrl(request, response);
        }
      } else {

        getFromUrl(request, response);
      }

    } catch (IOException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
    } catch (JSONException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
    }
  }

  private void getFromUrl(HttpServletRequest request, HttpServletResponse response) throws IOException {

    // Check if uuid is in our index
    Options opts = Options.getInstance();
    String pid = request.getParameter("uuid");
    try (SolrClient solr = new HttpSolrClient.Builder(String.format("%s%s",
            opts.getString("solr.host", "http://localhost:8983/solr/"),
            "journal")).build()) {
      String q = "pid:\"" + pid + "\"";
      long num = solr.query(new SolrQuery(q)).getResults().getNumFound();
      if (num == 0) {
        LOGGER.log(Level.WARNING, "Not in index {0}", pid);
        return;
      }
    } catch (SolrServerException | IOException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
      return;
    }
 
    //response.addHeader("Access-Control-Allow-Origin", "http://localhost:4200");
    response.addHeader("Access-Control-Allow-Methods", "GET, POST");
    response.addHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    String imgPoint;

    String thumb = request.getParameter("thumb");
    if ("k7".equals(request.getParameter("kramerius_version"))) {
      imgPoint = opts.getString("api.point.k7")
              + "/items/" + pid + "/image";
      if (thumb != null) {
        imgPoint += "/thumb";
      }
    } else {
      imgPoint = opts.getString("img.point");
      imgPoint += "?uuid=" + pid;
      if (thumb != null) {
        imgPoint += "&stream=IMG_THUMB&action=SCALE&scaledHeight=140";
      } else {
        imgPoint += "&stream=IMG_FULL&action=GETRAW";
      }
    }

    LOGGER.log(Level.FINE, "requesting url {0}", imgPoint);
    Map<String, String> reqProps = new HashMap<>();
    InputStream inputStream = RESTHelper.inputStream(imgPoint, reqProps);
    org.apache.commons.io.IOUtils.copy(inputStream, response.getOutputStream());

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
