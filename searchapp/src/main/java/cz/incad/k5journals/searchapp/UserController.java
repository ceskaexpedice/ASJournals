/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package cz.incad.k5journals.searchapp;

import java.io.File;
import java.io.IOException;
import java.math.BigInteger;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.apache.solr.client.solrj.util.ClientUtils;
import org.apache.solr.common.SolrDocumentList;
import org.apache.solr.common.SolrInputDocument;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author alberto
 */
public class UserController {

  public static final Logger LOGGER = Logger.getLogger(UserController.class.getName());

  public static JSONObject get(HttpServletRequest req) {
    JSONObject jo = new JSONObject();
    Object session = req.getSession().getAttribute("login");
    if (session != null) {
      return (JSONObject) session;
    } else {
      return null;
    }
  }

  public static String hashPassword(String password, String salt) {
    char[] passwordChars = password.toCharArray();
    byte[] saltBytes = salt.getBytes();
    PBEKeySpec spec = new PBEKeySpec(passwordChars, saltBytes, 1000, 192);
    try {
      SecretKeyFactory key = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA512");
      byte[] hashedPassword = key.generateSecret(spec).getEncoded();
      return String.format("%x", new BigInteger(hashedPassword));
    } catch (Exception var7) {
      throw new RuntimeException(var7);
    }
  }

  public static void logout(HttpServletRequest req) {
    req.getSession().invalidate();
  }

  public static JSONObject login(HttpServletRequest req) {

    JSONObject ret = new JSONObject();
    try (SolrClient solr = new HttpSolrClient.Builder(Options.getInstance().getString("solr.host", "http://localhost:8983/solr/")).build()) {

      JSONObject inputJs;
      String username;
      String pwd;
      if (req.getMethod().equals("POST")) {
        inputJs = new JSONObject(IOUtils.toString(req.getInputStream(), "UTF-8"));
        username = inputJs.getString("user");
        pwd = inputJs.getString("pwd");
      } else {
        username = req.getParameter("user");
        pwd = req.getParameter("pwd");
      }

      SolrQuery q = new SolrQuery("username:\"" + ClientUtils.escapeQueryChars(username) + "\"")
              .addFilterQuery("pwd:\"" + ClientUtils.escapeQueryChars(hashPassword(pwd, username)) + "\"")
              .setFields("name, username, ctxs, isAdmin");
      SolrDocumentList docs = solr.query("users", q).getResults();
      solr.close();
      if (docs.getNumFound() > 0) {
        ret = new JSONObject(docs.get(0).toMap(new HashMap<String, Object>()));
        ret.put("logged", true);
        req.getSession().setAttribute("login", ret);
      } else {
        ret.put("logged", false);
        ret.put("error", "invalid user name or password");
      }
    } catch (SolrServerException | IOException ex) {
      ret.put("error", ex);
      ret.put("logged", false);
      LOGGER.log(Level.SEVERE, null, ex);
    }
    return ret;
  }

  public static JSONObject resetPwd(HttpServletRequest req) {

    JSONObject ret = new JSONObject();
    JSONObject user = get(req);
    if (user == null) {
      ret.put("logged", false);
      ret.put("error", "not logged");
      return ret;
    }
    if (!user.optBoolean("isAdmin")) {
      ret.put("error", "not autorized");
      return ret;
    }
    try (SolrClient solr = new HttpSolrClient.Builder(Options.getInstance().getString("solr.host", "http://localhost:8983/solr/")).build()) {

      JSONObject inputJs;
      String username;
      String pwd;
      if (req.getMethod().equals("POST")) {
        inputJs = new JSONObject(IOUtils.toString(req.getInputStream(), "UTF-8"));
        username = inputJs.getString("user");
        pwd = inputJs.getString("pwd");
      } else {
        username = req.getParameter("user");
        pwd = req.getParameter("pwd");
      }

      SolrInputDocument idoc = new SolrInputDocument();
      idoc.setField("username", username);
      Map<String, String> newPwd = new HashMap<>();
      newPwd.put("set", hashPassword(pwd, username));
      idoc.setField("pwd", newPwd);
      solr.add("users", idoc);
      solr.commit("users");
      solr.close();

    } catch (SolrServerException | IOException ex) {
      ret.put("error", ex);
      ret.put("logged", false);
      LOGGER.log(Level.SEVERE, null, ex);
    }
    return ret;
  }
}
