/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package cz.incad.k5journals.searchapp;

import static cz.incad.k5journals.searchapp.SearchServlet.LOGGER;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.http.HttpServletRequest;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.Http2SolrClient;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.apache.solr.client.solrj.impl.NoOpResponseParser;
import org.apache.solr.client.solrj.request.QueryRequest;
import org.apache.solr.common.util.NamedList;
import org.json.JSONObject;

/**
 *
 * @author alber
 */
public class Searcher {

    static final Logger LOGGER = Logger.getLogger(Searcher.class.getName());

    public static JSONObject json(SolrQuery query, HttpSolrClient client, String core) {
        query.set("wt", "json");
        String qt = query.get("qt");
        String jsonResponse;
        try {
            QueryRequest qreq = new QueryRequest(query);
            if (qt != null) {
                qreq.setPath(qt);
            }
            NoOpResponseParser dontMessWithSolr = new NoOpResponseParser();
            dontMessWithSolr.setWriterType("json");
            client.setParser(dontMessWithSolr);
            NamedList<Object> qresp = client.request(qreq, core);
            jsonResponse = (String) qresp.get("response");
            return new JSONObject(jsonResponse);
        } catch (Exception ex) {
            LOGGER.log(Level.SEVERE, null, ex);
            return new JSONObject().put("error", ex);
        }
    }

    public static JSONObject fromQuery(HttpServletRequest request) {
        JSONObject json = new JSONObject();
        try {
            Options opts = Options.getInstance();
            int handlerIdx = request.getRequestURI().lastIndexOf("/") + 1;
            int solrIdx = request.getRequestURI().indexOf("/search/") + 8;
            String handler = request.getRequestURI().substring(handlerIdx);
            String core = request.getRequestURI().substring(solrIdx, handlerIdx);

            String solrhost = opts.getString("solr.host", "http://localhost:8983/solr/")
                    + core + handler + "?" + request.getQueryString();

            LOGGER.log(Level.FINE, "requesting url {0}", solrhost);
            Map<String, String> reqProps = new HashMap<>();
            reqProps.put("Content-Type", "application/json");
            reqProps.put("Accept", "application/json");
            InputStream inputStream = RESTHelper.inputStream(solrhost, reqProps);
            return new JSONObject(org.apache.commons.io.IOUtils.toString(inputStream, "UTF-8"));
        } catch (Exception ex) {
            LOGGER.log(Level.SEVERE, null, ex);
            json.put("error", ex);
        }
        return json;
    }

    public static JSONObject getMagazines(HttpServletRequest request) {
        JSONObject json = new JSONObject();
        try (HttpSolrClient client = new HttpSolrClient.Builder(Options.getInstance().getString("solr.host")).build()) {
            SolrQuery query = new SolrQuery("*")
                    .setRows(50)
                    .setSort("titleCS", SolrQuery.ORDER.asc)
                    .setFacet(true)
                    .setFacetMinCount(1)
                    .addFacetField("pristup", "oblast", "{!ex=keywords}keywords", "vydavatel")
                    .setParam("json.nl", "arrarr");

            if (request.getParameter("sortDir") != null) {
                query.setSort("titleCS", SolrQuery.ORDER.valueOf(request.getParameter("sortDir")));
            }

//            if (request.getParameter("fq") != null) {
//                for (String fq : request.getParameterValues("fq")) {
//                    query.addFilterQuery(fq);
//                }
//            }
            
            if (request.getParameter("keywords") != null) {
                for (String fq : request.getParameterValues("keywords")) {
                    query.addFilterQuery("{!tag=keywords}keywords:\"" + fq + "\"");
                }
            }
            
            if (request.getParameter("oblast") != null) {
                for (String fq : request.getParameterValues("oblast")) {
                    query.addFilterQuery("{!tag=oblast}oblast:\"" + fq + "\"");
                }
            }

            json = json(query, client, "magazines");

        } catch (Exception ex) {
            LOGGER.log(Level.SEVERE, null, ex);
            json.put("error", ex);
        }
        return json;
    }

    public static JSONObject getEditors(HttpServletRequest request) {
        JSONObject json = new JSONObject();
        try (HttpSolrClient client = new HttpSolrClient.Builder(Options.getInstance().getString("solr.host")).build()) {
            SolrQuery query = new SolrQuery("*")
                    .setRows(50)
                    .setSort("id", SolrQuery.ORDER.asc)
                    .setFacet(true)
                    .setFacetMinCount(1)
                    .addFacetField("typ")
                    .setParam("json.nl", "arrntv");

            if (request.getParameter("sortDir") != null) {
                query.setSort("id ", SolrQuery.ORDER.valueOf(request.getParameter("sortDir")));
            }
            if (request.getParameter("fq") != null) {
                for (String fq : request.getParameterValues("fq")) {
                    query.addFilterQuery(fq);
                }
            }

            json = json(query, client, "editors");

        } catch (Exception ex) {
            LOGGER.log(Level.SEVERE, null, ex);
            json.put("error", ex);
        }
        return json;
    }

    public static JSONObject getByPid(HttpServletRequest request) {
        JSONObject json = new JSONObject();
        try  {
            JSONObject doc = getByPid(request.getParameter("pid"));
            if (doc != null) {
                json.put("doc", doc);
                if (Boolean.parseBoolean(request.getParameter("withParent"))) {
                    json.put("parent", new JSONObject());
                    String parentPid = doc.getJSONArray("parents").getString(0);
                    JSONObject parentDoc = json.getJSONObject("parent");
                    while (parentPid != null && !parentPid.isBlank()) {
                        JSONObject pdoc = getByPid(parentPid);
                        parentDoc.put("doc", pdoc);
                        parentPid = null;
                        if (pdoc.has("parents")) {
                            parentPid = pdoc.getJSONArray("parents").getString(0);
                            parentDoc.put("parent", new JSONObject());
                        }
                        parentDoc = parentDoc.getJSONObject("parent");
                    }
                }
            } 
        } catch (Exception ex) {
            LOGGER.log(Level.SEVERE, null, ex);
            json.put("error", ex);
        }
        return json;
    }
    
    public static JSONObject getByPid(String pid) {
        JSONObject json = new JSONObject();
        try (HttpSolrClient client = new HttpSolrClient.Builder(Options.getInstance().getString("solr.host")).build()) {
            SolrQuery query = new SolrQuery("pid:\""+pid+"\"")
                    .setFields("*,mods:[json],autor_full:[json]")
                    .setRows(1);

            JSONObject doc = json(query, client, "journal");
            if (doc.getJSONObject("response").getInt("numFound") > 0) {
                json = doc.getJSONObject("response").getJSONArray("docs").getJSONObject(0);
            } else {
                return null;
            }

        } catch (Exception ex) {
            LOGGER.log(Level.SEVERE, null, ex);
            return null;
        }
        return json;
    }
    
}
