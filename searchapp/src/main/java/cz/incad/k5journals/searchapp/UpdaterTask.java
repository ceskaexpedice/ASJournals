/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package cz.incad.k5journals.searchapp;

import static cz.incad.k5journals.searchapp.IndexerK7.LOGGER;
import java.io.IOException;
import java.util.TimerTask;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.json.JSONException;

/**
 *
 * @author alberto
 */
public class UpdaterTask extends TimerTask {

  @Override
  public void run() {
    
    try {
      Options opts = Options.getInstance();
      try (SolrClient solr = new HttpSolrClient.Builder(String.format("%s%s",
              opts.getString("solr.host", "http://localhost:8983/solr/"),
              "magazines")).build()) {
        String q = "*";
        SolrQuery query = new SolrQuery(q)
                .addFilterQuery("checkUpdates:true")
                .setRows(100);
        SolrDocumentList docs = solr.query(query).getResults();
        for (SolrDocument doc : docs) {
          boolean k7 = "k7".equals((String) doc.getFirstValue("journal"));
          if (k7) {
            IndexerK7 indexer = new IndexerK7();
            indexer.updateJournal((String) doc.getFirstValue("journal"));
          } else {
            Indexer indexer = new Indexer();
            indexer.updateJournal((String) doc.getFirstValue("journal"));
          }
        }
      } catch (SolrServerException | IOException ex) {
        LOGGER.log(Level.SEVERE, null, ex);
      }
      
    } catch (IOException ex) {
      Logger.getLogger(UpdaterTask.class.getName()).log(Level.SEVERE, null, ex);
    } catch (JSONException ex) {
      Logger.getLogger(UpdaterTask.class.getName()).log(Level.SEVERE, null, ex);
    }
  }
}