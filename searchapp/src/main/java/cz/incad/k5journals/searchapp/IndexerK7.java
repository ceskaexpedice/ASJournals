package cz.incad.k5journals.searchapp;

import cz.incad.FormatUtils;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.nio.charset.UnsupportedCharsetException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.commons.io.FileUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.apache.solr.client.solrj.util.ClientUtils;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.apache.solr.common.SolrInputDocument;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.XML;

/**
 *
 * @author alberto
 */
public class IndexerK7 {
//  https://kramerius-test.lib.cas.cz/search/api/client/v7.0/items/uuid:fc144bf1-8d61-4f4b-80f9-e4a772db32dc/info
//  https://kramerius-test.lib.cas.cz/search/api/client/v7.0/items/uuid:d118a57e-8d42-4744-9b2b-e76484f4df16/info

    static final Logger LOGGER = Logger.getLogger(IndexerK7.class.getName());
    final String apiPointKey = "api.point.k7";
    Options opts;
    File statusFile;
    JSONObject currentStatus = new JSONObject();
    JSONObject langsMap;

    SolrClient client;
    int total;
    JSONObject response = new JSONObject();

    Map<String, Integer> dates = new HashMap();
    Map<String, String> dateIssued = new HashMap();

    public IndexerK7() {
        try {
            opts = Options.getInstance();
            statusFile = new File(InitServlet.CONFIG_DIR + File.separator + "index.json");
            langsMap = opts.getJSONObject("langsMap");
        } catch (IOException ex) {
            LOGGER.log(Level.SEVERE, null, ex);
        } catch (JSONException ex) {
            LOGGER.log(Level.SEVERE, null, ex);
        }
    }

    private SolrClient getClient(String core) {
        SolrClient client = new HttpSolrClient.Builder(String.format("%s%s",
                opts.getString("solr.host", "http://localhost:8983/solr/"),
                core)).build();
        return client;
    }

    public void setView(String pid) {
        try {
            SolrClient client = getClient("views");
            SolrInputDocument idoc = new SolrInputDocument();
            idoc.setField("pid", pid);

            Map<String, Object> fieldModifier = new HashMap<>(1);
            fieldModifier.put("inc", "1");
            idoc.addField("views", fieldModifier);  // add the map as the field value
            client.add(idoc, 10);
            client.commit();
            client.close();
        } catch (IOException | SolrServerException ex) {
            LOGGER.log(Level.SEVERE, null, ex);
        }

    }

    private void writeStatus() {
        try {
            FileUtils.writeStringToFile(statusFile, currentStatus.toString(), "UTF-8");
        } catch (IOException ex) {
            LOGGER.log(Level.SEVERE, null, ex);
        }
    }

    public JSONObject getStatus() {
        try {
            File f = new File(InitServlet.CONFIG_DIR + File.separator + "index.json");
            if (f.exists()) {
                return new JSONObject(FileUtils.readFileToString(f, "UTF-8"));
            } else {
                return new JSONObject();
            }

        } catch (IOException ex) {
            LOGGER.log(Level.SEVERE, null, ex);
            return new JSONObject().put("error", ex);
        }
    }

    /**
     * Index doc only
     *
     * @param pid document identifier
     * @param index doc index in parent children
     */
    public void indexPid(String pid) {
        try {
            currentStatus.put("currentUuid", pid);
            currentStatus.put("status", "indexing");
            client = getClient("journal");
            SolrInputDocument idoc = createSolrDoc(pid);
            if (idoc != null) {
                try {
                    client.add(idoc);
                    LOGGER.log(Level.INFO, "indexed: {0}", new Object[]{++total});
                    currentStatus.put("msg", "Indexing. Actually indexing " + pid + ". Indexed docs: " + total);
                    writeStatus();
                    client.commit();
                } catch (SolrServerException | IOException ex) {
                    LOGGER.log(Level.FINE, "idoc: {0}", idoc);
                    LOGGER.log(Level.SEVERE, null, ex);
                }
            }
            client.close();
        } catch (IOException ex) {
            LOGGER.log(Level.SEVERE, null, ex);
        }
    }

    public SolrInputDocument createSolrDoc(String pid) {
        SolrInputDocument idoc = new SolrInputDocument();
        JSONObject mods = new JSONObject();
        try {
            idoc.addField("pid", pid);
            mods = getModsToJson(pid).getJSONObject("mods:modsCollection").getJSONObject("mods:mods");
            LOGGER.log(Level.FINE, "mods: {0}", mods);
            idoc.addField("kramerius_version", "k7");
            idoc.addField("mods", mods.toString());
            JSONObject item = getItem(pid);

            idoc.addField("datanode", item.has("ds.img_full.mime"));
            idoc.addField("model", item.optString("model"));
            response.increment(item.optString("model"));
            idoc.addField("root_title", item.optString("root.title"));
            idoc.addField("root_pid", item.optString("root.pid"));
            idoc.addField("idx", item.optInt("rels_ext_index.sort"));

            String parent = item.optString("own_parent.pid");
            idoc.addField("parents", parent);
            idoc.addField("model_paths", item.optString("own_model_path"));
            
            String own_pid_path = item.optString("own_pid_path");
            if (own_pid_path != null) {
                idoc.addField("pid_paths", own_pid_path);
                String[] parents = own_pid_path.split("/");
                    for (String p : parents) {
                        idoc.addField("parents", p);
                    }
            }

            idoc.setField("indexed_k", item.opt("indexed"));

            if ("application/pdf".equals(item.optString("ds.img_full.mime"))) {
                idoc.addField("url_pdf", item.optString("ds.img_full.mime"));
                getPdf(pid, idoc);
            }

//      JSONArray ctx = item.getJSONArray("context");
//      for (int i = 0; i < ctx.length(); i++) {
//        String model_path = "";
//        String pid_path = "";
//        JSONArray ja = ctx.getJSONArray(i);
//        if (ja.length() > 1) {
//          parent = ja.getJSONObject(ja.length() - 2).getString("pid");
//          idoc.addField("parents", parent);
//        }
//        for (int j = 0; j < ja.length(); j++) {
//          model_path += ja.getJSONObject(j).getString("model") + "/";
//          pid_path += ja.getJSONObject(j).getString("pid") + "/";
//        }
//        idoc.addField("model_paths", model_path);
//        idoc.addField("pid_paths", pid_path);
//      }
            setTitleInfo(idoc, mods);
            setNames(idoc, mods);
            setKeywords(idoc, mods);
            setAbstract(idoc, mods);
            setGenre(idoc, mods);
            setISSN(idoc, mods);
            setDateIssued(idoc, mods, pid, parent);

            if (dates.containsKey(parent) && dates.get(parent) != 0) {
                idoc.setField("year", dates.get(parent));
                dates.put(pid, dates.get(parent));
            } else {
                setDatum(idoc, mods, pid);
            }

            return idoc;
        } catch (JSONException ex) {
            LOGGER.log(Level.FINE, "idoc: {0}", idoc);
            LOGGER.log(Level.SEVERE, null, ex);
        } catch (Exception ex) {
            LOGGER.log(Level.SEVERE, "Error indexing pid: {0}", pid);
            LOGGER.log(Level.SEVERE, null, ex);
        }
        return null;
    }

    /**
     * Index doc and his children recursively. First find idx from parent
     *
     * @param pid
     * @return JSONObject with index info
     */
    public JSONObject indexDeep(String pid) {

        currentStatus.put("pid", pid);
        currentStatus.put("status", "indexing");
        response = new JSONObject();
        try {
            client = getClient("journal");
            Date tstart = new Date();
            indexPidAndChildren(pid);
            LOGGER.log(Level.INFO, "index finished. Indexed: {0}", total);

            response.put("msg", "total indexed " + total);
            Date tend = new Date();
            response.put("ellapsed time", FormatUtils.formatInterval(tend.getTime() - tstart.getTime()));
            currentStatus.put("status", "finished");
            currentStatus.put("msg", "total indexed " + total + " in " + FormatUtils.formatInterval(tend.getTime() - tstart.getTime()));
            writeStatus();
            client.close();
        } catch (IOException ex) {
            Logger.getLogger(IndexerK7.class.getName()).log(Level.SEVERE, null, ex);
            response.put("error", ex);
            currentStatus.put("status", "finished");
            currentStatus.put("msg", "error: " + ex);
            writeStatus();
        }
        return response;

    }

    private void indexPathUp(JSONArray ctx) {
        /*
    [
      [
        {"model":"periodical","pid":"uuid:440337bd-5625-11e1-9505-005056a60003"},
        {"model":"periodicalvolume","pid":"uuid:714c1b42-7b59-4697-9cf0-8fa8c9cc4eae"},
        {"model":"periodicalitem","pid":"uuid:47476091-fa64-4f0d-b6d8-c3cdb72a75da"}
      ]
    ]
         */
        for (int i = 0; i < ctx.length(); i++) {
            JSONArray ja = ctx.getJSONArray(i);
            for (int j = 0; j < ja.length() - 1; j++) {
                String pid = ja.getJSONObject(j).getString("pid");
                int idx = getIdx(pid, false);
                indexPid(pid);
            }
        }
    }

    public int getIdx(String pid, boolean up) {
        JSONObject item = getItem(pid);
        JSONArray ctx = item.getJSONArray("context");
        if (ctx.length() > 0) {
            JSONArray ja = ctx.getJSONArray(ctx.length() - 1);
            if (ja.length() > 1) {
                if (up) {
                    indexPathUp(ctx);
                }

                String ppid = ja.getJSONObject(ja.length() - 2).getString("pid");
                JSONObject pitem = getItem(ppid);
                JSONArray children = pitem.getJSONObject("structure").getJSONObject("children").getJSONArray("own");
                for (int i = 0; i < children.length(); i++) {
                    if (pid.equals(children.getJSONObject(i).getString("pid"))) {
                        return i;
                    }
                }
                return 0;
            } else {
                return 0;
            }

        } else {
            return 0;
        }
    }

    /**
     * Delete doc from index and his children
     *
     * @param pid
     */
    public JSONObject deletePidAndChildren(String pid) {

        JSONObject ret = new JSONObject();
        try (SolrClient solr = getClient("journal")) {
            String q = "pid_paths:*" + URLEncoder.encode(ClientUtils.escapeQueryChars(pid), "UTF-8") + "*";
            long num = solr.query(new SolrQuery(q)).getResults().getNumFound();
            ret = new JSONObject(solr.deleteByQuery(q).jsonStr());
            solr.commit();
            ret.put("msg", "deleted " + num + " documents");
        } catch (SolrServerException | IOException ex) {
            ret.put("error", ex);
            LOGGER.log(Level.SEVERE, null, ex);
        }
        return ret;

    }

    /**
     * Index doc and his children recursively
     *
     * @param pid
     */
    private void indexPidAndChildren(String pid) {
        // JSONObject item =  getItem(pid);
        indexPid(pid);
        JSONArray children = getChildren(pid);
        for (int i = 0; i < children.length(); i++) {
            JSONObject child = children.getJSONObject(i);
            if (!child.has("ds.img_full.mime")) {
                indexPidAndChildren(children.getJSONObject(i).getString("pid"));
            } else {
                indexPid(child.getString("pid"));
            }
        }
    }

    /**
     * Retrieve and converts BIBLIO_MODS to JSON Object
     *
     * @param pid
     * @return JSON representation of xml
     */
    public JSONObject getModsToJson(String pid) {
        try {
// https://k7.inovatika.dev/search/api/client/v7.0/items/uuid:57976e35-5078-4d1b-86b2-cf59060f0c0a/metadata/mods
            String k5host = opts.getString(apiPointKey)
                    + "/items/" + pid + "/metadata/mods";
            Map<String, String> reqProps = new HashMap<>();
            reqProps.put("Content-Type", "application/json");
            //reqProps.put("Accept", "application/json");
            InputStream inputStream = RESTHelper.inputStream(k5host, reqProps);
            String modsXml = org.apache.commons.io.IOUtils.toString(inputStream, Charset.forName("UTF-8"));
            return XML.toJSONObject(modsXml);
        } catch (JSONException | IOException ex) {
            LOGGER.log(Level.SEVERE, null, ex);
            return null;
        }
    }

    /**
     * Retrieve and index Pdf stream
     *
     * @param pid
     * @return JSON representation of xml
     */
    public void getPdf(String pid, SolrInputDocument idoc) {
        try {

            String k5host = opts.getString(apiPointKey)
                    + "/items/" + pid + "/image";
            Map<String, String> reqProps = new HashMap<>();
//      reqProps.put("Content-Type", "application/json");
//      reqProps.put("Accept", "application/json");
            InputStream is = RESTHelper.inputStream(k5host, reqProps);

            try (PDDocument pdfDocument = PDDocument.load(is)) {
                PDFTextStripper stripper = new PDFTextStripper();

                StringWriter writer = new StringWriter();
                stripper.writeText(pdfDocument, writer);

                String contents = writer.getBuffer().toString();
                //StringReader reader = new StringReader(contents);

                idoc.addField("ocr", contents);
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, null, e);
            }
        } catch (JSONException | IOException ex) {
            LOGGER.log(Level.SEVERE, null, ex);
        }
    }

    private JSONObject getItem(String pid) {
        try {

            String k5host = opts.getString(apiPointKey)
                    + "/search?q=pid:" + URLEncoder.encode(ClientUtils.escapeQueryChars(pid), "UTF-8");
            Map<String, String> reqProps = new HashMap<>();
            reqProps.put("Content-Type", "application/json");
            // reqProps.put("Accept", "application/json");
            InputStream inputStream = RESTHelper.inputStream(k5host, reqProps);
            JSONObject resp = new JSONObject(org.apache.commons.io.IOUtils.toString(inputStream, Charset.forName("UTF-8")));
            return resp.getJSONObject("response").getJSONArray("docs").getJSONObject(0);
        } catch (JSONException | IOException ex) {
            LOGGER.log(Level.SEVERE, null, ex);
            return null;
        }
    }

    private JSONArray getChildren(String pid) {
        try {

//            String k5host = opts.getString(apiPointKey)
//                    + "/search?rows=1000&q=own_parent.pid:" + ClientUtils.escapeQueryChars(pid);
            String k5host = opts.getString(apiPointKey)
                    + "/search?rows=1000&q=own_parent.pid:" + URLEncoder.encode( ClientUtils.escapeQueryChars(pid), "UTF-8");
            Map<String, String> reqProps = new HashMap<>();
            reqProps.put("Content-Type", "application/json");
            reqProps.put("Accept", "application/json");
            InputStream inputStream = RESTHelper.inputStream(k5host, reqProps);

            JSONObject resp = new JSONObject(org.apache.commons.io.IOUtils.toString(inputStream, Charset.forName("UTF-8")));
            return resp.getJSONObject("response").getJSONArray("docs");

        } catch (JSONException | IOException ex) {
            LOGGER.log(Level.SEVERE, null, ex);
            return null;
        }
    }

    private void setTitleInfo(SolrInputDocument idoc, JSONObject mods) {

        String prefix = "mods:";
        Object o = mods.opt("mods:titleInfo");
        if (o == null) {
            prefix = "";
            o = mods.opt("titleInfo");
        }
        if (o instanceof JSONObject) {
            JSONObject jo = (JSONObject) o;
            idoc.setField("title", jo.optString(prefix + "title"));
            idoc.setField("subtitle", jo.optString(prefix + "subTitle"));
            idoc.setField("non_sort_title", jo.optString(prefix + "nonSort"));

        } else if (o instanceof JSONArray) {
            JSONArray ja = (JSONArray) o;
            boolean hasDefault = false;
            for (int i = 0; i < ja.length(); i++) {
                JSONObject jo = ja.getJSONObject(i);
                if (jo.has("lang")) {
                    if (jo.has("type") && "alternative".equals(jo.getString("type"))) {
                        //Mozna chceme jeste pridat alternativni titulek
                    } else {
                        String lang = jo.optString("lang");
                        idoc.setField("title_" + lang, jo.optString(prefix + "title"));
                        idoc.setField("subtitle_" + lang, jo.optString(prefix + "subTitle"));
                        idoc.setField("non_sort_title_" + lang, jo.optString(prefix + "nonSort"));
                    }
                } else {
                    if (!hasDefault) {
                        idoc.setField("title", jo.optString(prefix + "title"));
                        idoc.setField("subtitle", jo.optString(prefix + "subTitle"));
                        idoc.setField("non_sort_title", jo.optString(prefix + "nonSort"));
                        hasDefault = true;
                    }
                }
            }
            if (!hasDefault) {
                JSONObject jo = ja.getJSONObject(0);
                idoc.setField("title", jo.optString(prefix + "title"));
                idoc.setField("subtitle", jo.optString(prefix + "subTitle"));
                idoc.setField("non_sort_title", jo.optString(prefix + "nonSort"));
            }
        }

    }

    private void processTopic(SolrInputDocument idoc, String prefix, JSONObject joTopic) {
        String lang = null;
        String content = null;
        if (joTopic.has("lang")) {
            lang = "_" + joTopic.optString("lang");
        }

        if (joTopic.has("content")) {
            content = joTopic.optString("content");
            if (lang != null) {
                idoc.addField("keywords" + lang, content);
                addUniqueToDoc(idoc, "keywords" + lang, content);
            }
//      idoc.addField("keywords", content);
            addUniqueToDoc(idoc, "keywords", content);
        }
    }

    private void processSubject(SolrInputDocument idoc, String prefix, JSONObject subject) {
        if ("Konspekt".equalsIgnoreCase(subject.optString("authority"))) {
            // Ignore konspekt
            return;
        }
        try {
            if (subject.has(prefix + "topic")) {
                Object oTopic = subject.get(prefix + "topic");
                if (oTopic instanceof JSONObject) {
                    JSONObject joTopic = (JSONObject) oTopic;
                    processTopic(idoc, prefix, joTopic);
                } else if (oTopic instanceof JSONArray) {
                    JSONArray jaTopic = (JSONArray) oTopic;
                    for (int i = 0; i < jaTopic.length(); i++) {
                        Object o2 = jaTopic.get(i);
                        if (o2 instanceof JSONObject) {
                            processTopic(idoc, prefix, (JSONObject) o2);
                        } else {
//            idoc.addField("keywords", o2);
                            addUniqueToDoc(idoc, "keywords", o2);

                        }
                    }
                } else if (oTopic instanceof String) {
//        idoc.addField("keywords", oTopic);
                    addUniqueToDoc(idoc, "keywords", oTopic);
                }
            }

//      {"mods:geographic": "Czechia"},
            if (subject.has(prefix + "geographic")) {
                //Test geographic
                //idoc.addField("keywords", subject.optString(prefix + "geographic"));
                addUniqueToDoc(idoc, "keywords", subject.optString(prefix + "geographic"));
            }

//      {"mods:temporal": "1942-2012"},
//      {
//        "authority": "czenas",
//        "mods:temporal": "20.-21. století"
//      },
            if (subject.has(prefix + "temporal")) {
                //Test temporal
//      idoc.addField("keywords", subject.optString(prefix + "temporal"));
                addUniqueToDoc(idoc, "keywords", subject.optString(prefix + "temporal"));
            }

//      {
//        "mods:name": {
//          "type": "personal",
//          "mods:namePart": [
//            "Nosek, Bedřich",
//            {
//              "type": "date",
//              "content": "1942-"
//            }
//          ]
//        },
//        "authority": "czenas"
//      }
// a nebo
//            mods:name": {
//                "type": "personal",
//                "mods:namePart": [
//                  {
//                    "type": "termsOfAddress",
//                    "content": "česká a uherská královna, císařovna, choť Františka Štěpána I., římskoněmeckého císaře"
//                  },
//                  "Marie Terezie",
//                  {
//                    "type": "date",
//                    "content": "1717-1780"
//                  }
//                ]
//              },
            if (subject.has(prefix + "name")) {
                //Test name
//      idoc.addField("keywords", subject.optString(prefix + "name"));
                JSONObject joName = subject.optJSONObject(prefix + "name");
                Object np = joName.opt(prefix + "namePart");
                if (np != null) {
                    if (np instanceof JSONArray) {
                        JSONArray janp = (JSONArray) np;
                        for (int i = 0; i < janp.length(); i++) {
                            Object cont = janp.get(i);
                            if (cont instanceof String) {
                                addUniqueToDoc(idoc, "keywords", janp.optString(i) + ", " + janp.getJSONObject(i + 1).optString("content"));
                                i++;
                            } else {
                                addUniqueToDoc(idoc, "keywords", janp.getJSONObject(i).optString("content"));
                            }
                        }

                    } else if (np instanceof String) {
                        addUniqueToDoc(idoc, "keywords", np);
                    }
                }

            }
        } catch (Exception ex) {
            LOGGER.log(Level.SEVERE, "error processing subject {0}", idoc.getFieldValue("pid"));
            LOGGER.log(Level.SEVERE, null, ex);
        }

    }

    private void setKeywords(SolrInputDocument idoc, JSONObject mods) {
        String prefix = "mods:";
        Object o = mods.opt("mods:subject");
        if (o == null) {
            prefix = "";
            o = mods.opt("subject");
        }

        if (o instanceof JSONObject) {
            processSubject(idoc, prefix, (JSONObject) o);
        } else if (o instanceof JSONArray) {
            JSONArray ja = (JSONArray) o;
            for (int i = 0; i < ja.length(); i++) {
                processSubject(idoc, prefix, ja.getJSONObject(i));
            }
        }
    }

    private void addUniqueToDoc(SolrInputDocument idoc, String field, Object value) {
        if (idoc.getField(field) == null) {
            idoc.addField(field, value);
        } else if (!idoc.getFieldValues(field).contains(value)) {
            idoc.addField(field, value);
        }
    }

    private void setAbstract(SolrInputDocument idoc, JSONObject mods) {

        String prefix = "mods:";
        Object o = mods.opt("mods:abstract");
        if (o == null) {
            prefix = "";
            o = mods.opt("abstract");
        }

        if (o instanceof JSONObject) {
            JSONObject jo = (JSONObject) o;
            if (jo.has("lang")) {
                String lang = jo.optString("lang");
                idoc.addField("abstract_" + lang, jo.optString("content"));
            }
            idoc.addField("abstract", jo.optString("content"));

        } else if (o instanceof String) {
            idoc.addField("abstract", o);
        }
    }

    private void setNames(SolrInputDocument idoc, JSONObject mods) {

        String prefix = "mods:";
        Object o = mods.opt("mods:name");
        if (o == null) {
            prefix = "";
            o = mods.opt("name");
        }
        if (o instanceof JSONObject) {
            JSONObject jo = (JSONObject) o;
            if (jo.has("type") && "personal".equals(jo.getString("type")) && jo.has(prefix + "namePart")) {
                Object np = jo.get(prefix + "namePart");
                String autorName = namePart(np);
                idoc.addField("autor", autorName);
                JSONObject af = new JSONObject()
                        .put("name", autorName);
                if (jo.has(prefix + "role")) {
                    String role = jo.getJSONObject(prefix + "role").getJSONObject(prefix + "roleTerm").getString("content");
                    af.put("role", role);
                }
                idoc.addField("autor_full", af.toString());
            }
        } else if (o instanceof JSONArray) {
            JSONArray ja = (JSONArray) o;
            for (int i = 0; i < ja.length(); i++) {
                JSONObject jo = ja.getJSONObject(i);
                if (jo.has("type") && "personal".equals(jo.getString("type")) && jo.has(prefix + "namePart")) {

                    Object np = jo.get(prefix + "namePart");
                    String autorName = namePart(np);
                    idoc.addField("autor", autorName);
                    JSONObject af = new JSONObject()
                            .put("name", autorName);
                    if (jo.has(prefix + "role")) {
                        String role = jo.getJSONObject(prefix + "role").getJSONObject(prefix + "roleTerm").getString("content");
                        af.put("role", role);
                    }
                    idoc.addField("autor_full", af.toString());
                }
            }
        }
    }

    private String namePart(Object np) {
        String autor = "";
        if (np instanceof JSONArray) {
            JSONArray npja = (JSONArray) np;

            Object first = npja.get(0);
            if (first instanceof JSONObject) {
                if (((JSONObject) first).getString("type").equals("family")) {
                    autor = npja.getJSONObject(0).getString("content") + ", "
                            + npja.getJSONObject(1).getString("content");
                } else {

                    autor = npja.getJSONObject(1).getString("content") + ", "
                            + npja.getJSONObject(0).getString("content");
                }
            } else if (first instanceof String) {
                autor = (String) first;
            }
        } else if (np instanceof String) {
            autor = (String) np;
        }
        return autor;
    }

    private void setGenre(SolrInputDocument idoc, JSONObject mods) {

        //String prefix = "mods:";
        Object o = mods.opt("mods:genre");
//        boolean hasMain = false;
        if (o != null) {
            if (o instanceof JSONArray) {
                JSONArray ja = (JSONArray) o;
                for (int i = 0; i < ja.length(); i++) {
                    Object go = ja.get(i);
                    if (go instanceof JSONObject) {
                        String g = ja.getJSONObject(i).optString("type");
                        if (g != null && !"".equals(g)) {
//                            if ("main article".equals(g) && !hasMain) {
                            idoc.addField("genre", g);
//                                hasMain = true;
//                            }
                        }
                    } else if (go instanceof String) {
                        if ("article".equals((String) go)) {
                            idoc.addField("genre", "article");
//                            hasMain = true;
                        }
                    }
                }

            } else if (o instanceof JSONObject) {
                String g = ((JSONObject) o).optString("type");
                if (g != null) {
                    idoc.addField("genre", g);
                } else {
                    idoc.addField("genre", "unspecified");
                }
            } else if (o instanceof String) {
                if ("article".equals(o)) {
                    idoc.addField("genre", "unspecified");
                } else {
                    idoc.addField("genre", o);
                }

            }
        }
    }

    private void setISSN(SolrInputDocument idoc, JSONObject mods) {

        String prefix = "mods:";
        Object o = mods.opt(prefix + "identifier");
        if (o == null) {
            prefix = "";
            o = mods.opt("identifier");
        }
        if (o instanceof JSONObject) {
            JSONObject jo = (JSONObject) o;
            if (jo.has("type") && jo.optString("type").equals("issn")) {
                idoc.addField("issn", jo.optString("content"));
            }
        }
    }

    private void setDateIssued(SolrInputDocument idoc, JSONObject mods, String pid, String parent) {
        String val = null;
        JSONObject o = mods.optJSONObject("mods:originInfo");
        if (o != null) {
            if (o.has("mods:dateIssued")) {
                Object di = o.get("mods:dateIssued");
                if (di instanceof JSONObject ) {
                    val = ((JSONObject) di).optString("content");
                } else {
                    val = o.optString("mods:dateIssued");
                }
                
            }
        }

        if (val == null) {
            //Pokus starych zaznamu
            o = mods.optJSONObject("mods:part");
            if (o != null) {
                if (o.has("mods:date")) {
                    val = o.optString("mods:date");
                }
            }
        }

        if ((val == null || "".equals(val)) && dateIssued.containsKey(parent)) {
            val = dateIssued.get(parent);
            dateIssued.put(pid, dateIssued.get(parent));
        }

        if (val != null || "".equals(val)) {
            idoc.addField("dateIssued", val);
            dateIssued.put(pid, val);
        }
    }

    private void setDatum(SolrInputDocument idoc, JSONObject mods, String pid) {
        int year = 0;
        JSONObject o = mods.optJSONObject("mods:originInfo");
        if (o != null) {
            int date = o.optInt("mods:dateIssued", 0);
            if (date > 0) {
                dates.put(pid, date);
                idoc.setField("year", date);
            }
        }

        if (year == 0) {
            //Pokus starych zaznamu
            o = mods.optJSONObject("mods:part");
            if (o != null) {

                int date = o.optInt("mods:date");
                if (date > 0) {
                    dates.put(pid, date);
                    idoc.setField("year", date);
                }
            }
        }
    }

    private void setDatum(SolrInputDocument idoc, String parent) {
        if (dates.containsKey(parent)) {
            idoc.setField("year", dates.get(parent));
        }
    }

    /**
     * Index magazine
     *
     * @param json doc in json format
     */
    public JSONObject indexMagazine(JSONObject json) {
        JSONObject ret = new JSONObject();
        try (SolrClient solr = getClient("magazines")) {
            SolrInputDocument idoc = new SolrInputDocument();
            for (Object key : json.keySet()) {
                String name = (String) key;
                if (null == name) {
                    //idoc.addField(name, json.get(name));
                } else {
                    switch (name) {
                        case "titleCS":
                            break;
                        case "_version_":
                            break;
                        case "keywords":
                            JSONArray ja = json.getJSONArray(name);
                            for (int i = 0; i < ja.length(); i++) {
                                idoc.addField("keywords", ja.get(i).toString());
                            }

                            break;
                        default:
                            idoc.addField(name, json.get(name));
                            break;
                    }
                }
            }
            LOGGER.info(idoc.toString());
            solr.add(idoc);
            solr.commit();
            ret.put("success", "magazine saved");
        } catch (SolrServerException | IOException ex) {
            ret.put("error", ex);
            LOGGER.log(Level.SEVERE, null, ex);
        }
        return ret;
    }

    /**
     * Delete editor
     *
     * @param id editor id
     */
    public JSONObject deleteEditor(String id) {

        JSONObject ret = new JSONObject();
        try (SolrClient solr = getClient("editors")) {
            solr.deleteById(id);
            solr.commit();
            ret.put("success", "editor deleted");
        } catch (SolrServerException | IOException ex) {
            ret.put("error", ex);
            LOGGER.log(Level.SEVERE, null, ex);
        }
        return ret;
    }

    /**
     * Delete magazine
     *
     * @param json doc in json format
     */
    public JSONObject deleteMagazine(String ctx) {

        JSONObject ret = new JSONObject();
        try (SolrClient solr = getClient("magazines")) {
            solr.deleteById(ctx);
            solr.commit();

            // Delete folder in config
            String filename = InitServlet.CONFIG_DIR + File.separator + ctx;
            File f = new File(filename);
            if (f.exists()) {
                FileUtils.deleteDirectory(f);
            }
            ret.put("success", "magazine deleted");
        } catch (SolrServerException | IOException ex) {
            ret.put("error", ex);
            LOGGER.log(Level.SEVERE, null, ex);
        }
        return ret;
    }

    /**
     * Index editor
     *
     * @param json doc in json format
     */
    public JSONObject indexEditor(JSONObject json) {
        JSONObject ret = new JSONObject();
        try (SolrClient solr = getClient("editors")) {
            SolrInputDocument idoc = new SolrInputDocument();
            for (Object key : json.keySet()) {
                String name = (String) key;
                if (null == name) {
                    //idoc.addField(name, json.get(name));
                } else {
                    switch (name) {
                        case "nameCs":
                            break;
                        case "_version_":
                            break;
                        default:
                            idoc.setField(name, json.get(name));
                            break;
                    }
                }
            }
            LOGGER.info(idoc.toString());
            solr.add(idoc);
            solr.commit();
            ret.put("success", "magazine saved");
        } catch (SolrServerException | IOException ex) {
            ret.put("error", ex);
            LOGGER.log(Level.SEVERE, null, ex);
        }
        return ret;
    }

    /**
     * Index user
     *
     * @param json doc in json format
     */
    public JSONObject indexUser(JSONObject json) {
        JSONObject ret = new JSONObject();
        try (SolrClient solr = getClient("users")) {
            SolrInputDocument idoc = new SolrInputDocument();
            for (Object key : json.keySet()) {
                String name = (String) key;
                if (null == name) {
                    //idoc.addField(name, json.get(name));
                } else {
                    switch (name) {
                        case "index_time":
                            break;
                        case "_version_":
                            break;
                        default:
                            idoc.setField(name, json.get(name));
                            break;
                    }
                }
            }
            LOGGER.info(idoc.toString());
            solr.add(idoc);
            solr.commit();
            ret.put("success", "user saved");
        } catch (SolrServerException | IOException ex) {
            ret.put("error", ex);
            LOGGER.log(Level.SEVERE, null, ex);
        }
        return ret;
    }

    /**
     * Index json
     *
     * @param jo string
     * @return JSONObject with index info
     */
    private JSONObject indexJson(String jo, String core) {

        LOGGER.log(Level.INFO, jo);
        JSONObject ret = new JSONObject();

        try {
            String url = opts.getString("solr.host", "http://localhost:8983/solr/")
                    + core + "/update/json/docs?commit=true";

            CloseableHttpClient client = HttpClients.createDefault();
            HttpPost post = new HttpPost(url);
            post.setHeader("Accept", "application/json");
            post.setHeader("Content-type", "application/json");

            post.setEntity(new StringEntity(jo, "UTF-8"));

            HttpResponse response = client.execute(post);
            LOGGER.log(Level.INFO, "Sending 'POST' request to URL : " + url);
            LOGGER.log(Level.INFO, "Post parameters : " + post.getEntity());
            LOGGER.log(Level.INFO, "Response Code : "
                    + response.getStatusLine().getStatusCode());

            BufferedReader rd = new BufferedReader(
                    new InputStreamReader(response.getEntity().getContent()));
            StringBuilder result = new StringBuilder();
            String line = "";
            while ((line = rd.readLine()) != null) {
                result.append(line);
            }

            //print result
            LOGGER.log(Level.INFO, result.toString());
            ret = new JSONObject(result.toString());

        } catch (IOException | UnsupportedOperationException | UnsupportedCharsetException | JSONException ex) {
            LOGGER.log(Level.SEVERE, null, ex);
            ret.put("error", ex);
        }

        LOGGER.log(Level.INFO, "index finished. Indexed: {0}", total);

        return ret;
    }

    public JSONObject updateJournal(String pid) {
        LOGGER.log(Level.INFO, "Updating pid {0}", pid);
        try {

            // Check if uuid is in our index
            Options opts = Options.getInstance();

            String index_time;
            try (SolrClient solr = new HttpSolrClient.Builder(String.format("%s%s",
                    opts.getString("solr.host", "http://localhost:8983/solr/"),
                    "journal")).build()) {
                String q = "root_pid:\"" + pid + "\"";
                SolrQuery query = new SolrQuery(q)
                        .setRows(1)
                        .setSort("indexed_k", SolrQuery.ORDER.desc);
                SolrDocumentList docs = solr.query(query).getResults();
                long num = docs.getNumFound();
                if (num == 0) {
                    LOGGER.log(Level.WARNING, "Not in index {0}", pid);
                    return new JSONObject().put("error", "Not in index");
                } else {
                    Date d = (Date) docs.get(0).getFirstValue("indexed_k");
                    index_time = d.toInstant().toString();
                }
            } catch (SolrServerException | IOException ex) {
                LOGGER.log(Level.SEVERE, null, ex);
                return new JSONObject().put("error", ex);
            }

            String k5host = opts.getString(apiPointKey)
                    + "/search?fq=model:periodicalvolume%20OR%20model:periodicalitem&fq=indexed:" + URLEncoder.encode("[" + index_time + " TO NOW]", "UTF-8") + "&q=root.pid:" + URLEncoder.encode(ClientUtils.escapeQueryChars(pid), "UTF-8");
            Map<String, String> reqProps = new HashMap<>();
            reqProps.put("Content-Type", "application/json");
            // reqProps.put("Accept", "application/json");
            InputStream inputStream = RESTHelper.inputStream(k5host, reqProps);
            JSONObject resp = new JSONObject(org.apache.commons.io.IOUtils.toString(inputStream, Charset.forName("UTF-8")));
            JSONArray jDocs = resp.getJSONObject("response").getJSONArray("docs");
            if (jDocs.length() == 0) {
                LOGGER.log(Level.INFO, "Nothing to index {0}", index_time);
            }
            for (int i = 0; i < jDocs.length(); i++) {
                JSONObject jDoc = jDocs.getJSONObject(i);
                indexDeep(jDoc.getString("pid"));
            }
            return resp;//.getJSONObject("response").getJSONArray("docs").getJSONObject(0);
        } catch (JSONException | IOException ex) {
            LOGGER.log(Level.SEVERE, null, ex);
            return new JSONObject().put("error", ex);
        }
    }
}
