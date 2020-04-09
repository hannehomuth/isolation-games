/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.homuth.games.server.model.painter;

import java.util.Base64;
import javax.json.Json;
import javax.json.JsonObject;
import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

/**
 *
 * @author jhomuth
 */
public class CanvasEncoder implements Encoder.Text<CanvasImage> {

  @Override
  public String encode(CanvasImage line) throws EncodeException {

      JsonObject jsonObject = Json.createObjectBuilder()
        .add("imageData", line.getImageData())
        .add("action", line.getAction()).build();
    return jsonObject.toString();

  }

  @Override
  public void init(EndpointConfig ec) {
    System.out.println("MessageEncoder - init method called");
  }

  @Override
  public void destroy() {
    System.out.println("MessageEncoder - destroy method called");
  }

}