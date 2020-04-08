/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.homuth.games.server.model.painter;

import javax.json.Json;
import javax.json.JsonObject;
import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

/**
 *
 * @author jhomuth
 */
public class LineEncoder implements Encoder.Text<Line> {

  @Override
  public String encode(Line line) throws EncodeException {

      JsonObject jsonObject = Json.createObjectBuilder()
        .add("x", line.getX())
        .add("y", line.getY())
        .add("r", line.getR())
        .add("g", line.getG())
        .add("b", line.getB()).build();
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