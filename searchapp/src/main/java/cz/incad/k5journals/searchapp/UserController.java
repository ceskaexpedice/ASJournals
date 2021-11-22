/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package cz.incad.k5journals.searchapp;

import static cz.incad.k5journals.searchapp.Options.LOGGER;
import java.io.File;
import java.io.IOException;
import java.util.Iterator;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.io.FileUtils;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author alberto
 */
public class LoginController {

  public static JSONObject get(HttpServletRequest req) {
    JSONObject jo = new JSONObject();
    Object session = req.getSession().getAttribute("login");
    if (session != null) {
      return (JSONObject) session;
    } else {
      return null;
    }
  }

  public static void logout(HttpServletRequest req) {
    req.getSession().invalidate();
  }

  public static boolean login(HttpServletRequest req, String user, String pwd, String ctx) {
    try {
      JSONObject jo = new JSONObject();

      File f = new File(InitServlet.CONFIG_DIR + File.separator + "users.json");
      if (f.exists() && f.canRead()) {
        String json = FileUtils.readFileToString(f, "UTF-8");
        JSONObject usersJson = new JSONObject(json);

        if (usersJson.has(user)) {
          JSONObject userJson = usersJson.getJSONObject(user);
          if (userJson.getString("pwd").equals(pwd) && (userJson.getString("ctx").contains(ctx) || userJson.getString("ctx").contains("admin"))) {
            jo.put(user, userJson);
            req.getSession().setAttribute("login", jo);
            return true;
          }
        }
      }
      return false;
    } catch (IOException | JSONException ex) {
      Logger.getLogger(LoginController.class.getName()).log(Level.SEVERE, null, ex);
      return false;
    }
  }
}
